'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, FileText, Image as ImageIcon, Mail, AlertTriangle, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession, generateImage, triggerEmail, type Session } from '@/lib/api';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.id);
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getSession(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching session ${sessionId}:`, err);
        setError('Failed to load session. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const handleGenerateImage = async () => {
    if (!session?.keyVerse || !session?.imageQuery) {
      alert('Key verse and image query are required to generate an image.');
      return;
    }

    try {
      setGeneratingImage(true);
      const imageUrl = await generateImage(session.keyVerse, session.imageQuery, sessionId);
      
      // Update the session with the new image URL
      setSession(prev => prev ? { ...prev, imageUrl } : null);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSendEmail = async () => {
    if (!session?.id) return;

    try {
      setSendingEmail(true);
      await triggerEmail(session.id);
      
      // Update the session status
      setSession(prev => prev ? { ...prev, emailStatus: 'Send Now' } : null);
      
      alert('Email sending triggered successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || 'Session not found'}</span>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/sessions')}>
              Back to Sessions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{session.scripture || 'Untitled Session'}</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {session.date || 'No date'}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/sessions')}>
            Back to Sessions
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Session details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Scripture</h3>
                  <p className="mt-1">{session.scripture || 'No scripture'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Transcription</h3>
                  <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                    {session.transcription || 'No transcription'}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">PLAUD AI Synopsis</h3>
                  <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {session.plaudSynopsis || 'No PLAUD AI synopsis'}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Prayer Requests</h3>
                  <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {session.prayerRequests || 'No prayer requests'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* AI Generated Content */}
            <Card>
              <CardHeader>
                <CardTitle>AI Generated Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">AI Summary</h3>
                  <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {session.aiSummary || 'No AI summary generated yet'}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Enhanced Commentary</h3>
                  <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                    {session.enhancedCommentary || 'No enhanced commentary generated yet'}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Next Session Preview</h3>
                  <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {session.nextSessionPreview || 'No next session preview generated yet'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Image and Email */}
          <div className="space-y-6">
            {/* Verse Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Verse Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Key Verse</h3>
                  <p className="mt-1">{session.keyVerse || 'No key verse'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Image Search Query</h3>
                  <p className="mt-1">{session.imageQuery || 'No image search query'}</p>
                </div>
                
                {session.imageUrl ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Generated Image</h3>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img 
                        src={session.imageUrl} 
                        alt={session.keyVerse || 'Verse image'} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg flex items-center justify-center h-40 bg-gray-50">
                    <p className="text-gray-400 text-center px-4">
                      No image generated yet
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={!session.keyVerse || !session.imageQuery || generatingImage}
                  className="w-full"
                >
                  {generatingImage ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Generating...
                    </>
                  ) : session.imageUrl ? 'Regenerate Image' : 'Generate Image'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Email Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Digest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                  <div className="mt-2">
                    {session.emailStatus === 'Email Sent' ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-5 w-5 mr-1" />
                        <span>Email sent on {session.emailSentTimestamp || 'unknown date'}</span>
                      </div>
                    ) : session.emailStatus === 'Email Draft Ready' ? (
                      <div className="flex items-center text-blue-600">
                        <Mail className="h-5 w-5 mr-1" />
                        <span>Email draft ready to send</span>
                      </div>
                    ) : session.emailStatus === 'Send Now' ? (
                      <div className="flex items-center text-yellow-600">
                        <span className="animate-spin mr-1">⟳</span>
                        <span>Sending in progress...</span>
                      </div>
                    ) : session.emailStatus === 'AI Error' ? (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-1" />
                        <span>Error during AI processing</span>
                      </div>
                    ) : session.emailStatus === 'Email Error' ? (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-1" />
                        <span>Error sending email</span>
                      </div>
                    ) : session.emailStatus === 'AI Processing' ? (
                      <div className="flex items-center text-yellow-600">
                        <span className="animate-spin mr-1">⟳</span>
                        <span>AI processing in progress...</span>
                      </div>
                    ) : session.emailStatus === 'AI Complete' ? (
                      <div className="flex items-center text-blue-600">
                        <FileText className="h-5 w-5 mr-1" />
                        <span>AI processing complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <span>Not started</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {session.errorLog && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{session.errorLog}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleSendEmail} 
                  disabled={session.emailStatus !== 'Email Draft Ready' || sendingEmail}
                  className="w-full"
                >
                  {sendingEmail ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Sending...
                    </>
                  ) : 'Send Email Digest'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
