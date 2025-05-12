/**
 * GitHub MCP Service
 *
 * Service for interacting with the GitHub MCP server for repository management and CI/CD.
 */

import { BaseMCPService } from './base-mcp-service';
import { githubMCPConfig } from '@/config/mcp-servers';

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  owner: {
    id: string;
    login: string;
    avatarUrl: string;
  };
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  cloneUrl: string;
  sshUrl: string;
  size: number;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  language: string;
  topics: string[];
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection: {
    enabled: boolean;
    requiredStatusChecks: {
      enforcement_level: string;
      contexts: string[];
    };
  };
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  tree: {
    sha: string;
    url: string;
  };
  parents: {
    sha: string;
    url: string;
  }[];
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }[];
}

export interface PullRequest {
  id: number;
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string;
  user: {
    id: string;
    login: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  head: {
    ref: string;
    sha: string;
    repo: {
      id: string;
      name: string;
      fullName: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      id: string;
      name: string;
      fullName: string;
    };
  };
  mergeable: boolean;
  merged: boolean;
  comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
  url: string;
  badgeUrl: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  workflowId: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | null;
  headBranch: string;
  headSha: string;
  event: string;
  runNumber: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  jobs: {
    id: number;
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | null;
    startedAt: string;
    completedAt: string;
    steps: {
      name: string;
      status: 'queued' | 'in_progress' | 'completed';
      conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | null;
      number: number;
    }[];
  }[];
}

export class GitHubMCPService extends BaseMCPService {
  constructor() {
    super(githubMCPConfig);
  }

  /**
   * Get all repositories
   */
  async getRepositories(): Promise<Repository[]> {
    return this.get<Repository[]>('repositories');
  }

  /**
   * Get a repository by ID
   * @param id - Repository ID
   */
  async getRepository(id: string): Promise<Repository> {
    return this.get<Repository>('repository', { id });
  }

  /**
   * Get all branches for a repository
   * @param id - Repository ID
   */
  async getBranches(id: string): Promise<Branch[]> {
    return this.get<Branch[]>('branches', { id });
  }

  /**
   * Get a specific branch for a repository
   * @param id - Repository ID
   * @param branch - Branch name
   */
  async getBranch(id: string, branch: string): Promise<Branch> {
    return this.get<Branch>('branch', { id, branch });
  }

  /**
   * Get commits for a repository
   * @param id - Repository ID
   * @param branch - Optional branch name
   * @param limit - Optional limit of commits to return
   */
  async getCommits(id: string, branch?: string, limit?: number): Promise<Commit[]> {
    const queryParams = new URLSearchParams();

    if (branch) {
      queryParams.append('branch', branch);
    }

    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    const url = `${this.getEndpointUrl('commits', { id })}?${queryParams.toString()}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub MCP API error (${response.status}): ${errorText}`);
    }

    return await response.json() as Commit[];
  }

  /**
   * Get a specific commit
   * @param id - Repository ID
   * @param sha - Commit SHA
   */
  async getCommit(id: string, sha: string): Promise<Commit> {
    return this.get<Commit>('commit', { id, sha });
  }

  /**
   * Get pull requests for a repository
   * @param id - Repository ID
   * @param state - Optional state filter ('open', 'closed', or 'all')
   */
  async getPullRequests(id: string, state?: 'open' | 'closed' | 'all'): Promise<PullRequest[]> {
    const queryParams = new URLSearchParams();

    if (state) {
      queryParams.append('state', state);
    }

    const url = `${this.getEndpointUrl('pullRequests', { id })}?${queryParams.toString()}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub MCP API error (${response.status}): ${errorText}`);
    }

    return await response.json() as PullRequest[];
  }

  /**
   * Get a specific pull request
   * @param id - Repository ID
   * @param number - Pull request number
   */
  async getPullRequest(id: string, number: number): Promise<PullRequest> {
    return this.get<PullRequest>('pullRequest', { id, number: number.toString() });
  }

  /**
   * Get workflows for a repository
   * @param id - Repository ID
   */
  async getWorkflows(id: string): Promise<Workflow[]> {
    return this.get<Workflow[]>('workflows', { id });
  }

  /**
   * Get a specific workflow
   * @param id - Repository ID
   * @param workflowId - Workflow ID
   */
  async getWorkflow(id: string, workflowId: number): Promise<Workflow> {
    return this.get<Workflow>('workflow', { id, workflow_id: workflowId.toString() });
  }

  /**
   * Get workflow runs for a repository
   * @param id - Repository ID
   * @param workflowId - Optional workflow ID
   * @param branch - Optional branch name
   */
  async getWorkflowRuns(id: string, workflowId?: number, branch?: string): Promise<WorkflowRun[]> {
    const queryParams = new URLSearchParams();

    if (workflowId) {
      queryParams.append('workflow_id', workflowId.toString());
    }

    if (branch) {
      queryParams.append('branch', branch);
    }

    const url = `${this.getEndpointUrl('workflowRuns', { id })}?${queryParams.toString()}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub MCP API error (${response.status}): ${errorText}`);
    }

    return await response.json() as WorkflowRun[];
  }

  /**
   * Get a specific workflow run
   * @param id - Repository ID
   * @param runId - Workflow run ID
   */
  async getWorkflowRun(id: string, runId: number): Promise<WorkflowRun> {
    return this.get<WorkflowRun>('workflowRun', { id, run_id: runId.toString() });
  }
}
