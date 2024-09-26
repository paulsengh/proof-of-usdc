import React, { useEffect } from "react";

const GoogleSignInButton = () => {
  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your actual client ID
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.prompt();
    } else {
      console.error("Google Identity Services not loaded");
    }
  };

  const handleCredentialResponse = (response) => {
    // This function will be called with the response from Google
    console.log("Encoded JWT ID token: " + response.credential);
    // Here you would typically send this token to your backend for verification
    // and to create a session for the user
  };

  return (
    <div className="flex justify-center">
      <button
        className="flex items-center justify-center py-2 px-12 border border-black rounded-2xl text-gray-700 bg-white hover:bg-gray-50"
        onClick={handleSignIn}
      >
        <img
          src="/google-logo.svg"
          alt="Google logo"
          width={20}
          height={20}
          className="mr-2"
        />
        <p className="text-sm">Sign in with Google</p>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
