/**
 * YouTube Uploader
 * Uploads videos to YouTube using YouTube Data API v3
 */

import * as fs from 'fs';
import * as path from 'path';
import { VideoScript } from './generate-script';

export interface YouTubeCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  privacy: 'public' | 'private' | 'unlisted';
  playlistId?: string;
}

export interface UploadResult {
  videoId: string;
  url: string;
  title: string;
  uploadedAt: string;
}

/**
 * Upload video to YouTube
 */
export async function uploadToYouTube(
  videoPath: string,
  metadata: VideoMetadata,
  credentials: YouTubeCredentials
): Promise<UploadResult> {
  console.log('Starting YouTube upload...');

  // Get access token from refresh token
  const accessToken = await getAccessToken(credentials);

  // Upload video
  const videoId = await uploadVideo(videoPath, metadata, accessToken);

  // Add to playlist if specified
  if (metadata.playlistId) {
    await addToPlaylist(videoId, metadata.playlistId, accessToken);
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  console.log(`Video uploaded successfully: ${url}`);

  return {
    videoId,
    url,
    title: metadata.title,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Get access token from refresh token
 */
async function getAccessToken(credentials: YouTubeCredentials): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Upload video file to YouTube
 */
async function uploadVideo(
  videoPath: string,
  metadata: VideoMetadata,
  accessToken: string
): Promise<string> {
  // Read video file
  const videoBuffer = fs.readFileSync(videoPath);
  const fileSize = videoBuffer.length;

  // Step 1: Initialize resumable upload
  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': fileSize.toString(),
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify({
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.category,
        },
        status: {
          privacyStatus: metadata.privacy,
        },
      }),
    }
  );

  if (!initResponse.ok) {
    const error = await initResponse.text();
    throw new Error(`Failed to initialize upload: ${error}`);
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('No upload URL received from YouTube');
  }

  // Step 2: Upload video file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/*',
      'Content-Length': fileSize.toString(),
    },
    body: videoBuffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Failed to upload video: ${error}`);
  }

  const result = await uploadResponse.json();
  return result.id;
}

/**
 * Add video to playlist
 */
async function addToPlaylist(
  videoId: string,
  playlistId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to add to playlist: ${error}`);
  }
}

/**
 * Generate YouTube metadata from video script
 */
export function generateYouTubeMetadata(
  script: VideoScript,
  defaultTags: string[] = [],
  defaultCategory: string = '28', // Science & Technology
  defaultPrivacy: 'public' | 'private' | 'unlisted' = 'unlisted'
): VideoMetadata {
  // Generate description with links and timestamps
  const description = generateDescription(script);

  // Extract tags from content
  const contentTags = extractTags(script);
  const allTags = Array.from(new Set([...defaultTags, ...contentTags])).slice(0, 500); // YouTube limit

  return {
    title: script.title.substring(0, 100), // YouTube title limit
    description: description.substring(0, 5000), // YouTube description limit
    tags: allTags,
    category: defaultCategory,
    privacy: defaultPrivacy,
  };
}

/**
 * Generate video description with timestamps
 */
function generateDescription(script: VideoScript): string {
  let description = `${script.description}\n\n`;
  
  description += '📝 Content Overview:\n\n';
  
  // Add timestamps
  let currentTime = 0;
  script.sections.forEach(section => {
    const timestamp = formatTimestamp(currentTime);
    description += `${timestamp} - ${section.heading}\n`;
    currentTime += section.duration;
  });

  description += '\n---\n\n';
  description += `🔗 Source: ${script.metadata.sourceType === 'pr' ? 'Pull Request' : 'Issue'} #${script.metadata.sourceNumber}\n`;
  description += `📅 Generated: ${new Date(script.metadata.generatedAt).toLocaleDateString()}\n`;
  description += `🤖 Created with AI using OpenAI GPT-4 and TTS\n\n`;
  description += `#AI #DevOps #Automation #Tutorial`;

  return description;
}

/**
 * Extract relevant tags from script content
 */
function extractTags(script: VideoScript): string[] {
  const tags: string[] = [];
  const content = `${script.title} ${script.description} ${script.sections.map(s => s.narration).join(' ')}`;
  
  // Common technical keywords to look for
  const keywords = [
    'github', 'vercel', 'nextjs', 'react', 'typescript', 'javascript',
    'ai', 'openai', 'gpt', 'tts', 'automation', 'workflow',
    'deployment', 'devops', 'ci/cd', 'docker', 'kubernetes',
    'api', 'rest', 'graphql', 'database', 'supabase', 'dify'
  ];

  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  });

  return tags.slice(0, 30); // Reasonable limit
}

/**
 * Format seconds to YouTube timestamp (MM:SS)
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Post video link as comment on GitHub Issue/PR
 */
export async function postVideoLinkToGitHub(
  owner: string,
  repo: string,
  issueNumber: number,
  videoUrl: string,
  token: string
): Promise<void> {
  const comment = `🎥 **AI-Generated Video Available!**

A video has been automatically generated from this ${issueNumber >= 1000 ? 'pull request' : 'issue'}:

**Watch here:** ${videoUrl}

*This video was created using AI (GPT-4 for script generation and OpenAI TTS for narration).*`;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ body: comment }),
    }
  );

  if (!response.ok) {
    console.error('Failed to post comment to GitHub:', await response.text());
  } else {
    console.log('Posted video link to GitHub issue/PR');
  }
}
