import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(verifyEmailInput: { token: $token }) {
      message
    }
  }
`;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyEmail, { data, loading, error }] = useMutation(
    VERIFY_EMAIL_MUTATION
  );
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail({ variables: { token } })
        .then((res) => {
          setStatus(res.data.verifyEmail.message);
          setTimeout(() => navigate("/login"), 2000);
        })
        .catch((err) => {
          setStatus(err.message || "Verification failed.");
        });
    } else {
      setStatus("Invalid verification link.");
    }
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
};

export default VerifyEmail;
