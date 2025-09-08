import { imageUrl } from "../../api/boardApi";

const BoardFormComponent = ({
  title,
  setTitle,
  content,
  setContent,
  existingFiles,
  setExistingFiles,
  files,
  setFiles,
  onSubmit,
  onCancel,
  editing,
  loading,
}) => {
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
    </form>
  );
};

export default BoardFormComponent;
