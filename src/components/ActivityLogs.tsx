import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: number;
  task_title: string;
  previous_assignee: string;
  previous_status: string;
  previous_due_date: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/activity-logs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.results || data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch activity logs",
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

  // Filtering and sorting logic
  const assignees = Array.from(new Set(logs.map(l => l.previous_assignee).filter(Boolean)));
  const statuses = Array.from(new Set(logs.map(l => l.previous_status).filter(Boolean)));
  const filteredLogs = logs
    .filter(log =>
      (!search || log.task_title.toLowerCase().includes(search.toLowerCase())) &&
      (!filterAssignee || log.previous_assignee === filterAssignee) &&
      (!filterStatus || log.previous_status === filterStatus)
    )
    .sort((a, b) => {
      const valA = new Date(a.updated_at).getTime();
      const valB = new Date(b.updated_at).getTime();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>

      {/* Filter/Search/Sort Controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label htmlFor="log-search" className="block text-sm font-medium">Search Task</label>
          <input id="log-search" className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by task title..." />
        </div>
        <div>
          <label htmlFor="log-filter-assignee" className="block text-sm font-medium">Previous Assignee</label>
          <select id="log-filter-assignee" className="input" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
            <option value="">All</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="log-filter-status" className="block text-sm font-medium">Previous Status</label>
          <select id="log-filter-status" className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="log-sort-order" className="block text-sm font-medium">Sort</label>
          <select id="log-sort-order" className="input" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{log.task_title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(log.updated_at).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Assignee:</span>
                  <Badge variant="outline">{log.previous_assignee}</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge variant="secondary">Current Assignee</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className="bg-gray-100 text-gray-800">
                    {log.previous_status.replace('_', ' ')}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge className="bg-blue-100 text-blue-800">Updated Status</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <Badge variant="outline">
                    {new Date(log.previous_due_date).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No activity logs found</div>
        </div>
      )}
    </div>
  );
};
