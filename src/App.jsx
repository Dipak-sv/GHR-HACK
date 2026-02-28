import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Verification from './pages/Verification';
import Confirmation from './pages/Confirmation';
import Summary from './pages/Summary';
import Navbar from './components/Navbar';
import Share from './pages/Share';

function App() {
  return (
    <Router>
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/share" element={<Share />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;