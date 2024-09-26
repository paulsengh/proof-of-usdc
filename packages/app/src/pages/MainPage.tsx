import { useEffect, useState } from "react";
import MetaMaskConnectButton from "../components/MetaMaskConnectButton";
import GoogleSignInButton from "../components/GoogleSignInButton";
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
import { convertTimestampToDate } from "../utils/convertTimestampToDate";
import { parseEmailContent } from "../utils/parseEmailContent";

export const MainPage: React.FC<{}> = (props) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isPlatformSelected, setIsPlatformSelected] = useState(false);
  const [nextEmailStep, setNextEmailStep] = useState(false);
  const [nextProofStep, setNextProofStep] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [isFetchEmailLoading, setIsFetchEmailLoading] = useState(false);
  const [fetchedEmails, setFetchedEmails] = useState<RawEmailResponse[]>([]);

  console.log("fetchedEmails: ", fetchedEmails);

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

  const handleProofStep = async () => {
    setNextProofStep(true);
    setGeneratingProof(true);

    try {
      const emailContent = fetchedEmails[0].decodedContents;

      const response = await fetch("/api/generate-and-upload-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent,
          walletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate and upload proof");
      }

      const result = await response.json();
      console.log("Proof generated and uploaded:", result);

      // Handle successful proof generation and upload (e.g., update UI, show success message)
    } catch (error) {
      console.error("Error generating and uploading proof:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setGeneratingProof(false);
    }
  };

  return (
    <div className="bg-[#E7F0F0] min-h-screen p-8">
      <div className="flex flex-col items-center mx-auto max-w-[800px]">
        <img
          src="/obl-logo.svg"
          alt="obl-logo"
          width={180}
          height={25}
          className="mb-6"
        />

        <div className="w-full space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <MetaMaskConnectButton onWalletConnect={handleWalletConnect} />
          </div>

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
                <span className="text-base font-medium">Coinbase</span>
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
                  <img src="/check.svg" alt="Check" width={20} height={20} />
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
          {isPlatformSelected && isWalletConnected && !nextEmailStep && (
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
          {nextEmailStep && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xs text-[#525252] mb-4 font-geist-mono-medium">
                CONNECT GOOGLE ACCOUNT
              </h2>
              <p className="text-base mb-6">
                We&apos;ll look for any Coinbase USDC rewards emails so that you
                can start earning rewards.
              </p>
              {/*  <GoogleSignInButton /> */}
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
              {loggedInGmail && fetchedEmails.length > 0 && (
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg">
                  <div className="flex flex-col p-6 space-y-2 ">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-600 font-medium w-1/6">Sender</p>
                      <p className="text-black font-normal w-5/6">
                        {
                          parseEmailContent(fetchedEmails[0].decodedContents)
                            .from
                        }
                      </p>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-gray-600 font-medium w-1/6">Subject</p>
                      <p className="text-black font-normal w-5/6">
                        {fetchedEmails[0].subject}
                      </p>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-gray-600 font-medium w-1/6">Date</p>
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
              {fetchedEmails.length > 0 && (
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
        </div>
      </div>
    </div>
  );
};
