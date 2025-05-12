'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, FileText, Image as ImageIcon, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessions, type Session } from '@/lib/api';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getSessions();
        setSessions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bible Study Sessions</h1>
          <Link href="/sessions/new">
            <Button>New Session</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new session.</p>
            <div className="mt-6">
              <Link href="/sessions/new">
                <Button>Create New Session</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{session.scripture || 'Untitled Session'}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {session.date || 'No date'}
                      </CardDescription>
                    </div>
                    {session.emailStatus === 'Email Sent' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Email Sent
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {session.aiSummary && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        AI Summary
                      </span>
                    )}
                    {session.imageUrl && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Verse Image
                      </span>
                    )}
                    {session.emailStatus === 'Email Draft Ready' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        Email Ready
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {session.plaudSynopsis || 'No synopsis available'}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/sessions/${session.id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-between">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-gray-500 md:text-left">
              &copy; {new Date().getFullYear()} Bible Study Sermon Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
