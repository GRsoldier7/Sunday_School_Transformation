'use client';

import { useState, useEffect } from 'react';
import { mcpServers } from '@/config/mcp-servers';

interface ServerStatus {
  name: string;
  status: 'online' | 'offline' | 'unknown';
  latency?: number;
  error?: string;
}

export default function MCPServerStatus() {
  const [serverStatuses, setServerStatuses] = useState<ServerStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      setLoading(true);

      const statuses: ServerStatus[] = [];

      // Check each MCP server
      for (const [, config] of Object.entries(mcpServers)) {
        if (!config.isEnabled) {
          statuses.push({
            name: config.name,
            status: 'unknown',
            error: 'Server is disabled in configuration',
          });
          continue;
        }

        try {
          const startTime = Date.now();
          // Create an abort controller with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(`${config.baseUrl}/health`, {
            method: 'GET',
            headers: config.apiKey ? {
              'Authorization': `Bearer ${config.apiKey}`,
            } : {},
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const latency = Date.now() - startTime;

          if (response.ok) {
            statuses.push({
              name: config.name,
              status: 'online',
              latency,
            });
          } else {
            statuses.push({
              name: config.name,
              status: 'offline',
              latency,
              error: `Server returned status ${response.status}`,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const isTimeout = error instanceof Error && error.name === 'AbortError';

          statuses.push({
            name: config.name,
            status: 'offline',
            error: isTimeout ? 'Connection timed out' : errorMessage,
          });
        }
      }

      setServerStatuses(statuses);
      setLoading(false);
    };

    checkServerStatus();

    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">MCP Server Status</h2>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {serverStatuses.map((server) => (
            <div key={server.name} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(server.status)}`}></div>
                <span className="font-medium">{server.name}</span>
              </div>
              <div className="flex items-center">
                {server.latency && (
                  <span className="text-sm text-gray-500 mr-2">{server.latency}ms</span>
                )}
                <span className="text-sm px-2 py-1 rounded-full capitalize font-medium"
                  style={{
                    backgroundColor: server.status === 'online' ? '#e6f7e6' : server.status === 'offline' ? '#fde8e8' : '#f3f4f6',
                    color: server.status === 'online' ? '#166534' : server.status === 'offline' ? '#b91c1c' : '#4b5563',
                  }}
                >
                  {server.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-right">
        <button
          onClick={() => setLoading(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
