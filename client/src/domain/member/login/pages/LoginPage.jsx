import BasicLayout from "../../../../layouts/BasicLayout";
import LoginComponent from "../components/LoginComponent";

const LoginPage = () => {
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <LoginComponent />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default LoginPage;
