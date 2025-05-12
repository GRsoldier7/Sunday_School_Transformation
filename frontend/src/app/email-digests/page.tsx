'use client';

import { useState, useEffect } from 'react';
import { Calendar, Mail, Check, AlertTriangle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessions, triggerEmail, type Session } from '@/lib/api';

export default function EmailDigestsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getSessions();
        // Filter sessions that have email drafts ready or emails sent
        const emailSessions = data.filter(session => 
          session.emailStatus === 'Email Draft Ready' || 
          session.emailStatus === 'Send Now' || 
          session.emailStatus === 'Email Sent'
        );
        setSessions(emailSessions);
        setError(null);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load email digests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSendEmail = async (sessionId: number) => {
    try {
      setSendingEmail(sessionId);
      await triggerEmail(sessionId);
      
      // Update the session status in the local state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, emailStatus: 'Send Now' } 
            : session
        )
      );
      
      // Show success message
      alert('Email sending triggered successfully!');
    } catch (err) {
      console.error(`Error sending email for session ${sessionId}:`, err);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'Email Sent':
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Sent
          </span>
        );
      case 'Email Draft Ready':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            Ready to Send
          </span>
        );
      case 'Send Now':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Sending...
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Email Digests</h1>
        
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
            <h3 className="text-lg font-medium text-gray-900">No email digests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete session data entry and AI processing to generate email digests.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{session.scripture || 'Untitled Session'}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {session.date || 'No date'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(session.emailStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Key Verse</h4>
                      <p className="text-sm text-gray-500">{session.keyVerse || 'No key verse'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">AI Summary</h4>
                      <p className="text-sm text-gray-500 line-clamp-3">{session.aiSummary || 'No AI summary'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {session.emailStatus === 'Email Draft Ready' ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSendEmail(session.id)}
                      disabled={sendingEmail === session.id}
                    >
                      {sendingEmail === session.id ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  ) : session.emailStatus === 'Send Now' ? (
                    <Button className="w-full" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Sending in Progress...
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Email Sent
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <footer className="border-t bg-gray-50 mt-12">
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
