import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { SessionProvider } from "./services/SessionContext.jsx";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import RegisterForm from "./pages/RegisterForm.jsx";
import LoginForm from "./pages/LoginForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./index.css";

function App() {
  return (
    <SessionProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </SessionProvider>
  );
}

export default App;
