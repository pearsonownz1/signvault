import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import IntegrationsPage from "./components/integrations/IntegrationsPage";
import AuditLogPage from "./components/audit/AuditLogPage";
import DocumentViewer from "./components/documents/DocumentViewer";
import SettingsPage from "./components/settings/SettingsPage";
import LandingPage from "./components/landing/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import FeaturesPage from "./components/features/FeaturesPage";
import DemoRequestPage from "./components/demo/DemoRequestPage";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/request-demo" element={<DemoRequestPage />} />

          {/* Protected routes - in a real app, these would be protected with auth */}
          <Route path="/dashboard" element={<Home />} />
          <Route path="/dashboard/integrations" element={<Home />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/audit" element={<Home />} />
          <Route path="/settings" element={<Home />} />
          <Route path="/document/:id" element={<Home />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
