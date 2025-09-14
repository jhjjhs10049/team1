import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    getPublicChatRooms,
    searchChatRooms,
    getMyChatRooms,
    joinChatRoom,
} from "../api/multChatApi";
import useMultChatWebSocket from "./useMultChatWebSocket";
import websocketService from "../services/multChatWebSocketService";
import { WEBSOCKET_DESTINATIONS } from "../../global/constants/websocketDestinations";
import { MultChatEventBus, MultChatEvents } from "../services/multChatEventBus";

const useRoomListLogic = () => {
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState([]);
    const [myRooms, setMyRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentTab, setCurrentTab] = useState("public");
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
    });

    // 비밀번호 모달 상태
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    // 웹소켓 Hook 사용 (목록 페이지용 - isInRoom: false)
    const { isWebSocketConnected, registerRoomUpdateCallback } =
        useMultChatWebSocket(null, false);

    // 실시간 채팅방 정보 상태
    const [realTimeRoomInfo, setRealTimeRoomInfo] = useState(new Map());

    // 🔧 웹소켓 연결 확인 및 재연결 함수
    const checkAndReconnectWebSocket = useCallback(async () => {
        console.log("🔍 웹소켓 연결 상태 체크...");
        console.log("Hook 상태:", isWebSocketConnected);
        console.log("Service 상태:", websocketService.isWebSocketConnected());

        if (!isWebSocketConnected || !websocketService.isWebSocketConnected()) {
            console.log("🔄 웹소켓 재연결 시도...");
            try {
                await websocketService.connect();
                console.log("✅ 웹소켓 재연결 성공");
            } catch (error) {
                console.error("❌ 웹소켓 재연결 실패:", error);
            }
        } else {
            console.log("✅ 웹소켓 정상 연결됨");
        }
    }, [isWebSocketConnected]);

    // 웹소켓 실시간 업데이트 콜백 등록
    useEffect(() => {
        if (!registerRoomUpdateCallback) return;
        const handleRoomUpdate = (notification) => {
            if (
                notification === null ||
                notification === undefined ||
                typeof notification !== "object"
            ) {
                return;
            }

            if (!notification.type) {
                return;
            }

            if (notification.type === "ROOM_PARTICIPANT_COUNT_UPDATE") {
                setRealTimeRoomInfo((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(notification.roomNo, {
                        currentParticipants: notification.currentParticipants,
                        lastUpdated: new Date().toISOString(),
                    });
                    return newMap;
                });

                const updateRoomList = (rooms) =>
                    rooms.map((room) =>
                        room.no === notification.roomNo
                            ? {
                                ...room,
                                currentParticipants: notification.currentParticipants,
                            }
                            : room
                    );

                setChatRooms((prev) => updateRoomList(prev));
                setMyRooms((prev) => updateRoomList(prev));
            }
        };

        registerRoomUpdateCallback(handleRoomUpdate);
    }, [registerRoomUpdateCallback]);

    // in-room 훅에서 발행하는 전역 이벤트도 수신하여 즉시 반영
    useEffect(() => {
        const unsub = MultChatEventBus.on(
            MultChatEvents.ROOM_PARTICIPANT_COUNT_UPDATE,
            ({ roomNo, currentParticipants }) => {
                setRealTimeRoomInfo((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(roomNo, {
                        currentParticipants,
                        lastUpdated: new Date().toISOString(),
                    });
                    return newMap;
                });

                const updateRoomList = (rooms) =>
                    rooms.map((room) =>
                        room.no === roomNo
                            ? { ...room, currentParticipants }
                            : room
                    );
                setChatRooms((prev) => updateRoomList(prev));
                setMyRooms((prev) => updateRoomList(prev));
            }
        );

        return () => {
            if (typeof unsub === "function") unsub();
        };
    }, []);

    // 글로벌 채팅방 리스트 업데이트 구독
    useEffect(() => {
        console.log("🔍 [DEBUG] 웹소켓 연결 상태:", isWebSocketConnected);

        if (!isWebSocketConnected) {
            console.log("⚠️ 웹소켓이 연결되지 않아 글로벌 구독을 시작할 수 없습니다.");
            return;
        }

        const globalUpdateDestination = WEBSOCKET_DESTINATIONS.TOPIC.MULT_CHAT_ROOMS_UPDATES;
        console.log("📡 글로벌 채팅방 리스트 업데이트 구독 시작:", globalUpdateDestination);

        if (!websocketService.isWebSocketConnected()) {
            console.error("❌ websocketService가 연결되지 않음!");
            return;
        }

        const subscription = websocketService.subscribe(
            globalUpdateDestination,
            (notification) => {
                console.log("📥 글로벌 채팅방 업데이트 수신:", notification);

                if (!notification || typeof notification !== "object") {
                    console.warn("⚠️ 잘못된 글로벌 업데이트 알림 형식:", notification);
                    return;
                }

                const { type, roomNo, roomData } = notification;

                // 참가자 수 업데이트 처리
                if (type === "PARTICIPANTS_UPDATED" && roomData?.currentParticipants !== undefined) {
                    console.log(`📊 채팅방 ${roomNo} 참가자 수 업데이트: ${roomData.currentParticipants}명`);

                    // 🔥 참가자 수가 0이 된 경우 채팅방을 목록에서 제거
                    if (roomData.currentParticipants === 0) {
                        console.log(`🗑️ 참가자 수 0으로 인한 채팅방 ${roomNo} 자동 제거`);

                        setChatRooms((prev) => {
                            const filtered = prev.filter((room) => room.no !== roomNo);
                            console.log(`🗑️ 공개 채팅방 목록에서 자동 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
                            return filtered;
                        });

                        setMyRooms((prev) => {
                            const filtered = prev.filter((room) => room.no !== roomNo);
                            console.log(`🗑️ 내 채팅방 목록에서 자동 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
                            return filtered;
                        });

                        setRealTimeRoomInfo((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(roomNo);
                            console.log(`🗑️ 실시간 정보에서 자동 제거: ${roomNo}`);
                            return newMap;
                        });

                        return;
                    }

                    setRealTimeRoomInfo((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(roomNo, {
                            currentParticipants: roomData.currentParticipants,
                            lastUpdated: new Date().toISOString(),
                        });
                        return newMap;
                    });

                    const updateRoomList = (rooms) =>
                        rooms.map((room) =>
                            room.no === roomNo
                                ? {
                                    ...room,
                                    currentParticipants: roomData.currentParticipants,
                                }
                                : room
                        );

                    setChatRooms((prev) => updateRoomList(prev));
                    setMyRooms((prev) => updateRoomList(prev));
                }

                // 새로운 채팅방 생성 처리
                else if (type === "ROOM_CREATED" && roomData) {
                    console.log(`🆕 새로운 채팅방 생성: ${roomData.roomName} (${roomNo})`);

                    if (currentTab === "public") {
                        setChatRooms((prev) => [roomData, ...prev]);
                    }
                }

                // 채팅방 삭제 처리 (방장이 나간 경우)
                else if (type === "ROOM_DELETED") {
                    console.log(`🗑️ 채팅방 삭제됨: ${roomNo} (방장이 나감)`);
                    console.log("🔍 [DEBUG] ROOM_DELETED 이벤트 상세:", { type, roomNo, roomData, notification });

                    setChatRooms((prev) => {
                        const filtered = prev.filter((room) => room.no !== roomNo);
                        console.log(`🗑️ 공개 채팅방 목록에서 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
                        console.log("🔍 [DEBUG] 제거된 방 번호:", roomNo);
                        console.log("🔍 [DEBUG] 제거 전 방 목록:", prev.map(r => r.no));
                        console.log("🔍 [DEBUG] 제거 후 방 목록:", filtered.map(r => r.no));
                        return filtered;
                    });

                    setMyRooms((prev) => {
                        const filtered = prev.filter((room) => room.no !== roomNo);
                        console.log(`🗑️ 내 채팅방 목록에서 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
                        return filtered;
                    });

                    setRealTimeRoomInfo((prev) => {
                        const newMap = new Map(prev);
                        const hadInfo = newMap.has(roomNo);
                        newMap.delete(roomNo);
                        console.log(`🗑️ 실시간 정보에서 제거: ${roomNo} (이전 존재 여부: ${hadInfo})`);
                        return newMap;
                    });

                    alert(`채팅방이 삭제되었습니다. (방 번호: ${roomNo})`);
                }

                else {
                    console.log(`📥 알 수 없는 글로벌 업데이트 타입: ${type}`, notification);
                }
            }
        );

        console.log("📡 글로벌 채팅방 업데이트 구독 설정 완료");

        return () => {
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
                console.log("📡 글로벌 채팅방 리스트 업데이트 구독 해제");
            }
        };
    }, [isWebSocketConnected, currentTab]);

    // 공개 채팅방 목록 조회
    const loadPublicChatRooms = useCallback(
        async (page = 0, keyword = "") => {
            setLoading(true);
            setError(null);

            try {
                let data;
                if (keyword.trim()) {
                    data = await searchChatRooms(keyword, page, pagination.size);
                } else {
                    data = await getPublicChatRooms(page, pagination.size);
                }

                setChatRooms(data.content || []);
                setPagination({
                    page: data.number || 0,
                    size: data.size || 20,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0,
                    hasNext: !data.last,
                });
            } catch (err) {
                console.error("채팅방 목록 조회 실패:", err);
                setError("채팅방 목록을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        },
        [pagination.size]
    );

    // 내 채팅방 목록 조회
    const loadMyChatRooms = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getMyChatRooms();
            setMyRooms(data || []);
        } catch (err) {
            console.error("내 채팅방 목록 조회 실패:", err);
            setError("내 채팅방 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 데이터 로드
    useEffect(() => {
        if (currentTab === "public") {
            loadPublicChatRooms();
        } else if (currentTab === "my") {
            loadMyChatRooms();
        }
    }, [currentTab, loadPublicChatRooms, loadMyChatRooms]);

    // 내 채팅방 로드 후, 소속 유지용 keepalive
    useEffect(() => {
        if (!isWebSocketConnected) return;
        myRooms
            .filter((r) => r.isParticipating)
            .forEach((room) => {
                try {
                    websocketService.sendMessage(`/app/multchat/join/${room.no}`, {
                        type: "USER_JOIN_KEEPALIVE",
                        roomNo: room.no,
                        timestamp: new Date().toISOString(),
                    });
                } catch (e) {
                    // no-op
                }
            });
    }, [isWebSocketConnected, myRooms]);

    // 검색 처리
    const handleSearch = (e) => {
        e.preventDefault();
        if (currentTab === "public") {
            loadPublicChatRooms(0, searchKeyword);
        }
    };

    // 채팅방 입장
    const handleJoinRoom = (roomNo) => {
        const room = [...chatRooms, ...myRooms].find(r => r.no === roomNo);

        if (!room) {
            console.error("채팅방 정보를 찾을 수 없습니다.");
            return;
        }

        if (room.isParticipating) {
            console.log("이미 참가 중인 채팅방 - 바로 입장");
            navigate(`/multchat/room/${roomNo}`);
            return;
        }

        if (room.roomType === "PRIVATE" || room.hasPassword) {
            console.log("비공개 채팅방 - 비밀번호 모달 표시");
            setSelectedRoom(room);
            setShowPasswordModal(true);
            setPasswordError(null);
        } else {
            console.log("공개 채팅방 - 바로 입장");
            navigate(`/multchat/room/${roomNo}`);
        }
    };

    // 비밀번호 확인 및 채팅방 참가
    const handlePasswordSubmit = async (password) => {
        if (!selectedRoom) return;

        setPasswordLoading(true);
        setPasswordError(null);

        try {
            await joinChatRoom(selectedRoom.no, password);
            setShowPasswordModal(false);
            setSelectedRoom(null);
            navigate(`/multchat/room/${selectedRoom.no}`);
        } catch (error) {
            console.error("채팅방 참가 실패:", error);

            if (error.response?.status === 400 && error.response?.data?.message?.includes("비밀번호")) {
                setPasswordError("비밀번호가 올바르지 않습니다.");
            } else if (error.response?.data?.message) {
                setPasswordError(error.response.data.message);
            } else {
                setPasswordError("채팅방 참가에 실패했습니다.");
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    // 비밀번호 모달 취소
    const handlePasswordCancel = () => {
        setShowPasswordModal(false);
        setSelectedRoom(null);
        setPasswordError(null);
        setPasswordLoading(false);
    };

    // 채팅방 생성
    const handleCreateRoom = () => {
        navigate("/multchat/create");
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        if (currentTab === "public") {
            loadPublicChatRooms(newPage, searchKeyword);
        }
    };

    return {
        // 상태
        chatRooms,
        myRooms,
        loading,
        error,
        searchKeyword,
        currentTab,
        pagination,
        realTimeRoomInfo,

        // 모달 상태
        showPasswordModal,
        selectedRoom,
        passwordLoading,
        passwordError,

        // 웹소켓 상태
        isWebSocketConnected,

        // 액션
        setSearchKeyword,
        setCurrentTab,
        loadPublicChatRooms,
        loadMyChatRooms,
        checkAndReconnectWebSocket,
        handleSearch,
        handleJoinRoom,
        handlePasswordSubmit,
        handlePasswordCancel,
        handleCreateRoom,
        handlePageChange,
    };
};

export default useRoomListLogic;