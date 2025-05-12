import Image from "next/image";
import dynamic from "next/dynamic";

// Import the MCP server status component with dynamic loading to avoid SSR issues
const MCPServerStatus = dynamic(
  () => import('@/components/mcp-server-status'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Sunday School Transformation</h1>
        <p className="text-lg text-gray-600">A modern platform for transforming Sunday School experiences</p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* MCP Server Status */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">MCP Server Status</h2>
          <MCPServerStatus />
        </section>

        {/* Project Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="mb-4">
              This project aims to transform Sunday School experiences by leveraging modern technology
              and MCP servers to create an engaging, interactive, and educational platform.
            </p>

            <h3 className="text-xl font-medium mb-2">MCP Servers</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Heroku-MCP</strong>: Cloud platform for hosting applications</li>
              <li><strong>Context7</strong>: Context management system</li>
              <li><strong>Taskmaster (Claude)</strong>: AI-powered task management system</li>
              <li><strong>MagicUI</strong>: UI component library and design system</li>
              <li><strong>Memory</strong>: Data storage and retrieval system</li>
              <li><strong>Knowledge</strong>: Knowledge base and information management system</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">Development Process</h3>
            <p>
              This project follows the development process outlined in the Vibe Coding Rulebook,
              ensuring high-quality code, efficient development, and a robust final product.
            </p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="mb-4">
              To get started with development, follow these steps:
            </p>

            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>
                Clone the repository and install dependencies:
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  <code>npm install</code>
                </pre>
              </li>
              <li>
                Create a <code>.env.local</code> file:
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  <code>cp .env.local.example .env.local</code>
                </pre>
              </li>
              <li>
                Start the development server:
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  <code>npm run dev</code>
                </pre>
              </li>
            </ol>

            <p>
              For more information, refer to the <code>README.md</code> file.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
        <p>Sunday School Transformation &copy; {new Date().getFullYear()}</p>
        <div className="flex gap-4 justify-center mt-4">
          <a
            className="hover:text-blue-600 transition-colors"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>
          <a
            className="hover:text-blue-600 transition-colors"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
