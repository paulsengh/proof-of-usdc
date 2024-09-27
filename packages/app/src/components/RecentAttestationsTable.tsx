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
          <tr className="border-b bg-[#F5F5F5] text-xs p-4">
            <th className="text-left py-2 px-4 font-medium text-gray-600">
              Platform <ChevronDown className="inline-block w-4 h-4 ml-1" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600">
              Status <ChevronDown className="inline-block w-4 h-4 ml-1" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600">
              Transaction Hash{" "}
              <ChevronDown className="inline-block w-4 h-4 ml-1" />
            </th>
            <th className="text-left py-2 px-4 font-medium text-gray-600">
              Creation Time{" "}
              <ChevronDown className="inline-block w-4 h-4 ml-1" />
            </th>
          </tr>
        </thead>
        <tbody>
          {attestations.map((attestation, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0 ? "bg-gray-50 text-[11px]" : "text-[11px]"
              }
            >
              <td className="py-2 px-4">{attestation.platform}</td>
              <td className="py-2 px-4">{attestation.status}</td>
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
