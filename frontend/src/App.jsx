import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import MinerDashboard from "./pages/MinerDashboard";
import InvestigatorDashboard from "./pages/InvestigatorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/miner" element={<MinerDashboard />} />
        <Route path="/investigator" element={<InvestigatorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;