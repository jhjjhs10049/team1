import MyPageComponent from "../components/MyPageComponent";
import BasicLayout from "../../../../layouts/BasicLayout";

const ModifyPage = () => {
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">회원정보 수정</h1>
        <MyPageComponent />
      </div>
    </BasicLayout>
  );
};

export default ModifyPage;
