const Modal = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                <div className="relative">
                    <button
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                    <div className="overflow-y-auto max-h-[90vh]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;