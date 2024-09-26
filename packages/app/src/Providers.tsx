import React from "react";
import GoogleAuthProvider from "./contexts/GoogleAuth/GoogleAuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const clientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;

  return (
    <GoogleOAuthProvider
      clientId={
        "147362513061-s7kjiv19fll3vc8tmf5lb3s1qhjq54nd.apps.googleusercontent.com"
      }
    >
      <GoogleAuthProvider>{children}</GoogleAuthProvider>
    </GoogleOAuthProvider>
  );
};

export default Providers;
