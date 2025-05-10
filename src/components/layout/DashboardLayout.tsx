import { cn } from "@/lib/utils";
import {
  Folder,
  Lock,
  Clock,
  Settings,
  LogOut,
  Home,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import DocumentList from "@/components/documents/DocumentList";
import DashboardIntegrationsPage from "@/components/dashboard/DashboardIntegrationsPage";
import AuditLogPage from "@/components/audit/AuditLogPage";
import DocumentViewer from "@/components/documents/DocumentViewer";
import SettingsPage from "@/components/settings/SettingsPage";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, label, href, isActive }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex min-h-screen bg-background font-geist">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r bg-card px-4 py-6">
        <div className="flex h-full flex-col">
          <div className="mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-bold text-primary">SignVault</h1>
              <p className="text-xs text-muted-foreground">
                Document Security Platform
              </p>
            </Link>
          </div>

          <nav className="space-y-1">
            <NavItem
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              href="/dashboard"
              isActive={
                path === "/dashboard" &&
                !path.includes("/dashboard/integrations")
              }
            />
            <NavItem
              icon={<Folder className="h-5 w-5" />}
              label="Documents"
              href="/dashboard"
              isActive={
                (path === "/dashboard" &&
                  !path.includes("/dashboard/integrations")) ||
                path.includes("/document/")
              }
            />
            <NavItem
              icon={<LinkIcon className="h-5 w-5" />}
              label="Integrations"
              href="/dashboard/integrations"
              isActive={path.includes("/dashboard/integrations")}
            />
            <NavItem
              icon={<Clock className="h-5 w-5" />}
              label="Audit Log"
              href="/audit"
              isActive={path.includes("audit")}
            />
            <NavItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              href="/settings"
              isActive={path.includes("settings")}
            />
          </nav>

          <div className="mt-auto">
            <NavItem
              icon={<LogOut className="h-5 w-5" />}
              label="Sign Out"
              href="/login"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        {path === "/dashboard" && <DocumentList />}
        {path === "/dashboard/integrations" && <DashboardIntegrationsPage />}
        {path === "/audit" && <AuditLogPage />}
        {path === "/settings" && <SettingsPage />}
        {path.startsWith("/document/") && <DocumentViewer />}
        {path !== "/dashboard" &&
          path !== "/dashboard/integrations" &&
          path !== "/audit" &&
          path !== "/settings" &&
          !path.startsWith("/document/") &&
          children}
      </main>
    </div>
  );
}
