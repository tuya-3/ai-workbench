/**
 * GitHub Content Extractor
 * Extracts content from GitHub Issues and Pull Requests
 */

export interface IssueContent {
  type: 'issue' | 'pr';
  number: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  labels: string[];
  comments: Comment[];
  metadata: {
    repository: string;
    url: string;
  };
}

export interface Comment {
  author: string;
  body: string;
  createdAt: string;
}

export interface PRContent extends IssueContent {
  type: 'pr';
  additions: number;
  deletions: number;
  changedFiles: number;
  diff?: string;
  commits: {
    sha: string;
    message: string;
    author: string;
  }[];
}

/**
 * Extract Issue content from GitHub
 */
export async function extractIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  token: string
): Promise<IssueContent> {
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  // Fetch issue data
  const issueResponse = await fetch(`${baseUrl}/issues/${issueNumber}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!issueResponse.ok) {
    throw new Error(`Failed to fetch issue: ${issueResponse.statusText}`);
  }

  const issue = await issueResponse.json();

  // Fetch comments
  const commentsResponse = await fetch(`${baseUrl}/issues/${issueNumber}/comments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const comments = commentsResponse.ok ? await commentsResponse.json() : [];

  return {
    type: 'issue',
    number: issueNumber,
    title: issue.title,
    body: issue.body || '',
    author: issue.user.login,
    createdAt: issue.created_at,
    labels: issue.labels.map((label: any) => label.name),
    comments: comments.map((comment: any) => ({
      author: comment.user.login,
      body: comment.body,
      createdAt: comment.created_at,
    })),
    metadata: {
      repository: `${owner}/${repo}`,
      url: issue.html_url,
    },
  };
}

/**
 * Extract Pull Request content from GitHub
 */
export async function extractPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
  includeDiff: boolean = false
): Promise<PRContent> {
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  // Fetch PR data
  const prResponse = await fetch(`${baseUrl}/pulls/${prNumber}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!prResponse.ok) {
    throw new Error(`Failed to fetch pull request: ${prResponse.statusText}`);
  }

  const pr = await prResponse.json();

  // Fetch comments
  const commentsResponse = await fetch(`${baseUrl}/issues/${prNumber}/comments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const comments = commentsResponse.ok ? await commentsResponse.json() : [];

  // Fetch commits
  const commitsResponse = await fetch(`${baseUrl}/pulls/${prNumber}/commits`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const commits = commitsResponse.ok ? await commitsResponse.json() : [];

  let diff: string | undefined;
  if (includeDiff) {
    const diffResponse = await fetch(`${baseUrl}/pulls/${prNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.diff',
      },
    });
    diff = diffResponse.ok ? await diffResponse.text() : undefined;
  }

  return {
    type: 'pr',
    number: prNumber,
    title: pr.title,
    body: pr.body || '',
    author: pr.user.login,
    createdAt: pr.created_at,
    labels: pr.labels.map((label: any) => label.name),
    comments: comments.map((comment: any) => ({
      author: comment.user.login,
      body: comment.body,
      createdAt: comment.created_at,
    })),
    metadata: {
      repository: `${owner}/${repo}`,
      url: pr.html_url,
    },
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    diff,
    commits: commits.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
    })),
  };
}

/**
 * Main extraction function - auto-detects type
 */
export async function extractContent(
  owner: string,
  repo: string,
  number: number,
  token: string,
  type?: 'issue' | 'pr'
): Promise<IssueContent | PRContent> {
  if (type === 'pr' || type === undefined) {
    try {
      return await extractPullRequest(owner, repo, number, token);
    } catch (error) {
      if (type === 'pr') throw error;
      // If type not specified and PR fetch fails, try issue
    }
  }
  
  return await extractIssue(owner, repo, number, token);
}
