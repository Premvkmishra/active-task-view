import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserRole } from '@/lib/auth';

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  owner: string;
  is_deleted: boolean;
}

interface ProjectsListProps {
  userRole: 'admin' | 'contributor';
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const ProjectsList: React.FC<ProjectsListProps> = ({ userRole }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.results || data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch projects",
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        fetchProjects();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {userRole === 'admin' && (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {userRole === 'admin' && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <Badge variant="secondary">{project.owner}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No projects found</div>
          {userRole === 'admin' && (
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create your first project
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
