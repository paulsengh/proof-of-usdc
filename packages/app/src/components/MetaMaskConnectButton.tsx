import { useState } from "react";

const MetaMaskConnectButton = ({ onWalletConnect }: any) => {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setAccount(accounts[0]);
        onWalletConnect(accounts[0]); // Pass the address up to the parent
      } catch (error) {
        console.error("Failed to connect to MetaMask:", error);
      }
    } else {
      console.log("MetaMask is not installed");
    }
  };

  if (account) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="w-[150px] flex justify-center items-center border px-2 py-1 space-x-2 mr-4 rounded-2xl">
            <img src="/check.svg" alt="Check" width={20} height={20} />
            <span className="text-xs text-gray-600">Wallet Selected</span>
          </div>
          <span className="text-sm">
            Wallet address: <span className="font-medium">{account}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-geist-mono-medium font-semibold">
        1. CONNECT YOUR WALLET
      </span>
      <button
        onClick={connectWallet}
        className="px-4 py-2 text-white bg-[#217F90] rounded-md hover:bg-[#4A8A82] transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default MetaMaskConnectButton;
