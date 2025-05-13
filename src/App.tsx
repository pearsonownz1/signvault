import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./lib/AuthContext";
import Home from "./components/home";
import IntegrationsPage from "./components/integrations/IntegrationsPage";
import AuditLogPage from "./components/audit/AuditLogPage";
import DocumentViewer from "./components/documents/DocumentViewer";
import VaultDocumentPage from "./components/documents/VaultDocumentPage";
import DocumentList from "./components/documents/DocumentList";
import SettingsPage from "./components/settings/SettingsPage";
import LandingPage from "./components/landing/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import FeaturesPage from "./components/features/FeaturesPage";
import DemoRequestPage from "./components/demo/DemoRequestPage";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import DocuSignCallback from "./components/integrations/DocuSignCallback";
import DocuSignComplete from "./components/integrations/DocuSignComplete";
import DocuSignIntegration from "./components/integrations/DocuSignIntegration";
import SignNowCallback from "./components/integrations/SignNowCallback";
import SignNowComplete from "./components/integrations/SignNowComplete";
import SignNowIntegration from "./components/integrations/SignNowIntegration";
import PandaDocCallback from "./components/integrations/PandaDocCallback";
import PandaDocComplete from "./components/integrations/PandaDocComplete";
import PandaDocIntegration from "./components/integrations/PandaDocIntegration";
import ApiIntegration from "./components/integrations/ApiIntegration";
import VerifyDocument from "./components/documents/VerifyDocument";
import VerifyDocumentPage from "./components/documents/VerifyDocumentPage";
import TestTransaction from "./components/blockchain/TestTransaction";
import routes from "tempo-routes";

function App() {
  return (
    <AuthProvider>
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
          <Route path="/integrations/docusign" element={<DocuSignIntegration />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/request-demo" element={<DemoRequestPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/verify" element={<VerifyDocument />} />
          <Route path="/verify/:id" element={<VerifyDocumentPage />} />
          <Route path="/api/docusign/callback" element={<DocuSignCallback />} />
          <Route path="/integrations/docusign-complete" element={<DocuSignComplete />} />
          <Route path="/api/signnow/callback" element={<SignNowCallback />} />
          <Route path="/integrations/signnow-complete" element={<SignNowComplete />} />
          <Route path="/integrations/signnow" element={<SignNowIntegration />} />
          <Route path="/api/pandadoc/callback" element={<PandaDocCallback />} />
          <Route path="/integrations/pandadoc-complete" element={<PandaDocComplete />} />
          <Route path="/integrations/pandadoc" element={<PandaDocIntegration />} />
          <Route path="/integrations/api" element={<ApiIntegration />} />
          <Route path="/test-blockchain" element={<TestTransaction />} />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/integrations" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/document/:id" 
            element={
              <ProtectedRoute>
                <DocumentViewer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vault-document" 
            element={
              <ProtectedRoute>
                <VaultDocumentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documents" 
            element={
              <ProtectedRoute>
                <DocumentList />
              </ProtectedRoute>
            } 
          />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
