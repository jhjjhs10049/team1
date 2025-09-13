import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { multChatApi } from "../api/multChatApi";

const MultChatRoomCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roomName: "",
    description: "",
    maxParticipants: 10,
    roomType: "PUBLIC",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터 변경 처리
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));

    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 방 이름 검사
    if (!formData.roomName.trim()) {
      newErrors.roomName = "방 이름을 입력해주세요.";
    } else if (formData.roomName.trim().length < 2) {
      newErrors.roomName = "방 이름은 최소 2자 이상이어야 합니다.";
    } else if (formData.roomName.trim().length > 50) {
      newErrors.roomName = "방 이름은 최대 50자까지 가능합니다.";
    }

    // 설명 검사
    if (formData.description && formData.description.length > 200) {
      newErrors.description = "설명은 최대 200자까지 가능합니다.";
    }

    // 최대 참가자 수 검사
    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = "최소 2명 이상이어야 합니다.";
    } else if (formData.maxParticipants > 100) {
      newErrors.maxParticipants = "최대 100명까지 가능합니다.";
    }

    // 비공개 방 비밀번호 검사
    if (formData.roomType === "PRIVATE") {
      if (!formData.password) {
        newErrors.password = "비공개 방은 비밀번호가 필요합니다.";
      } else if (formData.password.length < 4) {
        newErrors.password = "비밀번호는 최소 4자 이상이어야 합니다.";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 채팅방 생성 데이터 준비
      const roomData = {
        roomName: formData.roomName.trim(),
        description: formData.description.trim() || null,
        maxParticipants: formData.maxParticipants,
        roomType: formData.roomType,
        status: "ACTIVE",
        hasPassword: formData.roomType === "PRIVATE" && !!formData.password,
        password: formData.roomType === "PRIVATE" ? formData.password : null, // 비밀번호 추가
      };

      console.log("채팅방 생성 요청:", roomData);

      // API 호출
      const createdRoom = await multChatApi.createChatRoom(roomData);

      console.log("채팅방 생성 완료:", createdRoom);

      // 생성된 채팅방으로 이동
      navigate(`/multchat/room/${createdRoom.no}`);
    } catch (error) {
      console.error("채팅방 생성 실패:", error);

      // 에러 메시지 설정
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("채팅방 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigate("/multchat");
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 max-w-2xl mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            채팅방 만들기
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 방 이름 */}
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              방 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              value={formData.roomName}
              onChange={handleInputChange}
              placeholder="채팅방 이름을 입력하세요"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.roomName
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-300"
                }`}
            />
            {errors.roomName && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <span className="mr-1">⚠</span>
                {errors.roomName}
              </div>
            )}
          </div>
          {/* 방 설명 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              방 설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="채팅방에 대한 간단한 설명을 입력하세요 (선택사항)"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors resize-vertical ${errors.description
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-300"
                }`}
            />
            {errors.description && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <span className="mr-1">⚠</span>
                {errors.description}
              </div>
            )}
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.description.length}/200
            </div>
          </div>
          {/* 최대 참가자 수 */}
          <div>
            <label
              htmlFor="maxParticipants"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              최대 참가자 수 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              min="2"
              max="100"
              className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.maxParticipants
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-300"
                }`}
            />
            {errors.maxParticipants && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <span className="mr-1">⚠</span>
                {errors.maxParticipants}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">2명 ~ 100명</div>
          </div>
          {/* 방 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              방 타입 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-3 border border-gray-200 rounded-md hover:border-teal-500 hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="roomType"
                  value="PUBLIC"
                  checked={formData.roomType === "PUBLIC"}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">공개방</div>
                  <div className="text-sm text-gray-500">
                    누구나 자유롭게 참가할 수 있습니다
                  </div>
                </div>
              </label>

              <label className="flex items-start p-3 border border-gray-200 rounded-md hover:border-teal-500 hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="roomType"
                  value="PRIVATE"
                  checked={formData.roomType === "PRIVATE"}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">비공개방</div>
                  <div className="text-sm text-gray-500">
                    비밀번호를 알고 있는 사용자만 참가할 수 있습니다
                  </div>
                </div>
              </label>
            </div>
          </div>
          {/* 비밀번호 (비공개방인 경우만) */}
          {formData.roomType === "PRIVATE" && (
            <>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="4자 이상 입력하세요"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.password
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300"
                    }`}
                />
                {errors.password && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <span className="mr-1">⚠</span>
                    {errors.password}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${errors.confirmPassword
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300"
                    }`}
                />
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <span className="mr-1">⚠</span>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </>
          )}
          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isSubmitting ? "생성 중..." : "채팅방 만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultChatRoomCreate;
