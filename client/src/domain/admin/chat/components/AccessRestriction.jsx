const AccessRestriction = ({ admin }) => {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <span className="text-orange-600">🔒</span>
        <div>
          <h4 className="font-medium text-orange-800">접근 제한</h4>
          <p className="text-sm text-orange-700">
            이 채팅방은 다른 관리자(
            {admin.nickname || admin.email})가 담당하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessRestriction;
