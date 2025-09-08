const Modal = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[420px] relative">
                {children}
                <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

export default Modal;