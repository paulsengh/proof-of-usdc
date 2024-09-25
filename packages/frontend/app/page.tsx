"use client";
import { useState } from "react";
import Image from "next/image";
import MetaMaskConnectButton from "./components/MetaMaskConnectButton";
import GoogleSignInButton from "./components/GoogleSignInButton";

const OpenBlockInterface = () => {
  const [isPlatformSelected, setIsPlatformSelected] = useState(false);

  const handlePlatformSelection = () => {
    setIsPlatformSelected(true);
  };

  return (
    <div className="bg-[#E7F0F0] min-h-screen p-8">
      <div className="flex flex-col items-center mx-auto max-w-[800px]">
        <Image
          src="/obl-logo.svg"
          alt="obl-logo"
          width={180}
          height={25}
          className="mb-6"
        />

        <div className="w-full space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <MetaMaskConnectButton />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            {!isPlatformSelected && (
              <h2 className="text-sm font-semibold mb-4">
                2. SELECTED PLATFORM TO CHECK FOR REWARDS
              </h2>
            )}

            {!isPlatformSelected ? (
              <div
                className="flex items-center justify-between border border-gray-200 rounded-md p-4 cursor-pointer hover:bg-gray-50"
                onClick={handlePlatformSelection}
              >
                <span className="text-lg font-medium">Coinbase</span>
                <Image
                  src="/coinbase-letter-logo.svg"
                  alt="Coinbase"
                  width={24}
                  height={24}
                />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-[150px] flex items-center border px-2 py-1 space-x-2 mr-4 rounded-2xl">
                  <Image src="/check.svg" alt="Check" width={20} height={20} />
                  <span className="text-xs text-gray-600">
                    Platform Selected
                  </span>
                </div>
                <Image
                  src="/coinbase-logo.svg"
                  alt="Coinbase"
                  width={70}
                  height={13}
                />
              </div>
            )}
          </div>

          {isPlatformSelected && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xs text-[#525252] mb-4 font-matter-mono-medium">
                CONNECT GOOGLE ACCOUNT
              </h2>
              <p className="text-base mb-6">
                We&apos;ll look for any Coinbase USDC rewards emails so that you
                can start earning rewards.
              </p>
              <GoogleSignInButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenBlockInterface;
