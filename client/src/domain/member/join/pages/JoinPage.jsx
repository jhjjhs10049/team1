import BasicLayout from "../../../../layouts/BasicLayout";
import JoinComponent from "../components/JoinComponent";

const JoinPage = () => {
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <JoinComponent />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default JoinPage;
