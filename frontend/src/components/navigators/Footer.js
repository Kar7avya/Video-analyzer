// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

// function Footer() {
//   return (
//     <footer className="bg-dark text-white text-center py-3 mt-auto">
//       <div className="container">
//         &copy; {new Date().getFullYear()} MyApp. All rights reserved.
//       </div>
//     </footer>
//   );
// }

// export default Footer;
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-auto"> {/* mt-auto pushes footer to bottom */}
      <div className="container text-center">
        <p className="mb-0">&copy; {new Date().getFullYear()} AI Speech Coach. All rights reserved.</p>
        <p className="mb-0 text-muted small">Powered by Gemini, Deepgram, ElevenLabs, and Supabase.</p>
      </div>
    </footer>
  );
}