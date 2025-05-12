'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewSessionPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    date: '',
    scripture: '',
    transcription: '',
    plaudSynopsis: '',
    prayerRequests: '',
    keyVerse: '',
    imageQuery: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.date || !formData.scripture) {
      setError('Date and Scripture are required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, we would send this data to the backend
      // For now, we'll just simulate success and redirect
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to sessions page
      router.push('/sessions');
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">New Bible Study Session</h1>
          <Button variant="outline" onClick={() => router.push('/sessions')}>
            Cancel
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="scripture" className="block text-sm font-medium text-gray-700 mb-1">
                    Scripture *
                  </label>
                  <input
                    type="text"
                    id="scripture"
                    name="scripture"
                    value={formData.scripture}
                    onChange={handleChange}
                    placeholder="e.g., John 3:16-21"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="transcription" className="block text-sm font-medium text-gray-700 mb-1">
                  Transcription
                </label>
                <textarea
                  id="transcription"
                  name="transcription"
                  value={formData.transcription}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter the sermon or Bible study transcription..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  AI processing will be triggered when both Transcription and PLAUD AI Synopsis are provided.
                </p>
              </div>
              
              <div>
                <label htmlFor="plaudSynopsis" className="block text-sm font-medium text-gray-700 mb-1">
                  PLAUD AI Synopsis
                </label>
                <textarea
                  id="plaudSynopsis"
                  name="plaudSynopsis"
                  value={formData.plaudSynopsis}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter the PLAUD AI synopsis..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="prayerRequests" className="block text-sm font-medium text-gray-700 mb-1">
                  Prayer Requests
                </label>
                <textarea
                  id="prayerRequests"
                  name="prayerRequests"
                  value={formData.prayerRequests}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter prayer requests..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="keyVerse" className="block text-sm font-medium text-gray-700 mb-1">
                    Key Verse for Image
                  </label>
                  <input
                    type="text"
                    id="keyVerse"
                    name="keyVerse"
                    value={formData.keyVerse}
                    onChange={handleChange}
                    placeholder="e.g., John 3:16"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageQuery" className="block text-sm font-medium text-gray-700 mb-1">
                    Image Search Query
                  </label>
                  <input
                    type="text"
                    id="imageQuery"
                    name="imageQuery"
                    value={formData.imageQuery}
                    onChange={handleChange}
                    placeholder="e.g., sunset mountains"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/sessions')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Saving...
                    </>
                  ) : 'Save Session'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
