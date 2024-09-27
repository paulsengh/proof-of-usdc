import React, { useState } from "react";
import { X } from "lucide-react";

interface BeforeProveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BeforeProveModal: React.FC<BeforeProveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleGotItClick = () => {
    if (isChecked) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Before you prove it</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 uppercase">Data source</p>
            <p className="font-medium">Coinbase</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase">Source URL</p>
            <p className="font-medium">https://www.coinbase.com</p>
          </div>

          <div>
            <p className="font-medium uppercase mb-2">Need to know</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You will share your reward balance</li>
              <li>You will post the timestamp and reward balance on-chain</li>
            </ul>
          </div>

          <div>
            <p className="font-medium uppercase mb-2">Stay safe</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>zkEmail is processed in-browser, ensuring data privacy</li>
              <li>We don't access or store your private data</li>
            </ul>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I've read, understood, and agree to terms and conditions
            </label>
          </div>
        </div>

        <button
          onClick={handleGotItClick}
          disabled={!isChecked}
          className={`w-full mt-6 py-3 px-4 rounded text-center text-white transition-colors ${
            isChecked
              ? "bg-black hover:bg-gray-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default BeforeProveModal;
