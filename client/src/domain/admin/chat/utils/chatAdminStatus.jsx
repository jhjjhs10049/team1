// 상태별 색상 반환
export const getStatusColor = (status) => {
  switch (status) {
    case "WAITING":
      return "text-yellow-600 bg-yellow-100";
    case "ACTIVE":
      return "text-teal-600 bg-teal-100";
    case "ENDED":
      return "text-green-600 bg-green-100";
    case "REJECTED":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// 상태별 텍스트 반환
export const getStatusText = (status) => {
  switch (status) {
    case "WAITING":
      return "대기";
    case "ACTIVE":
      return "상담중";
    case "ENDED":
      return "완료";
    case "REJECTED":
      return "거절";
    default:
      return status;
  }
};
