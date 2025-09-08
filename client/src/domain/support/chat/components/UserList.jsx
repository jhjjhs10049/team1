import React from "react";

const UserList = ({ onlineUsers, currentUser }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          온라인 ({onlineUsers.length}명)
        </h3>

        <div className="space-y-2">
          {onlineUsers.map((user, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition duration-200 ${
                user === currentUser ? "bg-teal-50 border border-teal-200" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  user === currentUser ? "bg-teal-500" : "bg-gray-400"
                }`}
              >
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-medium ${
                    user === currentUser ? "text-teal-700" : "text-gray-700"
                  }`}
                >
                  {user}
                  {user === currentUser && (
                    <span className="text-xs text-teal-500 ml-2">(나)</span>
                  )}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          ))}
        </div>

        {onlineUsers.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            <div className="text-2xl mb-2">👻</div>
            <p>아직 아무도 없네요...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
