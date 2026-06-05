
import React, { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click is on the direct background, not the modal content itself
        if (event.target === event.currentTarget) {
             onClose();
        }
    };

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={handleClickOutside} // Use onMouseDown to catch clicks on the overlay
        >
            <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform animate-slide-up">
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-700">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;