import { ethers } from "ethers";

// Example transaction input data
const inputData =
  "0x2ab1db1013b175377ce93a035af07fb39048b1e8fc3d891356b3f8450f2838a1f2a4f41c2bffa4b77809e8f880c76129f60ab9255dbb82275cf809c5b769c809b6f7166317aae80b387a65a7bd859de9c8ed26082d827bdc79854eb40272339e0ea1fe201f3c7a7edb132c6f8435cf835114ddc5365c41184cd5fea62db8c3265d81f0a51d7d4600c83c22e379117ea11b2729adcd77ed22e07d52a88e8efcf15af7806925e3474d0f6355ce784e4045f2443c6dd3943004f827171aa13a37393b68f2fc1dd00441e851f60691fb25430861daee22fa5c0a3ef29ba696565fdc7e7c024e26162bab2f2ba15143291b6243d6477783f0fe28d34f471af9113dea72170fc305289f31a838d16aa64b8bd0519d7de1add46548299208c6cf81914c2bf2ee8b0000000000000000000000000000000000000000000000000000000036322e322fb7eb5cacfa847bdfcbd5999d8ab0ec4caba89075bc68a4624875abb87d415f00000000000000000000000000000000000000000000323539333835353237310000000000000000000000009fb21c7fbfa9a1b293b4e4383c8ef8305ef2ca44";

// Example ABI
const mintAbi = [
  {
    type: "function",
    name: "mint",
    inputs: [
      {
        name: "proof",
        type: "uint256[8]",
        internalType: "uint256[8]",
      },
      {
        name: "signals",
        type: "uint256[5]",
        internalType: "uint256[5]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const iface = new ethers.Interface(mintAbi);

// Decode the input data
const decodedData = iface.parseTransaction({ data: inputData });

console.log("Function Name:", decodedData?.name);
console.log(
  "Proof:",
  decodedData?.args[0].map((n: any) => n.toString())
);
console.log(
  "Signals:",
  decodedData?.args[1].map((n: any) => n.toString())
);
