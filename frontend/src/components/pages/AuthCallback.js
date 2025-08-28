import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "./supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          toast.error("Verification failed. Try again.");
          navigate("/login");
          return;
        }

        if (data.session) {
          localStorage.setItem("access_token", data.session.access_token);
          localStorage.setItem("refresh_token", data.session.refresh_token);
          localStorage.setItem("user_id", data.session.user.id);
          localStorage.setItem("user_email", data.session.user.email);

          toast.success("Email verified! Logged in successfully.");
          navigate("/home");
        } else {
          toast.error("No session found. Please login.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Callback error:", err);
        toast.error("Something went wrong.");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>Verifying your email...</h2>
      <p>Please wait.</p>
    </div>
  );
};

export default AuthCallback;
