// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import "../navigators/Header.css";

// const Header = () => {
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <nav className={`navbar ${scrolled ? "scrolled-navbar" : ""}`}>
//       <div className="container">
//         <Link className="navbar-brand" to="/">
//           MyBrand
//         </Link>
//         <div className="nav-links">
//           <Link className="nav-link" to="/">Home</Link>
//           <Link className="nav-link" to="../upload">Upload</Link>
//           <Link className="nav-link" to="../dashboard">Dashboard</Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Header;

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../navigators/Header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled-navbar" : ""}`}>
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          MyBrand
        </NavLink>
        <div className="nav-links">
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "active-link" : ""}`
            }
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "active-link" : ""}`
            }
            to="/upload"
          >
            Upload
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "active-link" : ""}`
            }
            to="/dashboard"
          >
            Dashboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Header;
