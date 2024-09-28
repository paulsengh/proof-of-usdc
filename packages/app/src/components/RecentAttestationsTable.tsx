import { ChevronDown } from "lucide-react";

const attestations = [
  {
    platform: "Coinbase",
    status: "Running",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "2 sec ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9234dbb2e5f1f...",
    creationTime: "1 min ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "1 hr ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "2 hrs ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "35 days ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "120 days ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "120 days ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "120 days ago",
  },
  {
    platform: "Coinbase",
    status: "Success",
    transactionHash: "9fcdbb2e5f1a4f...",
    creationTime: "120 days ago",
  },
];

const RecentAttestationsTable = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <h2 className="text-sm font-geist-mono font-medium p-4 text-[#525252]">
        RECENT ATTESTATIONS
      </h2>
      <table className="w-full">
        <thead>
          <tr className="bg-[#F5F5F5] text-xs p-4 h-[40px]">
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Platform{" "}
              <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Status{" "}
              <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Transaction Hash{" "}
              <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600 relative">
              Creation Time{" "}
              <img src="/sort-16.svg" className="inline float-right w-3" />
            </th>
          </tr>
        </thead>
        <tbody>
          {attestations.map((attestation, index) => (
            <tr key={index} className={"text-[11px] h-[44px] border-b"}>
              <td className="py-2 px-4 text-[#0C2B32]">
                {attestation.platform}
              </td>
              <td className="py-2 px-4  text-[#0C2B32]">
                {attestation.status}
              </td>
              <td className="py-2 px-4 text-xs underline">
                {attestation.transactionHash}
              </td>
              <td className="py-2 px-4 text-gray-500">
                {attestation.creationTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAttestationsTable;
