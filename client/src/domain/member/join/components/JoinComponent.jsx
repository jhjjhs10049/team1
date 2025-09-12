import React, { useState } from "react";
import EmailVerificationStep from "./EmailVerificationStep";
import JoinForm from "./JoinForm";

const JoinComponent = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const handleVerificationComplete = (email) => {
    setVerifiedEmail(email);
    setIsEmailVerified(true);
  };

  const handleBackToVerification = () => {
    setIsEmailVerified(false);
    setVerifiedEmail("");
  };

  return (
    <div>
      {!isEmailVerified ? (
        <EmailVerificationStep
          onVerificationComplete={handleVerificationComplete}
        />
      ) : (
        <JoinForm
          verifiedEmail={verifiedEmail}
          onBackToVerification={handleBackToVerification}
        />
      )}
    </div>
  );
};

export default JoinComponent;
