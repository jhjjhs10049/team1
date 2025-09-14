import { imageUrl } from "../../api/boardApi";
import LocationPicker from "../../components/LocationPicker";
import { useState } from "react";

const BoardFormComponent = ({
  title,
  setTitle,
  content,
  setContent,
  existingFiles,
  setExistingFiles,
  files,
  setFiles,
  location,
  setLocation,
  onSubmit,
  onCancel,
  editing,
  loading,
}) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeExistingFile = (fileName) => {
    setExistingFiles((prev) => prev.filter((f) => f !== fileName));
  };

  const removeNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={loading}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {title.length}/100자
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={loading}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {content.length}/2000자
        </div>
      </div>

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
                disabled={loading}
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
            disabled={loading}
          >
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-600">지도에서 위치 선택하기</p>
            <p className="text-sm text-gray-500">클릭하여 위치를 선택하세요</p>
          </button>
        )}
      </div>

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
          disabled={loading}
        />
      </div>
      {/* 기존 이미지 미리보기 */}
      {existingFiles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기존 이미지
          </label>
          <div className="grid grid-cols-3 gap-4">
            {existingFiles.map((fileName, idx) => (
              <div key={idx} className="relative">
                <img
                  src={imageUrl(fileName)}
                  alt=""
                  className="w-full max-h-32 object-contain rounded bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => removeExistingFile(fileName)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 새 이미지 미리보기 */}
      {files.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 이미지
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
                  onClick={() => removeNewFile(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
        >
          {loading ? "처리 중..." : editing ? "수정" : "등록"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          취소
        </button>
      </div>

      {/* LocationPicker 모달 */}
      <LocationPicker
        selectedLocation={location}
        onLocationSelect={setLocation}
        isVisible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
      />
    </form>
  );
};

export default BoardFormComponent;
