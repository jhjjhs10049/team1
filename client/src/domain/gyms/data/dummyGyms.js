const dummyGyms = [
    {
        gymNo: 1,
        name: '루덴짐 강남점',
        title: '루덴짐 강남점',
        address: '서울시 강남구 테헤란로 123',
        phoneNumber: '02-1234-5678',
        openingHours: '평일 06:00~23:00 / 주말 08:00~21:00',
        facilities: ['샤워실', '개인 사물함', '주차 가능'],
        lat: 37.498095,
        lng: 127.02761,
        content: '강남 한복판에 위치한 프리미엄 피트니스 센터입니다.',
        rate: 4.5,
        imageList: [
            "https://picsum.photos/150?random=1",
            "https://picsum.photos/150?random=2"
        ],
        trainers: [
            { trainerno: 101, name: "김트레이너", specialty: "다이어트" },
            { trainerno: 102, name: "이헬스", specialty: "벌크업" }
        ],
        reviews: [
            {
                reviewNo: 1,
                writer: "민지",
                rating: 5,
                content: "기구가 깨끗하고 직원분들이 친절해요!",
                createdDate: "2025-07-20"
            },
            {
                reviewNo: 2,
                writer: "익명",
                rating: 4,
                content: "사물함이 좀 좁지만 전반적으로 만족합니다.",
                createdDate: "2025-07-25"
            }
        ]
    },
    {
        gymNo: 2,
        name: '루덴짐 홍대점',
        title: '루덴짐 홍대점',
        address: '서울시 마포구 와우산로 45',
        phoneNumber: '02-2345-6789',
        openingHours: '매일 08:00~22:00',
        facilities: ['샤워실', '주차 불가', '운동복 대여'],
        lat: 37.5561,
        lng: 126.9229,
        content: '트렌디한 감성의 홍대 피트니스 센터!',
        rate: 3.8,
        imageList: [
            "https://picsum.photos/150?random=3"
        ],
        trainers: [],
        reviews: [
            {
                reviewNo: 1,
                writer: "민지",
                rating: 5,
                content: "기구가 깨끗하고 직원분들이 친절해요!",
                createdDate: "2025-07-20"
            },
            {
                reviewNo: 2,
                writer: "익명",
                rating: 4,
                content: "사물함이 좀 좁지만 전반적으로 만족합니다.",
                createdDate: "2025-07-25"
            }
        ]
    },
    {
        gymNo: 3,
        name: '루덴짐 신촌점',
        title: '루덴짐 신촌점',
        address: '서울시 서대문구 연세로 50',
        phoneNumber: '02-3456-7890',
        openingHours: '평일 07:00~22:00 / 일요일 휴무',
        facilities: ['샤워실', '락커룸', '여성 전용존'],
        lat: 37.5598,
        lng: 126.9425,
        content: '학생 할인 이벤트 진행 중!',
        rate: 4.2,
        imageList: [
            "https://picsum.photos/150?random=4"
        ],
        trainers: [
            { trainerno: 201, name: "박코치", specialty: "체형교정" }
        ],
        reviews: [
            {
                reviewNo: 1,
                writer: "민지",
                rating: 5,
                content: "기구가 깨끗하고 직원분들이 친절해요!",
                createdDate: "2025-07-20"
            },
            {
                reviewNo: 2,
                writer: "익명",
                rating: 4,
                content: "사물함이 좀 좁지만 전반적으로 만족합니다.",
                createdDate: "2025-07-25"
            }
        ]
    },
    {
        gymNo: 4,
        name: '루덴짐 대명1호점',
        title: '루덴짐 대명1호점',
        address: '대구 남구 대명동 123-1',
        phoneNumber: '053-111-0001',
        openingHours: '평일 06:00~22:00 / 주말 08:00~20:00',
        facilities: ['샤워실', '무료 Wi-Fi'],
        lat: 35.8363,
        lng: 128.5841,
        content: '대명동 대표 프랜차이즈 피트니스 센터.',
        rate: 4.3,
        imageList: [],
        trainers: [],
        reviews: []
    },
    {
        gymNo: 5,
        name: '루덴짐 대명2호점',
        title: '루덴짐 대명2호점',
        address: '대구 남구 대명동 124-5',
        phoneNumber: '053-111-0002',
        openingHours: '24시간 운영',
        facilities: ['사물함', '헬스복 대여'],
        lat: 35.8352,
        lng: 128.5805,
        content: '언제나 열려있는 24시 헬스장.',
        rate: 4.0,
        imageList: [],
        trainers: [],
        reviews: []
    },
    {
        gymNo: 6,
        name: '루덴짐 대명3호점',
        title: '루덴짐 대명3호점',
        address: '대구 남구 대명동 126-9',
        phoneNumber: '053-111-0003',
        openingHours: '평일 07:00~23:00',
        facilities: ['샤워실', '여성 전용존'],
        lat: 35.8370,
        lng: 128.5829,
        content: '여성 고객에게 인기 있는 지점.',
        rate: 4.5,
        imageList: [],
        trainers: [],
        reviews: []
    },
    {
        gymNo: 7,
        name: '루덴짐 동성로점',
        title: '루덴짐 동성로점',
        address: '대구 중구 동성로3가 10',
        phoneNumber: '053-222-0004',
        openingHours: '매일 06:00~24:00',
        facilities: ['샤워실', 'PT룸'],
        lat: 35.8693,
        lng: 128.5951,
        content: '대구 중심 번화가의 프리미엄 헬스장.',
        rate: 4.6,
        imageList: [],
        trainers: [],
        reviews: []
    },
    {
        gymNo: 8,
        name: '루덴짐 대구역점',
        title: '루덴짐 대구역점',
        address: '대구 북구 칠성동 101',
        phoneNumber: '053-333-0005',
        openingHours: '매일 05:00~23:00',
        facilities: ['주차 가능', '샤워실'],
        lat: 35.8780,
        lng: 128.5912,
        content: '대구역 인근 최고의 접근성!',
        rate: 4.2,
        imageList: [],
        trainers: [],
        reviews: []
    },
    {
        gymNo: 9,
        name: '루덴짐 김천점',
        title: '루덴짐 김천점',
        address: '경북 김천시 평화동 45',
        phoneNumber: '054-111-0006',
        openingHours: '매일 08:00~22:00',
        facilities: ['헬스복 대여', '운동복 세탁 서비스'],
        lat: 36.1394,
        lng: 128.1136,
        content: '경북 김천 대표 피트니스 센터.',
        rate: 3.9,
        imageList: [],
        trainers: [],
        reviews: []
    },
    {
        gymNo: 10,
        name: '루덴짐 포항점',
        title: '루덴짐 포항점',
        address: '경북 포항시 북구 죽도동 77',
        phoneNumber: '054-222-0007',
        openingHours: '평일 06:00~23:00 / 주말 09:00~21:00',
        facilities: ['샤워실', '사우나', '주차 가능'],
        lat: 36.0190,
        lng: 129.3435,
        content: '포항 바다 근처 최고의 시설!',
        rate: 4.4,
        imageList: [],
        trainers: [],
        reviews: []
    }
];

export default dummyGyms;