import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Treasury from "./pages/Treasury";
import Salaries from "./pages/Salaries";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Users from "./pages/Users";
import Notes from "./pages/Notes";
import CredentialsVault from "./pages/CredentialsVault";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard - Admin, Supervisor, Accountant */}
              <Route path="/" element={
                <ProtectedRoute allowedRoles={["admin", "supervisor", "accountant"]}>
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Projects - Admin, Supervisor, Employee */}
              <Route path="/projects" element={
                <ProtectedRoute allowedRoles={["admin", "supervisor", "employee"]}>
                  <Projects />
                </ProtectedRoute>
              } />
              
              {/* Clients - Admin, Supervisor */}
              <Route path="/clients" element={
                <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                  <Clients />
                </ProtectedRoute>
              } />
              
              {/* Departments - Admin, Supervisor */}
              <Route path="/departments" element={
                <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                  <Departments />
                </ProtectedRoute>
              } />
              
              {/* Employees - Admin only */}
              <Route path="/employees" element={
                <ProtectedRoute requiredRole="admin">
                  <Employees />
                </ProtectedRoute>
              } />
              
              {/* Treasury - Admin, Accountant */}
              <Route path="/treasury" element={
                <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                  <Treasury />
                </ProtectedRoute>
              } />
              
              {/* Salaries - Admin, Accountant, Employee (for their own) */}
              <Route path="/salaries" element={
                <ProtectedRoute allowedRoles={["admin", "accountant", "employee"]}>
                  <Salaries />
                </ProtectedRoute>
              } />
              
              {/* Notes - All authenticated users */}
              <Route path="/notes" element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              } />
              
              {/* Settings - All authenticated users */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Account - All authenticated users */}
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              
              {/* Users Management - Admin only */}
              <Route path="/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              } />
              
              {/* Credentials Vault - Admin only */}
              <Route path="/credentials" element={
                <ProtectedRoute requiredRole="admin">
                  <CredentialsVault />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
