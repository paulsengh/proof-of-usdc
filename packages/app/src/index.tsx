import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { createPublicClient, http } from "viem";

const { connectors } = getDefaultWallets({
  appName: "ZK Email - Twitter Verifier",
  chains: [sepolia],
  projectId: "b68298f4e6597f970ac06be1aea7998d",
});

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
  connectors: connectors,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
