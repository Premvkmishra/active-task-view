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
import { getUserRole } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useState<'admin' | 'contributor'>('contributor');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role || 'contributor');
    setIsLoading(false);
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
