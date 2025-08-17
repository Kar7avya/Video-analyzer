// // // import React from 'react';
// // // import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
// // // import { ToastContainer } from 'react-toastify';
// // // import 'react-toastify/dist/ReactToastify.css';

// // // import Home from './components/pages/Home';
// // // import Upload from './components/pages/Upload';

// // // import Layout from './components/navigators/Layout'; // 💡 New layout wrapper

// // // import SignUp from './components/pages/SignUp'; 


// // // // Add route

// // // function App() {
// // //   return (
// // //     <Router>
// // //       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

// // //       <Routes>
// // //         {/* Wrap pages in Layout */}
// // //         <Route path="/" element={<Layout />}>
// // //           <Route index element={<Home />} />
// // //           <Route path="upload" element={<Upload />} />
// // //           <Route path='signup' element={<SignUp/>}/>
          
// // //         </Route>
// // //       </Routes>
// // //     </Router>
// // //   );
// // // }

// // // export default App;

// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
// // import { ToastContainer } from 'react-toastify';
// // import 'react-toastify/dist/ReactToastify.css';

// // import Home from './components/pages/Home';
// // import Upload from './components/pages/Upload';
// // import Layout from './components/navigators/Layout';
// // import SignUp from  './components/pages/SignUp';

// // function App() {
// //   return (
// //     <Router>
// //       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

// //       <Routes>
// //         {/* Redirect root to signup */}
// //         <Route path="/" element={<Navigate to="/signup" replace />} />
        
// //         {/* SignUp route */}
// //         <Route path="/signup" element={<SignUp />} />
        
// //         {/* Main website routes wrapped in Layout */}
// //         <Route path="/home" element={<Layout />}>
// //           {/* <Route index element={<Home />} />
// //           <Route path="/upload" element={<Upload />} /> */}
// //           <Route index element={<Home />} />
// //         <Route path="upload" element={<Upload />} />
// //         <Route path='signup' element={<SignUp/>}/>
// //         </Route>
// //       </Routes>
// //     </Router>
// //   );
// // }

// // export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import Home from './components/pages/Home';
// import Upload from './components/pages/Upload';
// import Layout from './components/navigators/Layout';
// import SignUp from './components/pages/SignUp';
// import Dashboard from './components/pages/Dashboard';

// function App() {
//   return (
//     <Router>
//       <ToastContainer position="top-center" autoClose={3000} theme="colored" />

//       <Routes>
//         {/* Redirect root to signup */}
//         <Route path="/" element={<Navigate to="/signup" replace />} />
        
//         {/* Signup route */}
//         <Route path="/signup" element={<SignUp />} />

//         {/* Main layout with nested pages */}
//         <Route path="/" element={<Layout />}>
//           <Route path="home" element={<Home />} />
//           <Route path="upload" element={<Upload />} />
//           <Route path='dashboard' element={<Dashboard/>}/>
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './components/pages/Home';
import Upload from './components/pages/Upload';
import Layout from './components/navigators/Layout';
import SignUp from './components/pages/SignUp';
import Dashboard from './components/pages/Dashboard';

function App() {
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      <Routes>
        {/* Redirect root to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Public signup route */}
        <Route path="/signup" element={<SignUp />} />

        {/* Protected/main routes wrapped in Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="upload" element={<Upload />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        {/* Catch-all: redirect unknown paths to signup */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

