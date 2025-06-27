
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ExportTasks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/tasks/export/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
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
        toast({
          title: "Error",
          description: "Failed to export tasks",
          variant: "destructive",
        });
      }
    } catch (error) {
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
          <Button 
            onClick={handleExport} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export Tasks'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
