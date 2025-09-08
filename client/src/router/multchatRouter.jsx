import { lazy, Suspense } from "react";
import { ProtectedComponent } from "../common/config/ProtectedLogin";
import BasicLayout from "../layouts/BasicLayout";

const Loading = <div>Loading...</div>;
const MultChatRoomList = lazy(() =>
  import("../domain/multchat/components/MultChatRoomList")
);
const ChatRoom = lazy(() => import("../domain/multchat/components/ChatRoom"));
const MultChatRoomCreate = lazy(() =>
  import("../domain/multchat/components/MultChatRoomCreate")
);

const multchatRouter = () => {
  return [
    {
      // /multchat - 채팅방 목록 (메인 페이지)
      path: "",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent>
            <BasicLayout>
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                  {/* 페이지 헤더 */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      단체 채팅
                    </h1>
                  </div>
                  {/* 채팅방 목록 */}
                  <MultChatRoomList />
                </div>
              </div>
            </BasicLayout>
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      // /multchat/create - 채팅방 생성
      path: "create",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent>
            <BasicLayout>
              <MultChatRoomCreate />
            </BasicLayout>
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      // /multchat/room/:roomNo - 채팅방
      path: "room/:roomNo",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent>
            <BasicLayout>
              <ChatRoom />
            </BasicLayout>
          </ProtectedComponent>
        </Suspense>
      ),
    },
  ];
};

export default multchatRouter;
