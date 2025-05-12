import Image from "next/image";
import Link from "next/link";
import { BookOpen, Mail, FileText, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Bible Study Sermon Tracker
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Track your Bible study sessions, generate AI-enhanced summaries, create verse images, and send email digests.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/sessions">
                  <Button>View Sessions</Button>
                </Link>
                <Link href="/sessions/new">
                  <Button variant="outline">Create New Session</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle>Session Tracking</CardTitle>
                  <CardDescription>
                    Record and organize your Bible study sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Store session details including date, scripture, transcription, and PLAUD AI synopsis.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/sessions">
                    <Button variant="outline" size="sm">Learn More</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle>AI Summaries</CardTitle>
                  <CardDescription>
                    Generate enhanced sermon commentaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Automatically create summaries, cross-references, and next session previews using AI.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/sessions">
                    <Button variant="outline" size="sm">Learn More</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <ImageIcon className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle>Verse Images</CardTitle>
                  <CardDescription>
                    Create shareable verse images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Generate beautiful images with Bible verses overlaid on relevant backgrounds.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/image-generator">
                    <Button variant="outline" size="sm">Try It</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <Mail className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle>Email Digests</CardTitle>
                  <CardDescription>
                    Send comprehensive email summaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Compile and send email digests with sermon content, prayer requests, and next session info.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/email-digests">
                    <Button variant="outline" size="sm">View Digests</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
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
