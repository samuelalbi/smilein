import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'small' | 'medium' | 'large' | 'extra-large';
}

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  onConfirm,
  confirmText = 'Simpan',
  cancelText = 'Batal',
  confirmDisabled = false,
  size = 'lg'
}: ModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading && !confirmDisabled) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose, isLoading, confirmDisabled]);

  // Enhanced size classes with responsive design and backward compatibility
  const getSizeClasses = () => {
    // Map old size names to new ones for backward compatibility
    const normalizedSize = size === 'small' ? 'sm' :
      size === 'medium' ? 'md' :
        size === 'large' ? 'lg' :
          size === 'extra-large' ? 'xl' : size;

    const sizeClasses = {
      'sm': 'max-w-md w-[95%] sm:w-[90%] md:w-[80%]',
      'md': 'max-w-xl w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%]',
      'lg': 'max-w-4xl w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%]',
      'xl': 'max-w-6xl w-[95%] sm:w-[90%] md:w-[90%] lg:w-[85%]',
      'full': 'max-w-full w-[95%] sm:w-[90%]'
    };

    return sizeClasses[normalizedSize as keyof typeof sizeClasses] || sizeClasses.lg;
  };

  const handleConfirm = async () => {
    if (onConfirm && !confirmDisabled) {
      try {
        setIsLoading(true);
        const result = onConfirm();

        if (result instanceof Promise) {
          await result;
        }

        // Don't auto-close on confirm - let the parent component handle it
        // This gives more control to handle success/error states
      } catch (error) {
        console.error('Error in onConfirm:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading && !confirmDisabled) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!isLoading && !confirmDisabled) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isDisabled = isLoading || confirmDisabled;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          ${getSizeClasses()} 
          mx-auto
          max-h-[90vh] 
          bg-white 
          dark:bg-gray-800 
          rounded-lg 
          shadow-2xl 
          overflow-hidden 
          relative
          border 
          border-gray-200 
          dark:border-gray-700
          animate-in 
          fade-in-0 
          zoom-in-95
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="pr-4 flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            className={`
              text-gray-400 
              hover:text-gray-600 
              dark:hover:text-gray-200 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-500 
              focus:ring-offset-2
              text-2xl 
              sm:text-3xl 
              font-light
              flex-shrink-0
              w-8 
              h-8 
              flex 
              items-center 
              justify-center 
              rounded-full 
              hover:bg-gray-100 
              dark:hover:bg-gray-700
              transition-all
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={handleCloseClick}
            disabled={isDisabled}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Modal Footer - Only show if onConfirm is provided */}
        {onConfirm && (
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              disabled={isDisabled}
              className={`
                px-4 
                py-2 
                text-sm
                font-medium
                text-gray-700 
                dark:text-gray-300 
                bg-white
                dark:bg-gray-700
                border
                border-gray-300
                dark:border-gray-600
                hover:bg-gray-50 
                dark:hover:bg-gray-600 
                rounded-md 
                transition-colors
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={handleCloseClick}
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isDisabled}
              className={`
                px-4 
                py-2 
                text-sm
                font-medium
                bg-blue-600 
                text-white 
                rounded-md 
                hover:bg-blue-700 
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                transition-colors
                flex 
                items-center 
                justify-center
                min-w-[80px]
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={handleConfirm}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;