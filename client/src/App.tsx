import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import TrackAnalysis from './pages/TrackAnalysis';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/trackanalysis" element={<TrackAnalysis/>} />
      </Routes>
    </Router>
  )
}

export default App