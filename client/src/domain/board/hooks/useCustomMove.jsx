import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useCustomMove = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);

  const moveToList = () => {
    setRefresh(!refresh);
    navigate({ pathname: `/board` });
  };

  const moveToModify = (bno) => {
    setRefresh(!refresh);
    navigate({
      pathname: `/board/modify/${bno}`,
    });
  };

  const moveToRead = (bno) => {
    setRefresh(!refresh);
    navigate({
      pathname: `/board/read/${bno}`,
    });
  };

  const moveToNoticeRegister = () => {
    setRefresh(!refresh);
    navigate({ pathname: `/board/notice/register` });
  };

  return {
    moveToList,
    moveToModify,
    moveToRead,
    moveToNoticeRegister,
    refresh,
  };
};

export default useCustomMove;
