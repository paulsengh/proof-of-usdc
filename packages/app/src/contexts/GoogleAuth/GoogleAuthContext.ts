import { createContext } from "react";

interface GoogleAuthValues {
  googleAuthToken: any | null;
  isGoogleAuthed: boolean;
  loggedInGmail: string | null;
  scopesApproved: boolean;
  googleLogIn: () => void;
  googleLogOut: () => void;
}

const defaultValues: GoogleAuthValues = {
  googleAuthToken: null,
  isGoogleAuthed: false,
  loggedInGmail: null,
  scopesApproved: false,
  googleLogIn: () => {},
  googleLogOut: () => {},
};

export const GoogleAuthContext = createContext<GoogleAuthValues>(defaultValues);
