import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { LoginForm } from "./components/LoginForm";
import { ProjectsList } from "./components/ProjectsList";
import { TasksList } from "./components/TasksList";
import { ActivityLogs } from "./components/ActivityLogs";
import { ExportTasks } from "./components/ExportTasks";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { getUserRole, isTokenValid, refreshAccessToken, getUserRoleFromAPI } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useState<'admin' | 'contributor'>('contributor');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Debug: Log environment variables
  useEffect(() => {
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('Environment:', import.meta.env.MODE);
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      const token = localStorage.getItem('access_token');
      
      // If no token, user is not authenticated
      if (!token) {
        console.log('No token found, user not authenticated');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Check if token is valid
      if (!isTokenValid()) {
        console.log('Token is invalid or expired, trying to refresh...');
        
        // Try to refresh the token
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          console.log('Failed to refresh token, clearing auth data');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
      }
      
      // Try to get role from JWT token first
      let role = getUserRole();
      
      // If JWT doesn't contain role info, try API fallback
      if (!role) {
        console.log('JWT token doesn\'t contain role info, trying API fallback...');
        role = await getUserRoleFromAPI();
      }
      
      console.log('Setting user as authenticated with role:', role);
      setUserRole(role || 'contributor');
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      // On error, assume user is not authenticated
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const handleAuthChange = () => {
      initializeApp();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
            } />
            <Route path="/dashboard" element={
              isAuthenticated ? <Layout userRole={userRole} /> : <Navigate to="/login" replace />
            }>
              <Route index element={<Navigate to="/dashboard/projects" replace />} />
              <Route path="projects" element={<ProjectsList userRole={userRole} />} />
              <Route path="tasks" element={<TasksList userRole={userRole} />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="export" element={<ExportTasks />} />
            </Route>
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Index />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
