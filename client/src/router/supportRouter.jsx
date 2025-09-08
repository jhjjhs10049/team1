import { lazy, Suspense } from "react";
import { AdminManagerComponent } from "../common/config/ProtectedAdmin";

const Loading = <div>Loading....</div>;

// 지연 로딩 컴포넌트
const FAQPage = lazy(() =>
  import("../domain/support/questionboard/pages/FAQPage")
);

const ChatQuestionPage = lazy(() =>
  import("../domain/support/prequestion/pages/ChatQuestionPage")
);

const ChatPage = lazy(() => import("../domain/support/chat/pages/ChatPage"));

const AdminChatPage = lazy(() =>
  import("../domain/support/chat/pages/AdminChatPage")
);

const supportRouter = () => {
  return [
    {
      // /support/faq
      path: "faq",
      element: (
        <Suspense fallback={Loading}>
          <FAQPage />
        </Suspense>
      ),
    },
    {
      // /support/chat
      path: "chat",
      element: (
        <Suspense fallback={Loading}>
          <ChatQuestionPage />
        </Suspense>
      ),
    },
    {
      // /support/chat/:chatRoomId
      path: "chat/:chatRoomId",
      element: (
        <Suspense fallback={Loading}>
          <ChatPage />
        </Suspense>
      ),
    },
    {
      // /support/admin/chat/room (실제 채팅 화면)
      path: "admin/chat/room",
      element: (
        <Suspense fallback={Loading}>
          <AdminChatPage />
        </Suspense>
      ),
    },
  ];
};

export default supportRouter;
