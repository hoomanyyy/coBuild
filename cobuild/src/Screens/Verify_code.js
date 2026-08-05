import "../styles/LoginScreen.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Verify_code() {

  const BASE_URL = "http://127.0.0.1:5000";

  const location = useLocation();
  const navigate = useNavigate();

  const needVerification = localStorage.getItem("needVerification");

  const { Email } = location.state || {};

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  async function handleVerification(e) {

    e.preventDefault();

    if (isLoading) return;

    if (!code.trim()) {
      setErrorMessage("Please enter verification code.");
      return;
    }


    setIsLoading(true);
    setErrorMessage("");


    try {

      const response = await axios.post(
        BASE_URL + "/api/verification",
        {
          Code: code,
          Email: Email
        },
        {
          withCredentials: true
        }
      );


      if (response.data.Message === true) {

        localStorage.removeItem("needVerification");

        navigate("/dashboard", {
          replace: true
        });

      } 
      else {

        setErrorMessage(
          response.data.error || "Verification code is invalid."
        );

      }


    } catch(err) {

      setErrorMessage(
        "Verification failed. Please try again."
      );

    }
    finally {

      setIsLoading(false);

    }

  }


  if (!needVerification) {
    navigate("/");
    return null;
  }


  return (

    <div className="auth-container">

      <div className="auth-backdrop" />


      <div className="auth-card">


        <div className="auth-logo">
          ✓
        </div>


        <h1 className="auth-title">
          Verify Account
        </h1>


        <p className="auth-subtitle">
          Enter the verification code sent to your email
        </p>



        {errorMessage && (
          <div className="auth-error">
            {errorMessage}
          </div>
        )}



        <form onSubmit={handleVerification} noValidate>


          <div className="input-group">

            <label htmlFor="code">
              Verification Code
            </label>


            <input
              id="code"
              value={code}
              onChange={(e)=>setCode(e.target.value)}
              type="text"
              placeholder="123456"
              maxLength="6"
              autoComplete="one-time-code"
            />

          </div>



          <button
            className="auth-button"
            type="submit"
            disabled={isLoading}
          >

            {
              isLoading
              ?
              <span className="spinner" />
              :
              "Verify"
            }

          </button>


        </form>


      </div>


    </div>

  );
}