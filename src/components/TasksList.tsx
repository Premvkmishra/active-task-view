import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserRole } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select as UiSelect, SelectContent as UiSelectContent, SelectItem as UiSelectItem, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  due_date: string;
  assigned_to: string;
  project_title: string;
  is_deleted: boolean;
}

interface TasksListProps {
  userRole: 'admin' | 'contributor';
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
};

const API_URL = import.meta.env.VITE_API_URL || '';

export const TasksList: React.FC<TasksListProps> = ({ userRole }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Modal state
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newProject, setNewProject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<{id: number, username: string}[]>([]);
  const [projects, setProjects] = useState<{id: number, title: string}[]>([]);
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Get current user for contributor task creation
  const [currentUser, setCurrentUser] = useState<{id: number, username: string} | null>(null);

  useEffect(() => {
    fetchTasks();
    if (userRole === 'admin') {
      fetchUsers();
      fetchProjects();
    }
    if (userRole === 'contributor') {
      const token = localStorage.getItem('access_token');
      fetch(`${API_URL}/api/users/me/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => setCurrentUser(data));
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const url = `${API_URL}/api/tasks/` + (showDeleted ? '?all=1' : '');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.results || data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/users/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || data);
      }
    } catch {}
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.results || data);
      }
    } catch {}
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      console.log(`Updating task ${id} status to ${newStatus}`);
      console.log('Request method: PATCH');
      console.log('Request URL:', `${API_URL}/api/tasks/${id}/update_status/`);
      console.log('Request body:', JSON.stringify({ status: newStatus }));
      
      const response = await fetch(`${API_URL}/api/tasks/${id}/update_status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Status update response:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json();
        console.log('Status update success:', responseData);
        toast({
          title: "Success",
          description: "Task status updated successfully",
        });
        fetchTasks();
      } else {
        const errorData = await response.json();
        console.error('Status update error:', errorData);
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update task status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Status update exception:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      let assignedTo = newAssignedTo;
      if (userRole === 'contributor' && currentUser) {
        assignedTo = String(currentUser.id);
      }
      const response = await fetch(`${API_URL}/api/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          status: newStatus,
          due_date: newDueDate,
          assigned_to: assignedTo,
          project: newProject,
        }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Task created.' });
        setOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewStatus('TODO');
        setNewDueDate('');
        setNewAssignedTo('');
        setNewProject('');
        fetchTasks();
      } else {
        toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to connect to server', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditStatus(task.status);
    setEditDueDate(task.due_date ? task.due_date.slice(0, 16) : '');
    setEditAssignedTo(task.assigned_to ? String(users.find(u => u.username === task.assigned_to)?.id || '') : '');
    setEditProject(projects.find(p => p.title === task.project_title)?.id ? String(projects.find(p => p.title === task.project_title)?.id) : '');
    setEditOpen(true);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    setEditSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/tasks/${editTask.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          status: editStatus,
          due_date: editDueDate,
          assigned_to: editAssignedTo,
          project: editProject,
        }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Task updated.' });
        setEditOpen(false);
        setEditTask(null);
        fetchTasks();
      } else {
        toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
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
      const response = await fetch(`${API_URL}/api/tasks/${id}/restore/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Task restored.' });
        fetchTasks();
      } else {
        toast({ title: 'Error', description: 'Failed to restore task', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to connect to server', variant: 'destructive' });
    }
  };

  // Filtering and sorting logic
  const filteredTasks = tasks
    .filter(task =>
      (!search || task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus === 'all' || task.status === filterStatus) &&
      (filterProject === 'all' || String(projects.find(p => p.title === task.project_title)?.id) === filterProject)
    )
    .sort((a, b) => {
      let valA = a[sortBy as keyof Task];
      let valB = b[sortBy as keyof Task];
      if (sortBy === 'due_date' || sortBy === 'created_at') {
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
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        {(userRole === 'admin' || userRole === 'contributor') && (
          <div className="flex items-center gap-4">
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <Switch id="show-deleted-tasks" checked={showDeleted} onCheckedChange={setShowDeleted} />
                <label htmlFor="show-deleted-tasks" className="text-sm">Show Deleted</label>
              </div>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Task</DialogTitle>
                  <DialogDescription>Enter task details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Title</Label>
                    <Input id="task-title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-desc">Description</Label>
                    <Textarea id="task-desc" value={newDesc} onChange={e => setNewDesc(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <UiSelect value={newStatus} onValueChange={v => setNewStatus(v as any)}>
                      <UiSelectTrigger id="task-status">
                        <UiSelectValue />
                      </UiSelectTrigger>
                      <UiSelectContent>
                        <UiSelectItem value="TODO">To Do</UiSelectItem>
                        <UiSelectItem value="IN_PROGRESS">In Progress</UiSelectItem>
                        <UiSelectItem value="DONE">Done</UiSelectItem>
                      </UiSelectContent>
                    </UiSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input id="task-due-date" type="datetime-local" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} required />
                  </div>
                  {userRole === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="task-assigned-to">Assign To</Label>
                      <UiSelect value={newAssignedTo} onValueChange={v => setNewAssignedTo(v)}>
                        <UiSelectTrigger id="task-assigned-to">
                          <UiSelectValue placeholder="Select user" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                          {users.map(u => (
                            <UiSelectItem key={u.id} value={String(u.id)}>{u.username}</UiSelectItem>
                          ))}
                        </UiSelectContent>
                      </UiSelect>
                    </div>
                  )}
                  {userRole === 'contributor' && currentUser && (
                    <input type="hidden" value={currentUser.id} />
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="task-project">Project</Label>
                    <UiSelect value={newProject} onValueChange={v => setNewProject(v)}>
                      <UiSelectTrigger id="task-project">
                        <UiSelectValue placeholder="Select project" />
                      </UiSelectTrigger>
                      <UiSelectContent>
                        {projects.map(p => (
                          <UiSelectItem key={p.id} value={String(p.id)}>{p.title}</UiSelectItem>
                        ))}
                      </UiSelectContent>
                    </UiSelect>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Task'}</Button>
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
          <Label htmlFor="task-search">Search</Label>
          <Input id="task-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." />
        </div>
        <div>
          <Label htmlFor="task-filter-status">Status</Label>
          <UiSelect value={filterStatus} onValueChange={v => setFilterStatus(v)}>
            <UiSelectTrigger id="task-filter-status">
              <UiSelectValue placeholder="All" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="all">All</UiSelectItem>
              <UiSelectItem value="TODO">To Do</UiSelectItem>
              <UiSelectItem value="IN_PROGRESS">In Progress</UiSelectItem>
              <UiSelectItem value="DONE">Done</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
        <div>
          <Label htmlFor="task-filter-project">Project</Label>
          <UiSelect value={filterProject} onValueChange={v => setFilterProject(v)}>
            <UiSelectTrigger id="task-filter-project">
              <UiSelectValue placeholder="All" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="all">All</UiSelectItem>
              {projects.map(p => (
                <UiSelectItem key={p.id} value={String(p.id)}>{p.title}</UiSelectItem>
              ))}
            </UiSelectContent>
          </UiSelect>
        </div>
        <div>
          <Label htmlFor="task-sort-by">Sort By</Label>
          <UiSelect value={sortBy} onValueChange={v => setSortBy(v)}>
            <UiSelectTrigger id="task-sort-by">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="created_at">Created Date</UiSelectItem>
              <UiSelectItem value="due_date">Due Date</UiSelectItem>
              <UiSelectItem value="status">Status</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
        <div>
          <Label htmlFor="task-sort-order">Order</Label>
          <UiSelect value={sortOrder} onValueChange={v => setSortOrder(v as any)}>
            <UiSelectTrigger id="task-sort-order">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="asc">Ascending</UiSelectItem>
              <UiSelectItem value="desc">Descending</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className={`hover:shadow-md transition-shadow ${task.is_deleted ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[task.status]}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{task.project_title}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusUpdate(task.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {userRole === 'admin' && !task.is_deleted && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(task)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {userRole === 'admin' && task.is_deleted && (
                    <Button variant="outline" size="sm" onClick={() => handleRestore(task.id)}>
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {task.description}
              </CardDescription>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {task.assigned_to}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No tasks found</div>
          {(userRole === 'admin' || userRole === 'contributor') && (
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create your first task
            </Button>
          )}
        </div>
      )}

      {/* Edit Task Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input id="edit-task-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-desc">Description</Label>
              <Textarea id="edit-task-desc" value={editDesc} onChange={e => setEditDesc(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-status">Status</Label>
              <UiSelect value={editStatus} onValueChange={v => setEditStatus(v as any)}>
                <UiSelectTrigger id="edit-task-status">
                  <UiSelectValue />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem value="TODO">To Do</UiSelectItem>
                  <UiSelectItem value="IN_PROGRESS">In Progress</UiSelectItem>
                  <UiSelectItem value="DONE">Done</UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-due-date">Due Date</Label>
              <Input id="edit-task-due-date" type="datetime-local" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-assigned-to">Assign To</Label>
              <UiSelect value={editAssignedTo} onValueChange={v => setEditAssignedTo(v)}>
                <UiSelectTrigger id="edit-task-assigned-to">
                  <UiSelectValue placeholder="Select user" />
                </UiSelectTrigger>
                <UiSelectContent>
                  {users.map(u => (
                    <UiSelectItem key={u.id} value={String(u.id)}>{u.username}</UiSelectItem>
                  ))}
                </UiSelectContent>
              </UiSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-project">Project</Label>
              <UiSelect value={editProject} onValueChange={v => setEditProject(v)}>
                <UiSelectTrigger id="edit-task-project">
                  <UiSelectValue placeholder="Select project" />
                </UiSelectTrigger>
                <UiSelectContent>
                  {projects.map(p => (
                    <UiSelectItem key={p.id} value={String(p.id)}>{p.title}</UiSelectItem>
                  ))}
                </UiSelectContent>
              </UiSelect>
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
