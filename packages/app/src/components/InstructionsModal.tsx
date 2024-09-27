import React from "react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            How to easily verify and start earning rewards
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ol className="space-y-6">
          <li>
            <p className="mb-2">
              1. Connect your wallet and select a platform (currently, only
              Coinbase is available).
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <div className="flex justify-between items-center">
                <span>Coinbase</span>
                <span className="text-blue-600 text-2xl font-bold">C</span>
              </div>
            </div>
          </li>
          <li>
            <p className="mb-2">
              2. Sign in with Google to search for rewards emails.
            </p>
            <div className="bg-gray-100 flex justify-center p-4 rounded">
              <img
                src="/coinbase-attestation-example.svg"
                alt="Coinbase rewards email example"
                className="w-1/2"
              />
            </div>
          </li>
          <li>
            <p>3. Verify and start earning rewards!</p>
          </li>
        </ol>
        <button
          onClick={onClose}
          className="mt-6 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InstructionsModal;
