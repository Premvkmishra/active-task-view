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
import { getUserRole, isTokenValid, refreshAccessToken } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useState<'admin' | 'contributor'>('contributor');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('access_token');
      
      // If no token, redirect to login
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      // Check if token is valid
      if (!isTokenValid()) {
        console.log('Token is invalid or expired, trying to refresh...');
        
        // Try to refresh the token
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          console.log('Failed to refresh token, redirecting to login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return;
        }
      }
      
      const role = getUserRole();
      setUserRole(role || 'contributor');
      setIsLoading(false);
    };

    initializeApp();
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
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={<Layout userRole={userRole} />}>
              <Route index element={<Navigate to="/dashboard/projects" replace />} />
              <Route path="projects" element={<ProjectsList userRole={userRole} />} />
              <Route path="tasks" element={<TasksList userRole={userRole} />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="export" element={<ExportTasks />} />
            </Route>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
