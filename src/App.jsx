import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Verification from './pages/Verification';
import Print from './pages/Print';
import Navbar from './components/Navbar';

// Processing, Confirmation, Summary, Share kept for backward-compat but no longer in main flow
import Processing from './pages/Processing';
import Confirmation from './pages/Confirmation';
import Summary from './pages/Summary';
import Share from './pages/Share';

function App() {
  return (
    <Router>
      <>
        <Navbar />
        <Routes>
          {/* ── Main judge flow ── */}
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/print" element={<Print />} />

          {/* ── Legacy pages (kept intact) ── */}
          <Route path="/processing" element={<Processing />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/share" element={<Share />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;