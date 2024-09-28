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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 shadow-md">
      <div className="relative">
        <div className="bg-white rounded-2xl p-10 max-w-2xl w-full m-4 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-[0.5%]">
              Before you prove it
            </h2>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
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
                  strokeWidth={1}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="">
            <div className=" mb-4">
              <div className="flex gap-14 items-center mb-2">
                <p className=" text-[12px] text-[#525252] uppercase font-[500]">
                  Data source
                </p>
                <p className="text-[15px] font-[400] text=[#0C2B32] tracking-[0.5]">
                  Coinbase
                </p>
              </div>

              <div className="flex gap-14 items-center">
                <p className=" text-[12px] text-[#525252] uppercase font-[500]">
                  Source URL
                </p>
                <p className="text-[15px] font-[400] text=[#0C2B32] tracking-[0.5] pl-1">
                  https://www.coinbase.com
                </p>
              </div>
            </div>
            <hr className="mb-4" />

            <div className="mb-4">
              <p className=" text-[12px] text-[#525252] uppercase  font-[500] mb-2">
                Need to know
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                <li className="text-[15px] font-[400] text=[#0C2B32] tracking-[0.5] pl-1">
                  You will share your reward balance
                </li>
                <li className="text-[15px] font-[400] text=[#0C2B32] tracking-[0.5] pl-1">
                  You will post the timestamp and reward balance on-chain
                </li>
              </ul>
            </div>
            <hr className="mb-4" />
            <div className="mb-4">
              <p className=" text-[12px] text-[#525252] uppercase  font-[500] mb-2">
                Stay safew
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                <li className="text-[15px] font-[400] text=[#0C2B32] tracking-[0.5] pl-1">
                  zkEmail is processed in-browser, ensuring data privacy
                </li>
                <li className="text-[15px] font-[400] text=[#0C2B32] tracking-[0.5] pl-1">
                  We don't access or store your private data
                </li>
              </ul>
            </div>
            <hr className="mb-4" />

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <label
                htmlFor="terms"
                className="text-[16px] text-[#0C2B32] tracking-[0.5] font-[500] ml-2"
              >
                I've read, understood, and agree to terms and conditions
              </label>
            </div>
          </div>

          <button
            onClick={handleGotItClick}
            disabled={!isChecked}
            className={`w-full text-xl font-semibold border-2 border-[#0A0A0A] text-[#0A0A0A] bg-white rounded-md p-4 shadow-sm text-center ${
              isChecked
                ? "bg-black hover:bg-gray-100"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeforeProveModal;
