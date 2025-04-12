import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from '../features/HomePage';
import TrackAnalysis from '../features/TrackAnalysis';

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