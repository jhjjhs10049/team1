import Modal from "./Modal";

const ConfirmModal = ({ message, onClose, onConfirm }) => {
    return (
        <Modal onClose={onClose}>
            <p className="mb-4">{message}</p>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    className="px-3 py-2 rounded border"
                    onClick={onClose}
                >
                    취소
                </button>
                <button
                    type="button"
                    className="px-3 py-2 rounded bg-red-600 text-white"
                    onClick={onConfirm}
                >
                    삭제
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;