'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateImage } from '@/lib/api';

export default function ImageGeneratorPage() {
  const [verseText, setVerseText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verseText || !searchQuery) {
      setError('Please enter both verse text and a search query.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const imageUrl = await generateImage(verseText, searchQuery);
      setImageUrl(imageUrl);
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Verse Image Generator</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="verse-text" className="block text-sm font-medium text-gray-700 mb-1">
                        Verse Text
                      </label>
                      <textarea
                        id="verse-text"
                        value={verseText}
                        onChange={(e) => setVerseText(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                        placeholder="Enter the Bible verse text..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
                        Image Search Query
                      </label>
                      <input
                        id="search-query"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., mountain sunset, ocean waves, forest path..."
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This query will be used to find a relevant background image from Pexels.
                      </p>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Generating...
                        </>
                      ) : 'Generate Image'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Tips for Great Images</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Use clear, concise verse text</li>
                  <li>Choose search terms that match the verse's theme</li>
                  <li>Try nature scenes for peaceful verses</li>
                  <li>Use abstract terms for complex theological concepts</li>
                  <li>Experiment with different search terms if you're not happy with the result</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              
              {imageUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Generated verse image" 
                    className="w-full h-auto"
                  />
                  <div className="p-4 bg-white border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Create a temporary anchor element to download the image
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = 'verse-image.jpg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg flex items-center justify-center h-80 bg-gray-50">
                  <p className="text-gray-400">
                    {loading ? 'Generating image...' : 'Your generated image will appear here'}
                  </p>
                </div>
              )}
            </div>
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
