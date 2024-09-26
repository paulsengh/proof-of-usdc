import { ReactNode } from "react";
import GoogleAuthProvider from "./contexts/GoogleAuth/GoogleAuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleAuthProvider>{children}</GoogleAuthProvider>
    </GoogleOAuthProvider>
  );
}
