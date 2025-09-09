// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import supabase from "./supabaseClient";

// const AuthCallback = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isProcessing, setIsProcessing] = useState(true);
//   const [message, setMessage] = useState("Verifying your email...");

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       try {
//         console.log("🔄 Processing auth callback...");
//         console.log("📍 Current URL:", window.location.href);
//         console.log("🔍 URL search params:", location.search);
        
//         setMessage("Processing verification...");

//         // Check if there are auth tokens in the URL
//         const urlParams = new URLSearchParams(location.search);
//         const accessToken = urlParams.get('access_token');
//         const refreshToken = urlParams.get('refresh_token');
//         const type = urlParams.get('type');
//         const error = urlParams.get('error');
//         const errorDescription = urlParams.get('error_description');

//         console.log("🔑 URL tokens found:", { 
//           accessToken: !!accessToken, 
//           refreshToken: !!refreshToken, 
//           type,
//           error,
//           errorDescription 
//         });

//         // Handle error cases
//         if (error) {
//           console.error("❌ Auth callback error:", error, errorDescription);
//           toast.error(errorDescription || "Email verification failed");
//           navigate("/login");
//           return;
//         }

//         // Let Supabase handle the callback automatically
//         const { data, error: sessionError } = await supabase.auth.getSession();
        
//         console.log("🔍 Session after callback:", { data, error: sessionError });

//         if (sessionError) {
//           console.error("❌ Session error:", sessionError);
          
//           // Try to exchange the tokens manually if they exist in URL
//           if (accessToken && refreshToken) {
//             try {
//               console.log("🔄 Attempting manual token exchange...");
//               const { data: authData, error: authError } = await supabase.auth.setSession({
//                 access_token: accessToken,
//                 refresh_token: refreshToken
//               });
              
//               if (authError) {
//                 throw authError;
//               }
              
//               if (authData.session) {
//                 console.log("✅ Manual token exchange successful");
//                 await handleSuccessfulAuth(authData.session);
//                 return;
//               }
//             } catch (exchangeError) {
//               console.error("❌ Manual token exchange failed:", exchangeError);
//             }
//           }
          
//           toast.error("Verification failed. Please try logging in.");
//           navigate("/login");
//           return;
//         }

//         // Check if we have a valid session
//         if (data.session && data.session.user) {
//           console.log("✅ Valid session found:", data.session.user.email);
//           await handleSuccessfulAuth(data.session);
//         } else {
//           // No session yet, wait for auth state change
//           console.log("⏳ No session yet, waiting for auth state change...");
//           setMessage("Finalizing verification...");
          
//           // Set up a listener for auth state changes
//           const { data: authListener } = supabase.auth.onAuthStateChange(
//             async (event, session) => {
//               console.log("🔄 Auth state changed:", event);
              
//               if (event === 'SIGNED_IN' && session) {
//                 console.log("✅ User signed in via auth state change");
//                 authListener.subscription.unsubscribe();
//                 await handleSuccessfulAuth(session);
//               } else if (event === 'TOKEN_REFRESHED' && session) {
//                 console.log("✅ Token refreshed via auth state change");
//                 authListener.subscription.unsubscribe();
//                 await handleSuccessfulAuth(session);
//               }
//             }
//           );

//           // Timeout after 10 seconds if no auth state change
//           setTimeout(() => {
//             authListener.subscription.unsubscribe();
//             if (isProcessing) {
//               console.log("⏰ Auth callback timeout");
//               toast.error("Verification taking too long. Please try logging in.");
//               navigate("/login");
//             }
//           }, 10000);
//         }
        
//       } catch (err) {
//         console.error("⚡ Unexpected callback error:", err);
//         toast.error("Something went wrong during verification.");
//         navigate("/login");
//       }
//     };

//     const handleSuccessfulAuth = async (session) => {
//       try {
//         setMessage("Verification successful! Redirecting...");
        
//         // Store session data
//         localStorage.setItem("access_token", session.access_token);
//         localStorage.setItem("refresh_token", session.refresh_token);
//         localStorage.setItem("user_id", session.user.id);
//         localStorage.setItem("user_email", session.user.email);
        
//         // Store user metadata if available
//         if (session.user.user_metadata) {
//           localStorage.setItem("user_metadata", JSON.stringify(session.user.user_metadata));
//         }

//         const userName = session.user.user_metadata?.full_name || 
//                         session.user.email.split("@")[0] || 
//                         "User";
        
//         console.log("✅ Auth callback successful for:", session.user.email);
//         toast.success(`Email verified! Welcome, ${userName}!`);
//         setIsProcessing(false);
        
//         // Small delay to show success message
//         setTimeout(() => {
//           navigate("/home");
//         }, 1500);
        
//       } catch (err) {
//         console.error("❌ Error handling successful auth:", err);
//         toast.error("Verification successful but couldn't save session. Please login.");
//         navigate("/login");
//       }
//     };

//     handleAuthCallback();
//   }, [navigate, location, isProcessing]);

//   return (
//     <div style={{ 
//       textAlign: "center", 
//       marginTop: "5rem",
//       padding: "2rem",
//       maxWidth: "500px",
//       margin: "5rem auto"
//     }}>
//       <div style={{ marginBottom: "2rem" }}>
//         {/* Loading spinner */}
//         <div style={{
//           width: "40px",
//           height: "40px",
//           border: "4px solid #f3f3f3",
//           borderTop: "4px solid #007bff",
//           borderRadius: "50%",
//           animation: "spin 1s linear infinite",
//           margin: "0 auto 1rem"
//         }}></div>
        
//         <style>
//           {`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}
//         </style>
//       </div>
      
//       <h2 style={{ color: "#333", marginBottom: "1rem" }}>
//         {isProcessing ? "Verifying Your Email" : "Verification Complete"}
//       </h2>
      
//       <p style={{ color: "#666", fontSize: "1.1rem" }}>
//         {message}
//       </p>
      
//       {isProcessing && (
//         <p style={{ color: "#999", fontSize: "0.9rem", marginTop: "2rem" }}>
//           This may take a few moments...
//         </p>
//       )}
      
//       <div style={{ marginTop: "2rem" }}>
//         <button
//           onClick={() => navigate("/login")}
//           style={{
//             padding: "0.5rem 1rem",
//             backgroundColor: "#6c757d",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//             fontSize: "0.9rem"
//           }}
//         >
//           Back to Login
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "./supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    const handleAuthCallback = async () => {
      try {
        console.log("Processing auth callback...");
        console.log("Current URL:", window.location.href);
        
        setMessage("Processing verification...");

        // Check URL parameters for errors
        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          console.error("Auth callback error:", error, errorDescription);
          toast.error(errorDescription || "Email verification failed");
          navigate("/login");
          return;
        }

        // First, try to get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (sessionError) {
          console.error("Session error:", sessionError);
          
          // If there's an error getting session, wait for auth state change
          setMessage("Finalizing verification...");
          
          authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed during callback:", event);
            
            if (!isMounted) return;
            
            if (event === 'SIGNED_IN' && session) {
              console.log("User signed in via auth state change");
              await handleSuccessfulAuth(session);
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log("Token refreshed via auth state change");
              await handleSuccessfulAuth(session);
            }
          });

          // Set a timeout for the auth state change
          setTimeout(() => {
            if (isMounted && authSubscription) {
              console.log("Auth callback timeout reached");
              authSubscription.data.subscription.unsubscribe();
              toast.error("Verification taking too long. Please try logging in.");
              navigate("/login");
            }
          }, 15000); // 15 second timeout
          
          return;
        }

        // If we have a valid session immediately
        if (sessionData.session && sessionData.session.user) {
          console.log("Valid session found immediately:", sessionData.session.user.email);
          await handleSuccessfulAuth(sessionData.session);
        } else {
          // No immediate session, wait for auth state change
          console.log("No immediate session, waiting for auth state change...");
          setMessage("Finalizing verification...");
          
          authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event);
            
            if (!isMounted) return;
            
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
              console.log("Authentication successful via state change");
              await handleSuccessfulAuth(session);
            }
          });

          // Timeout after 15 seconds
          setTimeout(() => {
            if (isMounted && authSubscription) {
              console.log("Auth callback timeout");
              authSubscription.data.subscription.unsubscribe();
              toast.error("Verification taking too long. Please try logging in manually.");
              navigate("/login");
            }
          }, 15000);
        }
        
      } catch (err) {
        console.error("Unexpected callback error:", err);
        if (isMounted) {
          toast.error("Something went wrong during verification. Please try logging in.");
          navigate("/login");
        }
      }
    };

    const handleSuccessfulAuth = async (session) => {
      try {
        if (!isMounted) return;
        
        setMessage("Verification successful! Redirecting...");
        
        // Cleanup subscription if it exists
        if (authSubscription) {
          authSubscription.data.subscription.unsubscribe();
          authSubscription = null;
        }
        
        // Store session data (though App.js will also do this)
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("refresh_token", session.refresh_token);
        localStorage.setItem("user_id", session.user.id);
        localStorage.setItem("user_email", session.user.email);
        
        if (session.user.user_metadata) {
          localStorage.setItem("user_metadata", JSON.stringify(session.user.user_metadata));
        }

        const userName = session.user.user_metadata?.full_name || 
                        session.user.email.split("@")[0] || 
                        "User";
        
        console.log("Auth callback successful for:", session.user.email);
        toast.success(`Email verified! Welcome, ${userName}!`);
        
        // Navigate to home after a short delay
        setTimeout(() => {
          if (isMounted) {
            navigate("/home", { replace: true });
          }
        }, 1500);
        
      } catch (err) {
        console.error("Error handling successful auth:", err);
        if (isMounted) {
          toast.error("Verification successful but couldn't complete login. Please try logging in.");
          navigate("/login");
        }
      }
    };

    handleAuthCallback();

    // Cleanup function
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [navigate, location]);

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row">
        <div className="col-12 text-center">
          <div className="card shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="card-body p-4">
              {/* Loading spinner */}
              <div className="mb-4">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              
              <h2 className="card-title mb-3">Verifying Your Email</h2>
              
              <p className="card-text text-muted mb-4">{message}</p>
              
              <p className="small text-muted mb-4">This may take a few moments...</p>
              
              <div className="mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="btn btn-outline-secondary"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
