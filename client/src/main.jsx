import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

import root from "./router/root";
import store from "./store";
import "./index.css";

createRoot(document.getElementById("root")).render(
  //HTML에서 id가 "root"인 요소를 찾아서 React 루트를 생성 하고 이 루트에 JSX 컴포넌트를 랜더링한다.
  <Provider store={store}>
    {/* 생성된 store를 애플리케이션에 적용한다. */}
    <RouterProvider router={root}>
      {/*  router 객체를 앱에 연결해주는 컴포넌트 입니다. */}
    </RouterProvider>
  </Provider>
);
