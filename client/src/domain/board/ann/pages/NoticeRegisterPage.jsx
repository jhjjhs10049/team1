import BasicLayout from "../../../../layouts/BasicLayout";
import NoticeRegisterComponent from "../components/NoticeRegisterComponent";

const NoticeRegisterPage = () => {
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <NoticeRegisterComponent />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default NoticeRegisterPage;
