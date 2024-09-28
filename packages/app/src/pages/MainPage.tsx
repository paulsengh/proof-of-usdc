import React, { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchEmailList,
  fetchEmailsRaw,
  RawEmailResponse,
} from "../hooks/useGmailClient";
import { useWriteContract } from "wagmi";
import { abi } from "../ProofOfUSDC";
import { convertTimestampToDate } from "../utils/convertTimestampToDate";
import { parseEmailContent } from "../utils/parseEmailContent";
import {
  downloadProofFiles,
  generateProof,
} from "@zk-email/helpers/dist/chunked-zkey";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ethers } from "ethers";
import { generateCoinbaseVerifierCircuitInputs } from "../../../../packages/circuits/helpers/generate-inputs";
import emlContent from "../../../circuits/tests/emls/coinbase-test.eml?raw";
import InstructionsModal from "../components/InstructionsModal";
import RecentAttestationsTable from "../components/RecentAttestationsTable";
import BeforeProveModal from "../components/BeforeProveModal";
import useGoogleAuth from "../hooks/useGoogleAuth";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener: (
    eventName: string,
    callback: (...args: any[]) => void
  ) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const MainPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPlatformSelected, setIsPlatformSelected] = useState(false);
  const [nextEmailStep, setNextEmailStep] = useState(false);
  const [nextProofStep, setNextProofStep] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [isProofVerified, setIsProofVerified] = useState(false);
  const [isFetchEmailLoading, setIsFetchEmailLoading] = useState(false);
  const [fetchedEmails, setFetchedEmails] = useState<RawEmailResponse[]>([]);
  const [exampleEmailContent, setExampleEmailContent] = useState("");
  const [isBeforeProveModalOpen, setIsBeforeProveModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProofReady, setIsProofReady] = useState(false);
  const [proof, setProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [shouldMint, setShouldMint] = useState(false);

  const {
    googleAuthToken,
    isGoogleAuthed,
    loggedInGmail,
    googleLogIn,
    googleLogOut,
  } = useGoogleAuth();

  const { writeContract, data, error, isSuccess } = useWriteContract();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[];
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      } catch (error) {
        console.error("Failed to connect to MetaMask:", error);
      }
    } else {
      console.log("MetaMask is not installed");
    }
  };

  const handleContinueClick = () => {
    setIsBeforeProveModalOpen(true);
  };

  const closeBeforeProveModal = () => {
    setIsBeforeProveModalOpen(false);
  };

  const handleConfirmProve = () => {
    closeBeforeProveModal();
    setNextEmailStep(true);
    console.log("User confirmed. Proceeding to next step.");
  };

  useEffect(() => {
    setExampleEmailContent(emlContent);
  }, []);

  useEffect(() => {
    if (isGoogleAuthed) {
      handleFetchEmails();
    }
  }, [isGoogleAuthed]);

  useEffect(() => {
    const downloadZKey = async () => {
      try {
        await downloadProofFiles(
          import.meta.env.VITE_CIRCUIT_ARTIFACTS_URL,
          "coinbase",
          () => {}
        );
      } catch (e) {
        console.log(e);
      }
    };
    downloadZKey();
  }, []);

  const handleFetchEmails = async () => {
    try {
      setIsFetchEmailLoading(true);
      const emailListResponse = await fetchEmailList(
        googleAuthToken.access_token,
        {},
        "You just received 99.99965314 SOL"
      );

      console.log("emailListResponse: ", emailListResponse);
      const emailResponseMessages = emailListResponse[0].messages;
      console.log("emailResponseMessages: ", emailResponseMessages);
      if (emailResponseMessages?.length > 0) {
        const emailIds = emailResponseMessages.map((message) => message.id);
        const emails = await fetchEmailsRaw(
          googleAuthToken.access_token,
          emailIds
        );

        console.log("emails: ", emails);

        setFetchedEmails(emails);
      } else {
        setFetchedEmails([]);
      }
    } catch (error) {
      console.error("Error in fetching data:", error);
    } finally {
      setIsFetchEmailLoading(false);
    }
  };

  const handlePlatformSelection = () => {
    setIsPlatformSelected(!isPlatformSelected);
  };

  function reformatProofForContractCall(proof: any) {
    return [
      BigInt(proof.pi_a[0]),
      BigInt(proof.pi_a[1]),
      BigInt(proof.pi_b[0][1]),
      BigInt(proof.pi_b[0][0]),
      BigInt(proof.pi_b[1][1]),
      BigInt(proof.pi_b[1][0]),
      BigInt(proof.pi_c[0]),
      BigInt(proof.pi_c[1]),
    ];
  }

  function reformatSignalsForContractCall(publicSignals: any) {
    return publicSignals.map((signal: string) => BigInt(signal));
  }

  const handleMint = async () => {
    if (!proof || !publicSignals) {
      console.error("Proof or public signals are missing");
      return;
    }

    const reformattedProof = reformatProofForContractCall(proof);
    console.log("reformattedProof: ", reformattedProof);
    const reformattedSignals = reformatSignalsForContractCall(publicSignals);
    console.log("reformattedSignals: ", reformattedSignals);

    try {
      const result = await writeContract({
        abi,
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "mint",
        args: [reformattedProof, reformattedSignals],
      });

      console.log("Transaction submitted:", result);
    } catch (err) {
      console.error("Error calling mint function:", err);
      throw err;
    }
  };

  const handleProofStep = useCallback(async () => {
    setNextProofStep(true);
    setGeneratingProof(true);

    try {
      const emailContent = exampleEmailContent;
      console.log("handleProofStep emailContent: ", emailContent);
      console.log("handleProofStep walletAddress: ", walletAddress);

      const circuitInputs = await generateCoinbaseVerifierCircuitInputs(
        Buffer.from(emailContent),
        walletAddress
      );

      console.log("handleProofStep circuitInputs: ", circuitInputs);
      const base_url = import.meta.env.VITE_CIRCUIT_ARTIFACTS_URL;
      console.log("handleProofStep base_url: ", base_url);
      const { proof, publicSignals } = await generateProof(
        circuitInputs,
        import.meta.env.VITE_CIRCUIT_ARTIFACTS_URL,
        "coinbase"
      );

      console.log("handleProofStep proof: ", proof);
      console.log("handleProofStep publicSignals", publicSignals);

      const proofUploadCommand = new PutObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET,
        Key: "proofs/latest_proof.json",
        Body: JSON.stringify({ proof, publicSignals }),
        ACL: "public-read",
      });

      await s3Client.send(proofUploadCommand);
      console.log("Proof uploaded successfully");

      const proofDownloadCommand = new GetObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET,
        Key: "proofs/latest_proof.json",
      });
      const proofData = await s3Client.send(proofDownloadCommand);

      const proofBody = await proofData.Body?.transformToString();
      if (!proofBody) {
        throw new Error("Downloaded proof body is empty");
      }

      const { proof: downloadedProof, publicSignals: downloadedPublicSignals } =
        JSON.parse(proofBody);

      console.log("handleProofStep downloadedProof: ", downloadedProof);
      console.log(
        "handleProofStep downloadedPublicSignals: ",
        downloadedPublicSignals
      );

      setProof(downloadedProof);
      setPublicSignals(downloadedPublicSignals);
      setIsProofReady(true);
      setShouldMint(true);
    } catch (error) {
      console.error("Error in handleProofStep:", error);
      setMintError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setGeneratingProof(false);
    }
  }, [walletAddress, exampleEmailContent]);

  useEffect(() => {
    const mintIfReady = async () => {
      if (shouldMint && proof && publicSignals) {
        try {
          setIsMinting(true);
          await handleMint();
          setIsProofVerified(true);
          setShouldMint(false);
        } catch (error) {
          console.error("Error in minting:", error);
          setMintError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
        } finally {
          setIsMinting(false);
        }
      }
    };

    mintIfReady();
  }, [proof, publicSignals, shouldMint]);

  const handleContinueAndMint = async () => {
    setMintError(null);
    if (!isProofReady) {
      await handleProofStep();
    } else {
      setShouldMint(true);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0">
        <div className="bg-[#404040] h-[70px] flex items-center justify-center text-white">
          <p className="text-lg">Introducing: Our Vision → </p>
        </div>
        <div className="bg-white bg-opacity-70 h-[80px] flex items-center justify-between px-6">
          <img src="/obl-logo.svg" alt="obl-logo" width={180} height={25} />

          <div className="flex items-center space-x-6">
            <a href="#" className="font-semibold text-[#0A0A0A]">
              Your attestations
            </a>
            <button
              onClick={openModal}
              className="font-semibold flex items-center text-[#0C2B32] space-x-2"
            >
              <p>Instructions</p>
              <img src="/info-icon.svg" height={16} width={16} alt="Info" />
            </button>
            {isWalletConnected ? (
              <div className="flex items-center border font-medium rounded-lg border-[#D4D4D4] bg-white text-[#0C2B32] px-4 py-2">
                <img
                  src="/wallet-icon.svg"
                  height={15}
                  width={15}
                  alt="Wallet"
                />
                <p className="pl-2">Connected</p>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex border font-medium rounded-lg border-[#D4D4D4] bg-white items-center text-[#0C2B32] px-4 py-2 transition-colors hover:bg-gray-50"
              >
                <img
                  src="/wallet-icon.svg"
                  height={15}
                  width={15}
                  alt="Wallet"
                />
                <p className="pl-2">Connect Wallet</p>
              </button>
            )}
          </div>
        </div>
      </header>

      {isSuccess && <p>Transaction successful! Hash: {data}</p>}
      {error && <p>Error: {error.message}</p>}
      <InstructionsModal isOpen={isModalOpen} onClose={closeModal} />
      <div className="flex-grow overflow-auto bg-[#FAF8F4]">
        <div className="flex flex-col items-center py-8">
          <div className="w-1/2 space-y-6">
            {isProofVerified && (
              <div className="flex items-center p-4 text-white bg-[#259991]">
                <img
                  src="/_icon-small.svg"
                  height={40}
                  width={40}
                  alt="Check"
                />
                <p className="ml-4 font-medium text-lg">You're verified</p>
              </div>
            )}
            {!isProofVerified && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {!isPlatformSelected && (
                  <>
                    <h2 className="text-sm font-geist-mono font-medium mb-4">
                      1. GET STARTED WITH COINBASE
                    </h2>
                    <p className="text-lg py-2">
                      Securely transform your data into a private attestation
                      and unlock rewards.
                    </p>
                  </>
                )}

                {!isPlatformSelected ? (
                  <div className="space-y-3 pt-3">
                    <div
                      className="flex items-center bg-[#FAFAFA] justify-between border border-gray-200 rounded-md p-4 cursor-pointer hover:bg-gray-50"
                      onClick={handlePlatformSelection}
                    >
                      <span className="text-base font-medium">Coinbase</span>
                      <img
                        src="/coinbase-letter-logo.svg"
                        alt="Coinbase"
                        width={16}
                        height={16}
                      />
                    </div>
                    <div
                      className="flex items-center bg-[#FAFAFA] justify-between border border-gray-200 rounded-md p-4"
                      onClick={() => {}}
                    >
                      <span className="text-base font-medium text-[#737373]">
                        X / Twitter (Coming soon)
                      </span>
                      <img src="/x-logo.svg" alt="X" width={16} height={16} />
                    </div>
                    <div
                      className="flex items-center bg-[#FAFAFA] justify-between border border-gray-200 rounded-md p-4"
                      onClick={() => {}}
                    >
                      <span className="text-base font-medium text-[#737373]">
                        Airbnb (Coming soon)
                      </span>
                      <img
                        src="/airbnb.svg"
                        alt="Airbnb"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="w-[150px] flex items-center border px-2 py-1 space-x-2 mr-4 rounded-2xl">
                      <img
                        src="/check.svg"
                        alt="Check"
                        width={20}
                        height={20}
                      />
                      <span className="text-xs text-gray-600">
                        Platform Selected
                      </span>
                    </div>
                    <img
                      src="/coinbase-logo.svg"
                      alt="Coinbase"
                      width={90}
                      height={16}
                    />
                  </div>
                )}
              </div>
            )}

            {isPlatformSelected &&
              isWalletConnected &&
              !nextEmailStep &&
              !isProofVerified && (
                <>
                  <button
                    onClick={handleContinueClick}
                    className="w-full text-xl font-semibold border-2 border-[#0A0A0A] text-[#0A0A0A] bg-white rounded-lg p-6 shadow-sm text-center"
                  >
                    Continue
                  </button>
                  {/* <div className="w-full text-center">
                    <a
                      href="#"
                      className="w-full text-center text-sm font-geist-mono"
                    >
                      <span className="underline">READ VISION</span> ↗
                    </a>
                  </div> */}
                </>
              )}
            {!nextEmailStep && <RecentAttestationsTable />}
            <BeforeProveModal
              isOpen={isBeforeProveModalOpen}
              onClose={closeBeforeProveModal}
              onConfirm={handleConfirmProve}
            />
            {nextEmailStep && !isProofVerified && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xs font-geist-mono text-[#525252] mb-4">
                  CONNECT GOOGLE ACCOUNT
                </h2>
                <p className="text-base mb-6">
                  We&apos;ll look for any Coinbase USDC rewards emails so that
                  you can start earning rewards.
                </p>
                {!loggedInGmail && (
                  <div className="flex justify-center">
                    <button
                      className="flex items-center justify-center py-2 px-12 border border-black rounded-2xl text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => googleLogIn()}
                    >
                      <img
                        src="/google-logo.svg"
                        alt="Google logo"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      <p className="text-sm">Sign in with Google</p>
                    </button>
                  </div>
                )}
                {loggedInGmail &&
                  fetchedEmails.length > 0 &&
                  !isProofVerified && (
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg">
                      <div className="flex flex-col p-6 space-y-2 ">
                        <div className="flex justify-between items-start">
                          <p className="text-gray-600 font-medium w-1/6">
                            Sender
                          </p>
                          <p className="text-black font-normal w-5/6">
                            {
                              parseEmailContent(
                                fetchedEmails[0].decodedContents
                              ).from
                            }
                          </p>
                        </div>
                        <div className="flex justify-between items-start">
                          <p className="text-gray-600 font-medium w-1/6">
                            Subject
                          </p>
                          <p className="text-black font-normal w-5/6">
                            {fetchedEmails[0].subject}
                          </p>
                        </div>
                        <div className="flex justify-between items-start">
                          <p className="text-gray-600 font-medium w-1/6">
                            Date
                          </p>
                          <p className="text-black font-normal w-5/6">
                            {convertTimestampToDate(
                              parseInt(fetchedEmails[0].internalDate)
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="w-full my-2 h-px bg-[#E5E5E5]" />
                      <div className="mt-6 flex justify-center">
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: parseEmailContent(
                              fetchedEmails[0].decodedContents
                            ).htmlBody,
                          }}
                        />
                      </div>
                    </div>
                  )}
                {
                  /* fetchedEmails.length > 0 && */ !isProofVerified && (
                    <button
                      onClick={handleContinueAndMint}
                      disabled={generatingProof}
                      className={`w-full text-xl mt-6 font-semibold
      ${
        generatingProof
          ? "bg-white"
          : "bg-white border-2 border-[#0A0A0A] shadow-sm"
      }
      text-[#217F90] rounded-lg p-6 text-center
      flex items-center justify-center`}
                    >
                      {generatingProof ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          Generating Proof...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </button>
                  )
                }
              </div>
            )}
            {isProofVerified && (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-4xl font-medium mb-4 text-gray-800">
                  Start earning rewards
                </h2>
                <button
                  className="bg-[#217F90] hover:bg-teal-700 text-white font-bold py-2 px-4 rounded flex items-center"
                  onClick={() => console.log("View profile clicked")}
                >
                  View your profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <svg
                    className="w-4 h-4 -ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
