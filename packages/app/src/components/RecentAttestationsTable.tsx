import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi } from "../ProofOfUSDC";
import { ChevronDown } from "lucide-react";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const infuraProjectId = import.meta.env.VITE_INFURA_PROJECT_ID;

interface Attestation {
  to: string;
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

const RecentAttestationsTable = () => {
  const [attestations, setAttestations] = useState<Attestation[]>([]);

  useEffect(() => {
    const fetchAttestations = async () => {
      try {
        console.log("fetchAttestations function called");
        const provider = new ethers.InfuraProvider("sepolia", infuraProjectId);
        console.log("Provider set up:", provider);

        const contract = new ethers.Contract(contractAddress, abi, provider);
        console.log("Contract instance created:", contract);
        console.log("Contract Address:", contractAddress);
        console.log("Contract ABI:", abi);

        const filter = contract.filters.Transfer();
        console.log("Event filter created:", filter);

        const latestBlock = await provider.getBlockNumber();
        console.log("Latest block number:", latestBlock);

        const events = await contract.queryFilter(filter, latestBlock - 10000, latestBlock);
        console.log("Events fetched:", events);

        if (events.length === 0) {
          console.log("No events found in the specified block range.");
        }
        console.log("Events:", events);
        const fetchedAttestations = await Promise.all(events.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          return {
            to: event.args.to,
            tokenId: event.args.tokenId.toString(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
          };
        }));

        setAttestations(fetchedAttestations);
      } catch (error) {
        console.error("Error fetching attestations:", error);
      }
    };

    fetchAttestations();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <h2 className="text-sm font-geist-mono font-medium p-4 text-[#525252]">
        RECENT ATTESTATIONS
      </h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-[#F5F5F5] text-xs p-4 h-[40px]">
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              To <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Transaction Hash <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Block Number <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Timestamp <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
          </tr>
        </thead>
        <tbody>
          {attestations.map((attestation, index) => (
            <tr key={index} className="text-[11px] h-[44px] border-b">
              <td className="py-2 px-4 text-[#0C2B32] truncate max-w-[150px]">{attestation.to}</td>
              <td className="py-2 px-4 text-xs underline truncate max-w-[200px]">{attestation.transactionHash}</td>
              <td className="py-2 px-4 text-gray-500 truncate max-w-[100px]">{attestation.blockNumber}</td>
              <td className="py-2 px-4 text-gray-500 truncate max-w-[150px]">{new Date(attestation.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAttestationsTable;