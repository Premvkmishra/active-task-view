import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, isTokenValid, refreshAccessToken } from '@/lib/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

export const ExportTasks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const response = await apiRequest(`${API_URL}/api/tasks/test_auth/`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth test successful:', data);
        toast({
          title: "Auth Test",
          description: "Authentication is working correctly",
        });
      } else {
        const errorData = await response.json();
        console.error('Auth test failed:', errorData);
        toast({
          title: "Auth Test Failed",
          description: errorData.detail || "Authentication test failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Auth test exception:', error);
      toast({
        title: "Auth Test Error",
        description: "Failed to test authentication",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // Check if token is valid first
      if (!isTokenValid()) {
        console.log('Token is invalid, attempting to refresh...');
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to export tasks",
            variant: "destructive",
          });
          // Redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return;
        }
      }

      // Debug: Log the token being used
      const token = localStorage.getItem('access_token');
      console.log('Using token for export:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Use the apiRequest helper which handles token refresh automatically
      console.log('Making export request to:', `${API_URL}/api/tasks/export/`);
      const response = await apiRequest(`${API_URL}/api/tasks/export/`);

      console.log('Export response status:', response.status);
      console.log('Export response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Export data received:', data);
        
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Tasks exported successfully",
        });
      } else {
        const errorData = await response.json();
        console.error('Export error:', errorData);
        
        if (errorData.code === 'token_not_valid') {
          toast({
            title: "Authentication Error",
            description: "Please log in again to export tasks",
            variant: "destructive",
          });
          // Redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        } else {
          toast({
            title: "Error",
            description: errorData.detail || "Failed to export tasks",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Export exception:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Export Tasks</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Due Soon
            </CardTitle>
            <CardDescription>
              Tasks due in the next 48 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <div className="text-sm text-gray-600">tasks due soon</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Overdue
            </CardTitle>
            <CardDescription>
              Tasks that are past their due date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">5</div>
            <div className="text-sm text-gray-600">overdue tasks</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recently Completed
            </CardTitle>
            <CardDescription>
              Tasks completed in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">recently completed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export All Task Data</CardTitle>
          <CardDescription>
            Download a comprehensive JSON file containing all task categories: due soon, overdue, and recently completed tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={testAuth}
              variant="outline"
              className="flex items-center gap-2"
            >
              Test Auth
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Exporting...' : 'Export Tasks'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
