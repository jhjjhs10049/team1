import Modal from "./Modal";

const ConfirmModal = ({ message, onClose, onConfirm }) => {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          확인
        </h3>
        <p className="text-gray-700 mb-8 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            onClick={onConfirm}
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
