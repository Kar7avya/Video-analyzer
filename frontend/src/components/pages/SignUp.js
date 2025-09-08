import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "./supabaseClient";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Check if Supabase is properly configured
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }
        
        // Test connection
        const { error } = await supabase.from('_test').select('*').limit(1);
        // Even if table doesn't exist, if we get here, Supabase is connected
        setSupabaseReady(true);
        console.log("✅ Supabase connection verified");
      } catch (err) {
        console.error("❌ Supabase connection failed:", err);
        toast.error("Authentication service unavailable. Please try again later.");
      }
    };
    
    checkSupabase();
  }, []);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("📩 Submitting form with data:", formData);

    if (!supabaseReady) {
      toast.error("Authentication service is not ready. Please refresh and try again.");
      return;
    }

    if (!formData.fullname || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Attempting Supabase signup...");
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullname },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log("🔍 Supabase response:", { data, error });

      if (error) {
        console.error("❌ Supabase signup error:", error);
        
        // Handle specific error types
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account first.");
        } else if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Try logging in instead.");
        } else if (error.message.includes("Invalid email")) {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error(error.message || "Failed to create account");
        }
        return;
      }

      if (!data.session) {
        console.log("✅ Signup success, but no session yet (check email)");
        toast.success(
          `Verification email sent to ${formData.email}. Please confirm before login.`
        );
        sessionStorage.setItem("pending_email", formData.email);
        navigate("/login?message=verify-email");
      } else {
        console.log("✅ Signup success with active session:", data.session);
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token);
        toast.success("Account created and logged in!");
        navigate("/home");
      }
    } catch (err) {
      console.error("⚡ Unexpected signup error:", err);
      
      if (err.message.includes("fetch")) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!supabaseReady) {
    return (
      <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <h2>Create Account</h2>
        <p>Loading authentication service...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
            placeholder="Full Name"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
            placeholder="Password (min 6 characters)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "0.75rem", 
            fontSize: "1rem",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        Already have an account?{" "}
        <button 
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;
