import { useCallback, useEffect, useState } from "react";
import MetaMaskConnectButton from "../components/MetaMaskConnectButton";
// import GoogleSignInButton from "../components/GoogleSignInButton";
import { formatDateTime } from "../helpers/dateTimeFormat";
import EmailInputMethod from "../components/EmailInputMethod";
// import { google } from "googleapis";
import useGoogleAuth from "../hooks/useGoogleAuth";
import { Loader2 } from "lucide-react";
import {
  fetchEmailList,
  fetchEmailsRaw,
  RawEmailResponse,
} from "../hooks/useGmailClient";
import abi from "../abi.json";
import { convertTimestampToDate } from "../utils/convertTimestampToDate";
import { parseEmailContent } from "../utils/parseEmailContent";
import {
  downloadProofFiles,
  generateProof,
  verifyProof,
} from "@zk-email/helpers/dist/chunked-zkey";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
const { ethers } = require("ethers");
import { generateCoinbaseVerifierCircuitInputs } from "../../../../packages/circuits/helpers/generate-inputs";
const snarkjs = require("snarkjs");

import emlContent from "../coinbase-test.eml?raw";

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const MainPage: React.FC<{}> = (props) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isPlatformSelected, setIsPlatformSelected] = useState(false);
  const [nextEmailStep, setNextEmailStep] = useState(false);
  const [nextProofStep, setNextProofStep] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [isProofVerified, setIsProofVerified] = useState(false);
  const [isFetchEmailLoading, setIsFetchEmailLoading] = useState(false);
  const [fetchedEmails, setFetchedEmails] = useState<RawEmailResponse[]>([]);
  const [exampleEmailContent, setExampleEmailContent] = useState("");

  console.log("fetchedEmails: ", fetchedEmails);

  useEffect(() => {
    console.log("emlContent: ", emlContent);
    setExampleEmailContent(emlContent);
  }, []);

  const {
    googleAuthToken,
    isGoogleAuthed,
    loggedInGmail,
    scopesApproved,
    googleLogIn,
    googleLogOut,
  } = useGoogleAuth();

  console.log("googleAuthToken: ", googleAuthToken);

  const handlePlatformSelection = () => {
    setIsPlatformSelected(true);
  };

  const handleWalletConnect = (address: string) => {
    setIsWalletConnected(true);
    setWalletAddress(address);
  };

  useEffect(() => {
    if (isGoogleAuthed) {
      handleFetchEmails();
    }
  }, [isGoogleAuthed]);

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
      console.log(
        "handleProofStep import.meta.env.VITE_CIRCUIT_ARTIFACTS_URL: ",
        import.meta.env.VITE_CIRCUIT_ARTIFACTS_URL
      );
      console.log("handleProofStep base_url: ", base_url);
      const { proof, publicSignals } = await generateProof(
        circuitInputs,
        // @ts-ignore
        /* import.meta.env.VITE_CIRCUIT_ARTIFACTS_URL */ "https://zkcoinbase-zkey-chunks.s3.amazonaws.com/5e474a0cce971e20d4288665e80ea1d596da2dca/",
        "coinbase"
      );

      console.log("generateProof proof: ", proof);
      console.log("generateProof publicSignals", publicSignals);

      const wasmArrayBuffer = await fetch("/build/coinbase.wasm").then((res) =>
        res.arrayBuffer()
      );

      console.log("handleProofStep wasmArrayBuffer: ", wasmArrayBuffer);
      const witnessCalculator = await snarkjs.wtns.initialize(
        new Uint8Array(wasmArrayBuffer)
      ); // This is incorrect as of now
      const witnessBuffer = await witnessCalculator.calculateWTNSBin(
        circuitInputs,
        0
      );

      const uploadWitnessCommand = new PutObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET,
        Key: "build/input.wtns",
        Body: Buffer.from(witnessBuffer),
        ACL: "public-read",
      });
      await s3Client.send(uploadWitnessCommand);

      console.log("Witness generated and uploaded to S3");

      console.log("handleProofStep proof: ", proof);
      console.log("handleProofStep publicSignals: ", publicSignals);

      // Upload proof to S3 using v3 SDK
      const proofUploadCommand = new PutObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET,
        Key: "proofs/latest_proof.json",
        Body: JSON.stringify({ proof, publicSignals }),
        ACL: "public-read",
      });
      await s3Client.send(proofUploadCommand);

      // Step 6: Download the proof from AWS S3 and verify it on-chain
      const proofDownloadCommand = new GetObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET,
        Key: "proofs/latest_proof.json",
      });
      const proofData = await s3Client.send(proofDownloadCommand);

      const proofBody = await proofData.Body?.transformToString();
      const { proof: downloadedProof, publicSignals: downloadedPublicSignals } =
        JSON.parse(proofBody!);

      // Connect to the Ethereum network
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Load the ProofOfUSDC contract
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS!;
      const contractABI = [abi];
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      ) as any; /* ethers.Contract & ProofOfUSDCABI */

      // Call the mint function to verify the proof on-chain
      const tx = await contract.mint(
        [
          downloadedProof.pi_a[0],
          downloadedProof.pi_a[1],
          downloadedProof.pi_b[0][1],
          downloadedProof.pi_b[0][0],
          downloadedProof.pi_b[1][1],
          downloadedProof.pi_b[1][0],
          downloadedProof.pi_c[0],
          downloadedProof.pi_c[1],
        ],
        downloadedPublicSignals
      );

      await tx.wait();

      setIsProofVerified(true);
    } catch (error) {
      console.error("Error generating and uploading proof:", error);
    } finally {
      setGeneratingProof(false);
    }
  }, [fetchedEmails, walletAddress, exampleEmailContent]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0">
        <div className="bg-[#404040] h-[70px] flex items-center justify-center text-white">
          <p className="text-lg">Introducing: Our Vision </p>
        </div>

        <div className="bg-white bg-opacity-70 h-[80px] flex items-center justify-between px-6">
          <img src="/obl-logo.svg" alt="obl-logo" width={180} height={25} />

          <nav className="flex items-center space-x-6">
            <a href="#" className="text-[#0A0A0A]">
              Your attestations
            </a>
            <a href="#" className="flex items-center text-[#0C2B32] space-x-2">
              <p>Instructions</p>
              <img src="/info-icon.svg" height={16} width={16} alt="Info" />
            </a>
            <button className="flex border rounded-lg border-[#D4D4D4] bg-white items-center text-[#0C2B32] px-4 py-2 rounded transition-colors">
              <img src="/wallet-icon.svg" height={15} width={15} alt="Wallet" />
              <p className="pl-2">Connect Wallet</p>
            </button>
          </nav>
        </div>
      </header>
      <div className="flex-grow overflow-auto bg-[#FAF8F4]">
        <div className="flex flex-col items-center py-8">
          <div className="w-1/3 space-y-6">
            {isProofVerified && (
              <div className="flex items-center p-4 text-white bg-[#259991]">
                <img
                  src="/_icon-small.svg"
                  height={40}
                  width={40}
                  alt="Check"
                />
                <p className="ml-4 font-medium text-lg">You&apos;re verified</p>
              </div>
            )}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <MetaMaskConnectButton onWalletConnect={handleWalletConnect} />
            </div>
            {!isProofVerified && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {!isPlatformSelected && (
                  <h2 className="text-sm font-geist-mono-medium font-semibold mb-4">
                    2. SELECTED PLATFORM TO CHECK FOR REWARDS
                  </h2>
                )}

                {!isPlatformSelected ? (
                  <div
                    className="flex items-center bg-[#FAFAFA] justify-between border border-gray-200 rounded-md p-4 cursor-pointer hover:bg-gray-50"
                    onClick={handlePlatformSelection}
                  >
                    <span className="text-base font-geist-sans font-medium">
                      Coinbase
                    </span>
                    <img
                      src="/coinbase-letter-logo.svg"
                      alt="Coinbase"
                      width={16}
                      height={16}
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
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
                      width={70}
                      height={13}
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
                    onClick={() => setNextEmailStep(true)}
                    className="w-full text-xl font-semibold border-2 border-[#2692A8] text-[#217F90] bg-white rounded-lg p-6 shadow-sm text-center"
                  >
                    Let&apos;s Go
                  </button>
                  <div className="w-full text-center">
                    <a
                      href="#"
                      className="w-full text-center text-sm font-geist-mono-medium"
                    >
                      <span className="underline">READ VISION</span> ↗
                    </a>
                  </div>
                </>
              )}
            {nextEmailStep && !isProofVerified && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xs font-geist-mono text-[#525252] mb-4 font-geist-mono-medium">
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
                {fetchedEmails.length > 0 && !isProofVerified && (
                  <button
                    onClick={handleProofStep}
                    disabled={generatingProof}
                    className={`w-full text-xl mt-6 font-semibold
      ${
        generatingProof
          ? "bg-white"
          : "bg-white border-2 border-[#2692A8] shadow-sm"
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
                )}
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
