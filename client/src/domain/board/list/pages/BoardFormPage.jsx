import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BasicLayout from "../../../../layouts/BasicLayout";
import {
  createBoard,
  updateBoard,
  getBoardDetail,
  uploadImages,
} from "../../api/boardApi";
import BoardFormComponent from "../components/BoardFormComponent";
import { AuthorOnlyComponent } from "../../../../common/config/ProtectedBoard";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

export default function BoardFormPage() {
  const navigate = useNavigate();
  const { bno } = useParams();
  const location = useLocation();
  const { isLogin, moveToLogin } = useCustomLogin();
  const editing = !!bno;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingFiles, setExistingFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authorEmail, setAuthorEmail] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false); // 로그인 상태 확인
  useEffect(() => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      moveToLogin();
    }
  }, [isLogin, moveToLogin]);

  useEffect(() => {
    if (!editing) {
      setDataLoaded(true);
      return;
    }

    const loadDetail = async () => {
      try {
        const detail = await getBoardDetail(bno);
        setTitle(detail?.title ?? "");
        setContent(detail?.content ?? "");
        setAuthorEmail(detail?.writerEmail ?? "");

        const prev = Array.isArray(detail?.images)
          ? detail.images.map((i) => i.fileName)
          : [];
        setExistingFiles(prev);
        setDataLoaded(true); // 데이터 로드 완료
      } catch (err) {
        console.error(err);
        alert("게시글 정보를 불러오지 못했습니다.");
        navigate("/board");
      }
    };
    loadDetail();
  }, [editing, bno, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    try {
      setLoading(true);

      // 이미지 처리
      let imageFileNames = [];

      if (editing) {
        // 수정 시: 기존 파일 + 새 파일
        imageFileNames = [...existingFiles];
        if (files.length > 0) {
          const newImageNames = await uploadImages(files);
          imageFileNames = [...imageFileNames, ...newImageNames];
        }
      } else {
        // 새 글 작성 시: 새 파일만
        if (files.length > 0) {
          imageFileNames = await uploadImages(files);
        }
      }
      if (editing) {
        await updateBoard({
          boardId: bno,
          title,
          content,
          images: imageFileNames,
        });
        alert("수정되었습니다.");
        navigate(`/board/read/${bno}${location.search}`);
      } else {
        await createBoard({ title, content, images: imageFileNames });
        alert("등록되었습니다.");
        navigate("/board");
      }
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 취소 기능
  const handleCancel = () => {
    if (editing) {
      // 수정 중인 경우 해당 게시글 상세 페이지로 이동
      navigate(`/board/read/${bno}${location.search}`);
    } else {
      // 새 글 작성 중인 경우 게시판 목록으로 이동
      navigate("/board");
    }
  };
  // 새 글 작성인 경우 바로 렌더링
  if (!editing) {
    return (
      <BasicLayout>
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">글 쓰기</h1>
          <BoardFormComponent
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            existingFiles={existingFiles}
            setExistingFiles={setExistingFiles}
            files={files}
            setFiles={setFiles}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editing={editing}
            loading={loading}
          />
        </div>
      </BasicLayout>
    );
  }

  // 수정인 경우 - 데이터 로드 완료 후에만 권한 체크
  if (!dataLoaded) {
    return (
      <BasicLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </BasicLayout>
    );
  }

  // 수정인 경우 작성자만 접근 가능
  return (
    <AuthorOnlyComponent
      authorEmail={authorEmail}
      redirectOnNoAuth={true}
      noAuthMessage="로그인이 필요합니다."
      noPermissionMessage="작성자만 수정할 수 있습니다."
    >
      <BasicLayout>
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">글 수정</h1>
          <BoardFormComponent
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            existingFiles={existingFiles}
            setExistingFiles={setExistingFiles}
            files={files}
            setFiles={setFiles}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editing={editing}
            loading={loading}
          />
        </div>
      </BasicLayout>
    </AuthorOnlyComponent>
  );
}
