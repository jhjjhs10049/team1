import { useState } from "react";
import { createNotice, uploadImages } from "../../api/boardApi.jsx";
import useCustomMove from "../../hooks/useCustomMove.jsx";
import { ManagerAdminButton } from "../../../../common/config/ProtectedBoard.jsx";
import LocationPicker from "../../components/LocationPicker.jsx";

const initState = {
  title: "",
  content: "",
  images: [],
  type: "ANN", // 기본값: 공지사항
};

const NoticeRegisterComponent = () => {
  const [notice, setNotice] = useState({ ...initState });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { moveToList } = useCustomMove();

  const handleChangeNotice = (e) => {
    setNotice({
      ...notice,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeChange = (type) => {
    setNotice({
      ...notice,
      type: type,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleClickAdd = async () => {
    if (!notice.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!notice.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 이미지 업로드
      let uploadedFileNames = [];
      if (files && files.length > 0) {
        uploadedFileNames = await uploadImages(files);
      }

      // 공지사항/광고 등록
      await createNotice({
        title: notice.title,
        content: notice.content,
        images: uploadedFileNames,
        type: notice.type,
        locationLat: location?.lat,
        locationLng: location?.lng,
        locationAddress: location?.address,
      });

      const typeText = notice.type === "ANN" ? "공지사항" : "광고";
      alert(`${typeText}이 등록되었습니다.`);
      moveToList();
    } catch (error) {
      console.error("공지사항 등록 실패:", error);
      if (error.response?.status === 403) {
        alert("공지사항 작성 권한이 없습니다.");
      } else {
        alert("공지사항 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {notice.type === "ANN" ? "📢 공지사항 작성" : "📢 광고 작성"}
      </h1>

      <form className="space-y-6">
        {/* 타입 선택 토글 버튼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            작성 유형
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => handleTypeChange("ANN")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${notice.type === "ANN"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              📢 공지사항
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("AD")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${notice.type === "AD"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              📺 광고
            </button>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            name="title"
            value={notice.title}
            onChange={handleChangeNotice}
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isSubmitting}
            placeholder={`${notice.type === "ANN" ? "공지사항" : "광고"
              } 제목을 입력하세요`}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {notice.title.length}/100자
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            name="content"
            value={notice.content}
            onChange={handleChangeNotice}
            required
            rows={10}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isSubmitting}
            placeholder={`${notice.type === "ANN" ? "공지사항" : "광고"
              } 내용을 입력하세요`}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {notice.content.length}/2000자
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            disabled={isSubmitting}
          />
        </div>

        {/* 이미지 미리보기 */}
        {files.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선택된 이미지
            </label>
            <div className="grid grid-cols-3 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full max-h-32 object-contain rounded bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 위치 선택 섹션 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            위치 정보 (선택사항)
          </label>
          {location ? (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-gray-800">선택된 위치</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="text-sm text-teal-600 hover:text-teal-700"
                  disabled={isSubmitting}
                >
                  위치 변경
                </button>
              </div>
              {location.address && (
                <p className="text-gray-700 mb-2">{location.address}</p>
              )}
              <p className="text-xs text-gray-500">
                위도: {location.lat?.toFixed(6)}, 경도: {location.lng?.toFixed(6)}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 hover:bg-teal-50 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
              </svg>
              <p className="text-gray-600">지도에서 위치 선택하기</p>
              <p className="text-sm text-gray-500">클릭하여 위치를 선택하세요</p>
            </button>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleClickAdd}
            disabled={isSubmitting}
            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "등록"}
          </button>
          <button
            type="button"
            onClick={moveToList}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </form>

      {/* 위치 선택 모달 */}
      {showLocationPicker && (
        <LocationPicker
          selectedLocation={location}
          onLocationSelect={handleLocationSelect}
          isVisible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
};

export default NoticeRegisterComponent;
