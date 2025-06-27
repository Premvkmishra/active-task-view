
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Users, Activity, BarChart3 } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Create, assign, and track tasks with due dates and status updates.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Admin and contributor roles with appropriate permissions.'
    },
    {
      icon: Activity,
      title: 'Activity Tracking',
      description: 'Monitor all task changes and updates in real-time.'
    },
    {
      icon: BarChart3,
      title: 'Export Reports',
      description: 'Generate reports for overdue, due soon, and completed tasks.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Smart Task Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your project management with role-based task tracking, 
          real-time activity monitoring, and comprehensive reporting.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <a href="/login">Get Started</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/dashboard">View Demo</a>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Get Organized?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Start managing your projects more effectively today.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <a href="/login">Start Free Trial</a>
        </Button>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t bg-gray-50">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 Smart Task Tracker. Built with React and Django.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
