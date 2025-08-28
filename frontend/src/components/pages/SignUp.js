import React, { useState } from "react";
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

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("📩 Submitting form with data:", formData);

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
        toast.error(error.message);
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
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full Name"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          required
        />
        <input
          placeholder="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          placeholder="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")}>Login</button>
      </p>
    </div>
  );
};

export default SignUp;
