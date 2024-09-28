import { ChevronDown } from "lucide-react"

interface Props {
    colDefs: {
        field: string
        Header: string
        type: string
    }[]
    data: any[]
}

export const table = ({colDefs, data}: Props) => {
    return ( <table className="w-full">
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
          {data.map((attestation, index) => (
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
      </table>);
}