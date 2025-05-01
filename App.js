// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DJ from './DJ';
import Part from './Part';

function App() {
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>BubbleSound</h1>
        <Link to="/dj">Mode DJ</Link>
        <br />
        <Link to="/part">Mode Participant</Link>

        <Routes>
          <Route path="/dj" element={<DJ />} />
          <Route path="/part" element={<Part />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;