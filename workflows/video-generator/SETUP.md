# Setup Guide - AI Video Generation Workflow

This guide walks you through setting up the AI video generation workflow for your repository.

## Prerequisites

### 1. System Requirements

- **Node.js**: Version 20 or higher
- **FFmpeg**: For video composition
- **Git**: For repository access

Install FFmpeg:
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### 2. API Keys and Credentials

You'll need the following credentials:

#### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new secret key
5. Copy and save it securely

**Cost estimate**: ~$0.10 per 10-minute video (GPT-4 + TTS)

#### GitHub Personal Access Token (Required)
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name: "AI Video Generator"
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Actions workflows)
5. Click "Generate token"
6. Copy and save the token

#### YouTube API Credentials (Optional - for auto-upload)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Desktop app" or "Web application"
   - Copy Client ID and Client Secret
5. Get Refresh Token:
   ```bash
   # Use OAuth 2.0 Playground or follow YouTube API documentation
   # https://developers.google.com/youtube/v3/guides/authentication
   ```

**Note**: YouTube API has a default quota of 10,000 units/day. Each upload uses ~1,600 units.

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/tuya-3/ai-workbench.git
cd ai-workbench

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create `.env.local` from the example:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```bash
# Required for video generation
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=tuya-3
GITHUB_REPO_NAME=ai-workbench

# Optional for YouTube upload
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
UPLOAD_TO_YOUTUBE=true
POST_TO_GITHUB=true
```

### 3. Configure GitHub Actions Secrets

For automated video generation via GitHub Actions, add secrets to your repository:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `YOUTUBE_CLIENT_ID` | YouTube OAuth client ID | ⬜ Optional |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth client secret | ⬜ Optional |
| `YOUTUBE_REFRESH_TOKEN` | YouTube OAuth refresh token | ⬜ Optional |
| `UPLOAD_TO_YOUTUBE` | Set to `true` to enable upload | ⬜ Optional |

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions, no need to add it.

## Usage

### Manual Video Generation

Generate a video from an issue:
```bash
npm run generate-video -- --issue 6
```

Generate a video from a pull request:
```bash
npm run generate-video -- --pr 2
```

Keep intermediate files (audio, slides) for debugging:
```bash
npm run generate-video -- --issue 6 --keep-files
```

### Automated via GitHub Actions

1. Create or open an Issue or Pull Request
2. Add the label `generate-video` to it
3. GitHub Actions will automatically:
   - Extract the content
   - Generate a video script using GPT-4
   - Create audio narration using OpenAI TTS
   - Generate visual slides
   - Compose the final video
   - Upload to YouTube (if configured)
   - Post the video link as a comment

### Check Dependencies

Before running, verify all dependencies are installed:
```bash
npm run generate-video -- --check-deps
```

Expected output:
```
🔍 Checking dependencies...

FFmpeg: ✅
FFprobe: ✅

All dependencies: ✅ OK
```

## Workflow Customization

### Video Configuration

Edit `workflows/video-generator/config/video-config.json`:

```json
{
  "video": {
    "resolution": "1920x1080",
    "fps": 30,
    "bitrate": "5000k"
  },
  "audio": {
    "voice": "alloy",
    "model": "tts-1-hd",
    "speed": 1.0
  },
  "slides": {
    "duration": 5,
    "backgroundColor": "#1a1a2e",
    "textColor": "#ffffff",
    "accentColor": "#00d4ff"
  }
}
```

### Available TTS Voices

OpenAI TTS offers the following voices:
- `alloy` - Neutral, balanced voice
- `echo` - Clear, professional voice
- `fable` - Warm, engaging voice
- `onyx` - Deep, authoritative voice
- `nova` - Friendly, conversational voice
- `shimmer` - Bright, energetic voice

Test different voices to find your preferred style.

### Slide Templates

Customize the slide design by editing:
`workflows/video-generator/templates/slide-template.html`

## Troubleshooting

### FFmpeg Not Found
```bash
# Verify FFmpeg is in PATH
which ffmpeg

# If not found, install it
sudo apt-get install ffmpeg  # Ubuntu/Debian
brew install ffmpeg          # macOS
```

### OpenAI API Errors

**Rate limit exceeded**:
- Wait a few minutes and try again
- Check your OpenAI usage limits
- Upgrade your OpenAI plan if needed

**Invalid API key**:
- Verify the key in `.env.local`
- Ensure no extra spaces or quotes
- Generate a new key if needed

### YouTube Upload Fails

**Quota exceeded**:
- Default quota: 10,000 units/day
- Each upload: ~1,600 units
- Request quota increase in Google Cloud Console

**Invalid credentials**:
- Verify OAuth credentials
- Regenerate refresh token if expired
- Check project permissions in Google Cloud

### Video Generation Takes Too Long

**Normal processing times**:
- Script generation: 10-30 seconds
- Audio generation: 1-2 minutes
- Slide generation: 10-30 seconds
- Video composition: 1-3 minutes
- YouTube upload: 1-5 minutes

**Total**: 5-15 minutes per video

## Cost Management

### OpenAI Costs

| Component | Model | Approximate Cost |
|-----------|-------|------------------|
| Script Generation | GPT-4 | $0.03-0.05 per video |
| Audio Generation | TTS-1-HD | $0.03-0.06 per video |
| **Total** | | **$0.06-0.11 per video** |

### YouTube Costs

- API usage is free within quota limits
- No storage costs for public videos
- Request quota increase if needed (free)

### Optimization Tips

1. **Limit script length**: Shorter videos cost less
2. **Use TTS-1 instead of TTS-1-HD**: Lower quality but cheaper
3. **Batch processing**: Generate multiple videos in one session
4. **Cache intermediate files**: Reuse audio/slides for similar content

## Best Practices

### Content Quality

1. **Write clear issues**: Better input = better video
2. **Include code examples**: Makes technical content clearer
3. **Add visuals notes**: Suggest diagrams or illustrations
4. **Keep it focused**: One topic per video

### Video Management

1. **Use playlists**: Organize videos by topic
2. **Add timestamps**: Help viewers navigate
3. **Include links**: Reference original issue/PR
4. **Enable comments**: Engage with viewers

### Security

1. **Never commit secrets**: Use environment variables
2. **Rotate API keys**: Change periodically
3. **Limit token scopes**: Only grant necessary permissions
4. **Monitor usage**: Check API quotas regularly

## Next Steps

1. ✅ Complete setup above
2. ✅ Test with a simple issue
3. ✅ Customize video style
4. ✅ Set up YouTube channel
5. ✅ Automate with GitHub Actions

## Support

For help or questions:
- Check the main [README](README.md)
- Review [workflow scripts](scripts/)
- Open an issue on GitHub
- Check OpenAI and YouTube API documentation

## Resources

- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
