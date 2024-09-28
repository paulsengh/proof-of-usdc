import { useContext } from "react";
import { GoogleAuthContext } from "../contexts/GoogleAuth/GoogleAuthContext";

const useGoogleAuth = () => {
  return { ...useContext(GoogleAuthContext) };
};

export default useGoogleAuth;
