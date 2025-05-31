import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cliente from "./pages/Cliente";
import Barra from "./pages/Barra";
import PizzaKitchenDashboard from "./pages/PizzaKitchenDashboard";
import OrderConfirmation from "./pages/OrderConfirmation";
import DashboardAdmin from "./pages/DashboardAdmin";
import { USE_MOCKS } from "./config";

export default function App() {
  return (
    <Router>
      {USE_MOCKS && (
        <div style={{ position: 'fixed', right: 8, bottom: 8, zIndex: 2000, background: '#1f2937', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          DEV · MOCKS
        </div>
      )}
      <Routes>
        <Route path="/" element={<Cliente />} />
        <Route path="/barra" element={<Barra />} />
        <Route path="/cocina" element={<PizzaKitchenDashboard />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
      </Routes>
    </Router>
  );
}
