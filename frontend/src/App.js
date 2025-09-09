// // // // // import React from 'react';
// // // // // import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
// // // // // import { ToastContainer } from 'react-toastify';
// // // // // import 'react-toastify/dist/ReactToastify.css';

// // // // // import Home from './components/pages/Home';
// // // // // import Upload from './components/pages/Upload';

// // // // // import Layout from './components/navigators/Layout'; // 💡 New layout wrapper

// // // // // import SignUp from './components/pages/SignUp'; 


// // // // // // Add route

// // // // // function App() {
// // // // //   return (
// // // // //     <Router>
// // // // //       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

// // // // //       <Routes>
// // // // //         {/* Wrap pages in Layout */}
// // // // //         <Route path="/" element={<Layout />}>
// // // // //           <Route index element={<Home />} />
// // // // //           <Route path="upload" element={<Upload />} />
// // // // //           <Route path='signup' element={<SignUp/>}/>
          
// // // // //         </Route>
// // // // //       </Routes>
// // // // //     </Router>
// // // // //   );
// // // // // }

// // // // // export default App;

// // // // import React from 'react';
// // // // import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
// // // // import { ToastContainer } from 'react-toastify';
// // // // import 'react-toastify/dist/ReactToastify.css';

// // // // import Home from './components/pages/Home';
// // // // import Upload from './components/pages/Upload';
// // // // import Layout from './components/navigators/Layout';
// // // // import SignUp from  './components/pages/SignUp';

// // // // function App() {
// // // //   return (
// // // //     <Router>
// // // //       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

// // // //       <Routes>
// // // //         {/* Redirect root to signup */}
// // // //         <Route path="/" element={<Navigate to="/signup" replace />} />
        
// // // //         {/* SignUp route */}
// // // //         <Route path="/signup" element={<SignUp />} />
        
// // // //         {/* Main website routes wrapped in Layout */}
// // // //         <Route path="/home" element={<Layout />}>
// // // //           {/* <Route index element={<Home />} />
// // // //           <Route path="/upload" element={<Upload />} /> */}
// // // //           <Route index element={<Home />} />
// // // //         <Route path="upload" element={<Upload />} />
// // // //         <Route path='signup' element={<SignUp/>}/>
// // // //         </Route>
// // // //       </Routes>
// // // //     </Router>
// // // //   );
// // // // }

// // // // export default App;

// // // import React from 'react';
// // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // import { ToastContainer } from 'react-toastify';
// // // import 'react-toastify/dist/ReactToastify.css';

// // // import Home from './components/pages/Home';
// // // import Upload from './components/pages/Upload';
// // // import Layout from './components/navigators/Layout';
// // // import SignUp from './components/pages/SignUp';
// // // import Dashboard from './components/pages/Dashboard';

// // // function App() {
// // //   return (
// // //     <Router>
// // //       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

// // //       <Routes>
// // //         {/* Redirect root to signup */}
// // //         <Route path="/" element={<Navigate to="/signup" replace />} />
        
// // //         {/* Signup route */}
// // //         <Route path="/signup" element={<SignUp />} />

// // //         {/* Main layout with nested pages */}
// // //         <Route path="/" element={<Layout />}>
// // //           <Route path="home" element={<Home />} />
// // //           <Route path="upload" element={<Upload />} />
// // //           <Route path='dashboard' element={<Dashboard/>}/>
// // //         </Route>
// // //       </Routes>
// // //     </Router>
// // //   );
// // // }

// // // export default App;

// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // import { ToastContainer } from 'react-toastify';
// // import 'react-toastify/dist/ReactToastify.css';

// // import Home from './components/pages/Home';
// // import Upload from './components/pages/Upload';
// // import Layout from './components/navigators/Layout';
// // import SignUp from './components/pages/SignUp';
// // import Dashboard from './components/pages/Dashboard';

// // function App() {
// //   return (
// //     <Router>
// //       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

// //       <Routes>
// //         {/* Redirect root to signup */}
// //         <Route path="/" element={<Navigate to="/signup" replace />} />

// //         {/* Public signup route */}
// //         <Route path="/signup" element={<SignUp />} />

// //         {/* Protected/main routes wrapped in Layout */}
// //         <Route path="/" element={<Layout />}>
// //           <Route path="home" element={<Home />} />
// //           <Route path="upload" element={<Upload />} />
// //           <Route path="dashboard" element={<Dashboard />} />
// //         </Route>

// //         {/* Catch-all: redirect unknown paths to signup */}
// //         <Route path="*" element={<Navigate to="/signup" replace />} />
// //       </Routes>
// //     </Router>
// //   );
// // }

// // export default App;

// import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

// import Home from './components/pages/Home';
// import Upload from './components/pages/Upload';
// import Layout from './components/navigators/Layout';
// import SignUp from './components/pages/SignUp';
// import Login from './components/pages/Login';
// import Dashboard from './components/pages/Dashboard';
// import AuthCallback from './components/pages/AuthCallback';
// import supabase from './components/pages/supabaseClient';
// import VoiceStudio from './components/pages/VoiceStudio';

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true; // Prevent state updates on unmounted component

//     const checkAuth = async () => {
//       try {
//         // Get current session from Supabase
//         const { data: { session }, error } = await supabase.auth.getSession();
        
//         if (!isMounted) return; // Component unmounted
        
//         if (error) {
//           console.error('Auth check error:', error);
//           setIsAuthenticated(false);
//         } else {
//           const isAuth = !!session;
//           setIsAuthenticated(isAuth);
          
//           // Store/update tokens if session exists
//           if (session) {
//             localStorage.setItem('access_token', session.access_token);
//             localStorage.setItem('refresh_token', session.refresh_token);
//             localStorage.setItem('user_id', session.user.id);
//             localStorage.setItem('user_email', session.user.email);
            
//             if (session.user.user_metadata) {
//               localStorage.setItem('user_metadata', JSON.stringify(session.user.user_metadata));
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Auth check failed:', error);
//         if (isMounted) {
//           setIsAuthenticated(false);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     checkAuth();

//     // Listen for auth state changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (!isMounted) return;
        
//         console.log('Auth state changed:', event);
        
//         if (event === 'SIGNED_IN' && session) {
//           setIsAuthenticated(true);
//           localStorage.setItem('access_token', session.access_token);
//           localStorage.setItem('refresh_token', session.refresh_token);
//           localStorage.setItem('user_id', session.user.id);
//           localStorage.setItem('user_email', session.user.email);
          
//           if (session.user.user_metadata) {
//             localStorage.setItem('user_metadata', JSON.stringify(session.user.user_metadata));
//           }
//         } else if (event === 'SIGNED_OUT') {
//           setIsAuthenticated(false);
//           // Clear all auth data
//           localStorage.removeItem('access_token');
//           localStorage.removeItem('refresh_token');
//           localStorage.removeItem('user_id');
//           localStorage.removeItem('user_email');
//           localStorage.removeItem('user_metadata');
//         }
//       }
//     );

//     // Cleanup function
//     return () => {
//       isMounted = false;
//       subscription.unsubscribe();
//     };
//   }, []);

//   // Show loading while checking authentication
//   if (loading) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         flexDirection: 'column'
//       }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p style={{ marginTop: '1rem' }}>Checking authentication...</p>
//       </div>
//     );
//   }

//   // Redirect to login if not authenticated
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Return protected content if authenticated
//   return children;
// };

// // Public Route Component (redirects authenticated users)
// const PublicRoute = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     const checkAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
        
//         if (isMounted) {
//           setIsAuthenticated(!!session);
//         }
//       } catch (error) {
//         console.error('Public route auth check failed:', error);
//         if (isMounted) {
//           setIsAuthenticated(false);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     checkAuth();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh'
//       }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   // If user is already authenticated, redirect to home
//   if (isAuthenticated) {
//     return <Navigate to="/home" replace />;
//   }

//   // Show public content if not authenticated
//   return children;
// };

// function App() {
//   return (
//     <Router>
//       <ToastContainer 
//         position="top-center" 
//         autoClose={3000} 
//         theme="colored"
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />

//       <Routes>
//         {/* Root redirect - smart routing based on auth state */}
//         <Route 
//           path="/" 
//           element={
//             <PublicRoute>
//               <Navigate to="/login" replace />
//             </PublicRoute>
//           } 
//         />

//         {/* Public authentication routes */}
//         <Route 
//           path="/login" 
//           element={
//             <PublicRoute>
//               <Login />
//             </PublicRoute>
//           } 
//         />
        
//         <Route 
//           path="/signup" 
//           element={
//             <PublicRoute>
//               <SignUp />
//             </PublicRoute>
//           } 
//         />

//         {/* Email verification callback route - no auth wrapper */}
//         <Route path="/auth/callback" element={<AuthCallback />} />

//         {/* Protected routes wrapped in Layout - Fixed nesting issue */}
//         <Route 
//           path="/home" 
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <Home />
//               </Layout>
//             </ProtectedRoute>
//           } 
//         />
        
//         <Route 
//           path="/upload" 
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <Upload />
//               </Layout>
//             </ProtectedRoute>
//           } 
//         />
        
//         <Route 
//           path="/dashboard" 
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <Dashboard />
//               </Layout>
//             </ProtectedRoute>
//           } 
//         />
        
//         <Route 
//           path="/voicestudio" 
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <VoiceStudio />
//               </Layout>
//             </ProtectedRoute>
//           } 
//         />

//         {/* Catch-all: redirect unknown paths to login */}
//         <Route 
//           path="*" 
//           element={<Navigate to="/login" replace />} 
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/pages/Home';
import Upload from './components/pages/Upload';
import Layout from './components/navigators/Layout';
import SignUp from './components/pages/SignUp';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import AuthCallback from './components/pages/AuthCallback';
import supabase from './components/pages/supabaseClient';
import VoiceStudio from './components/pages/VoiceStudio';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
        } else {
          const isAuth = !!session;
          setIsAuthenticated(isAuth);
          
          if (session) {
            localStorage.setItem('access_token', session.access_token);
            localStorage.setItem('refresh_token', session.refresh_token);
            localStorage.setItem('user_id', session.user.id);
            localStorage.setItem('user_email', session.user.email);
            
            if (session.user.user_metadata) {
              localStorage.setItem('user_metadata', JSON.stringify(session.user.user_metadata));
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
          localStorage.setItem('user_id', session.user.id);
          localStorage.setItem('user_email', session.user.email);
          
          if (session.user.user_metadata) {
            localStorage.setItem('user_metadata', JSON.stringify(session.user.user_metadata));
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_metadata');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Public route auth check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        theme="colored"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Navigate to="/login" replace />
            </PublicRoute>
          } 
        />

        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/voicestudio" 
          element={
            <ProtectedRoute>
              <Layout>
                <VoiceStudio />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
