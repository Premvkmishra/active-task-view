import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserRole } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select as UiSelect, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue, SelectContent as UiSelectContent, SelectItem as UiSelectItem } from '@/components/ui/select';
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
  // Modal state
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterOwner, setFilterOwner] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchProjects();
  }, [showDeleted]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const url = `${API_URL}/api/projects/` + (showDeleted ? '?all=1' : '');
      const response = await fetch(url, {
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Project created.' });
        setOpen(false);
        setNewTitle('');
        setNewDesc('');
        fetchProjects();
      } else {
        toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to connect to server', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (project: Project) => {
    setEditProject(project);
    setEditTitle(project.title);
    setEditDesc(project.description);
    setEditOpen(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    setEditSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/${editProject.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Project updated.' });
        setEditOpen(false);
        setEditProject(null);
        fetchProjects();
      } else {
        toast({ title: 'Error', description: 'Failed to update project', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to connect to server', variant: 'destructive' });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/${id}/restore/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Project restored.' });
        fetchProjects();
      } else {
        toast({ title: 'Error', description: 'Failed to restore project', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to connect to server', variant: 'destructive' });
    }
  };

  // Filtering and sorting logic
  const owners = Array.from(new Set(projects.map(p => p.owner)));
  const filteredProjects = projects
    .filter(project =>
      (!search || project.title.toLowerCase().includes(search.toLowerCase()) || project.description.toLowerCase().includes(search.toLowerCase())) &&
      (filterOwner === 'all' || project.owner === filterOwner)
    )
    .sort((a, b) => {
      let valA = a[sortBy as keyof Project];
      let valB = b[sortBy as keyof Project];
      if (sortBy === 'created_at') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-deleted" checked={showDeleted} onCheckedChange={setShowDeleted} />
              <label htmlFor="show-deleted" className="text-sm">Show Deleted</label>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Project</DialogTitle>
                  <DialogDescription>Enter project details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Title</Label>
                    <Input id="project-title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-desc">Description</Label>
                    <Textarea id="project-desc" value={newDesc} onChange={e => setNewDesc(e.target.value)} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Project'}</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Filter/Search/Sort Controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <Label htmlFor="project-search">Search</Label>
          <Input id="project-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." />
        </div>
        <div>
          <Label htmlFor="project-filter-owner">Owner</Label>
          <UiSelect value={filterOwner} onValueChange={v => setFilterOwner(v)}>
            <UiSelectTrigger id="project-filter-owner">
              <UiSelectValue placeholder="All" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="all">All</UiSelectItem>
              {owners.map(owner => (
                <UiSelectItem key={owner} value={owner}>{owner}</UiSelectItem>
              ))}
            </UiSelectContent>
          </UiSelect>
        </div>
        <div>
          <Label htmlFor="project-sort-by">Sort By</Label>
          <UiSelect value={sortBy} onValueChange={v => setSortBy(v)}>
            <UiSelectTrigger id="project-sort-by">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="created_at">Created Date</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
        <div>
          <Label htmlFor="project-sort-order">Order</Label>
          <UiSelect value={sortOrder} onValueChange={v => setSortOrder(v as any)}>
            <UiSelectTrigger id="project-sort-order">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="asc">Ascending</UiSelectItem>
              <UiSelectItem value="desc">Descending</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className={`hover:shadow-lg transition-shadow ${project.is_deleted ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {userRole === 'admin' && !project.is_deleted && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(project)}>
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
                {userRole === 'admin' && project.is_deleted && (
                  <Button variant="outline" size="sm" onClick={() => handleRestore(project.id)}>
                    Restore
                  </Button>
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

      {filteredProjects.length === 0 && (
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

      {/* Edit Project Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-title">Title</Label>
              <Input id="edit-project-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-desc">Description</Label>
              <Textarea id="edit-project-desc" value={editDesc} onChange={e => setEditDesc(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editSubmitting}>{editSubmitting ? 'Saving...' : 'Save Changes'}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
