#!/usr/bin/env node
/**
 * CLI for AI Video Generator
 * Command-line interface for generating videos from GitHub Issues/PRs
 */

import { generateVideoFromIssueOrPR, checkDependencies, GenerationConfig } from './main';

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Check dependencies
  if (args.includes('--check-deps')) {
    console.log('🔍 Checking dependencies...\n');
    const deps = await checkDependencies();
    console.log(`FFmpeg: ${deps.ffmpeg ? '✅' : '❌'}`);
    console.log(`FFprobe: ${deps.ffprobe ? '✅' : '❌'}`);
    console.log(`\nAll dependencies: ${deps.allOk ? '✅ OK' : '❌ Missing'}`);
    process.exit(deps.allOk ? 0 : 1);
  }

  // Parse arguments
  const config: Partial<GenerationConfig> = {
    githubToken: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_REPO_OWNER || 'tuya-3',
    repo: process.env.GITHUB_REPO_NAME || 'ai-workbench',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    youtubeClientId: process.env.YOUTUBE_CLIENT_ID,
    youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    youtubeRefreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    uploadToYouTube: process.env.UPLOAD_TO_YOUTUBE === 'true',
    postToGitHub: process.env.POST_TO_GITHUB !== 'false', // Default true
    keepIntermediateFiles: args.includes('--keep-files'),
  };

  let type: 'issue' | 'pr' | undefined;
  let number: number | undefined;

  // Parse issue/pr number
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--issue') {
      type = 'issue';
      number = parseInt(args[i + 1]);
    } else if (args[i] === '--pr') {
      type = 'pr';
      number = parseInt(args[i + 1]);
    } else if (args[i] === '--owner') {
      config.owner = args[i + 1];
    } else if (args[i] === '--repo') {
      config.repo = args[i + 1];
    } else if (args[i] === '--working-dir') {
      config.workingDir = args[i + 1];
    }
  }

  // Validate inputs
  if (!type || !number) {
    console.error('❌ Error: Must specify either --issue <number> or --pr <number>');
    showHelp();
    process.exit(1);
  }

  if (!config.githubToken) {
    console.error('❌ Error: GITHUB_TOKEN environment variable not set');
    process.exit(1);
  }

  if (!config.openaiApiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  // Check dependencies first
  console.log('🔍 Checking dependencies...');
  const deps = await checkDependencies();
  if (!deps.allOk) {
    console.error('\n❌ Missing required dependencies. Run with --check-deps for details.');
    process.exit(1);
  }
  console.log('✅ All dependencies OK\n');

  // Generate video
  const result = await generateVideoFromIssueOrPR(
    type,
    number,
    config as GenerationConfig
  );

  if (result.success) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
    if (result.videoResult) {
      console.log(`📹 Video: ${result.videoResult.videoPath}`);
    }
    if (result.uploadResult) {
      console.log(`🔗 YouTube: ${result.uploadResult.url}`);
    }
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } else {
    console.error('\n' + '='.repeat(60));
    console.error('❌ FAILED!');
    console.error('='.repeat(60));
    console.error(`Error: ${result.error}`);
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🎬 AI Video Generator - Generate videos from GitHub Issues/PRs

USAGE:
  npm run generate-video -- [OPTIONS]

OPTIONS:
  --issue <number>       Generate video from Issue number
  --pr <number>          Generate video from Pull Request number
  --owner <owner>        GitHub repository owner (default: GITHUB_REPO_OWNER env or tuya-3)
  --repo <repo>          GitHub repository name (default: GITHUB_REPO_NAME env or ai-workbench)
  --working-dir <path>   Custom working directory for intermediate files
  --keep-files           Keep intermediate audio/slide files after generation
  --check-deps           Check if all required dependencies are installed
  --help, -h             Show this help message

ENVIRONMENT VARIABLES:
  Required:
    GITHUB_TOKEN              GitHub personal access token
    OPENAI_API_KEY            OpenAI API key

  Optional (for YouTube upload):
    YOUTUBE_CLIENT_ID         YouTube OAuth client ID
    YOUTUBE_CLIENT_SECRET     YouTube OAuth client secret
    YOUTUBE_REFRESH_TOKEN     YouTube OAuth refresh token
    UPLOAD_TO_YOUTUBE         Set to 'true' to upload (default: false)
    POST_TO_GITHUB            Set to 'false' to skip posting link (default: true)

  Optional (repository):
    GITHUB_REPO_OWNER         Repository owner (default: tuya-3)
    GITHUB_REPO_NAME          Repository name (default: ai-workbench)

EXAMPLES:
  # Generate video from Issue #6
  npm run generate-video -- --issue 6

  # Generate video from PR #2
  npm run generate-video -- --pr 2

  # Generate and upload to YouTube
  UPLOAD_TO_YOUTUBE=true npm run generate-video -- --issue 6

  # Check dependencies
  npm run generate-video -- --check-deps

  # Keep intermediate files for debugging
  npm run generate-video -- --issue 6 --keep-files

PREREQUISITES:
  - Node.js 20+
  - FFmpeg installed (for video composition)
  - OpenAI API key (for script generation and TTS)
  - GitHub token (for accessing Issues/PRs)
  - YouTube credentials (optional, for uploading)

For more information, see: workflows/video-generator/README.md
`);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
