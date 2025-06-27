
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoginForm } from "./components/LoginForm";
import { ProjectsList } from "./components/ProjectsList";
import { TasksList } from "./components/TasksList";
import { ActivityLogs } from "./components/ActivityLogs";
import { ExportTasks } from "./components/ExportTasks";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Demo user role - in real app, this would come from authentication
const userRole: 'admin' | 'contributor' = 'admin';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Layout userRole={userRole} />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsList userRole={userRole} />} />
            <Route path="/tasks" element={<TasksList userRole={userRole} />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/export" element={<ExportTasks />} />
          </Route>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
