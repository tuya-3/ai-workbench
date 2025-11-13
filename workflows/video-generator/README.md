# AI Video Generation Workflow

Automatically generate technical explanation videos from GitHub Issues/PRs using generative AI and upload them to YouTube.

## Overview

This workflow transforms GitHub Issues and Pull Requests into engaging technical video content using:
- **OpenAI GPT-4**: Script generation from Issue/PR content
- **OpenAI TTS**: Natural voice narration
- **FFmpeg**: Video composition and editing
- **YouTube Data API**: Automated upload and publishing

## Architecture

```
GitHub Issue/PR
    ↓
[1] Content Extraction (GitHub API)
    ↓
[2] Script Generation (GPT-4)
    ↓
[3] Audio Generation (OpenAI TTS)
    ↓
[4] Visual Content Generation (Slides, Code, Diagrams)
    ↓
[5] Video Composition (FFmpeg)
    ↓
[6] YouTube Upload (YouTube Data API)
```

## Quick Start

### Prerequisites

- Node.js 20+
- FFmpeg installed
- OpenAI API key
- YouTube Data API credentials
- GitHub Personal Access Token

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# YouTube Configuration
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=tuya-3
GITHUB_REPO_NAME=ai-workbench
```

### Usage

#### Manual Generation

Generate a video from an issue:
```bash
npm run generate-video -- --issue 6
```

Generate a video from a pull request:
```bash
npm run generate-video -- --pr 2
```

#### Automated via GitHub Actions

1. Create or comment on an Issue/PR
2. Add the label `generate-video`
3. GitHub Actions will automatically:
   - Extract the content
   - Generate the video
   - Upload to YouTube
   - Comment back with the video link

## Configuration

### Video Settings

Edit `workflows/video-generator/config/video-config.json`:

```json
{
  "video": {
    "resolution": "1920x1080",
    "fps": 30,
    "format": "mp4"
  },
  "audio": {
    "voice": "alloy",
    "model": "tts-1-hd"
  },
  "slides": {
    "duration": 5,
    "transition": "fade"
  }
}
```

### Templates

Customize video templates in `workflows/video-generator/templates/`:
- `intro.mp4` - Video intro
- `outro.mp4` - Video outro
- `slide-template.html` - Slide design

## Scripts

### Core Scripts

- `extract-content.ts` - Extract Issue/PR content from GitHub
- `generate-script.ts` - Convert content to video script using GPT-4
- `generate-audio.ts` - Create TTS audio from script
- `generate-slides.ts` - Create visual slides
- `compose-video.ts` - Assemble final video with FFmpeg
- `upload-youtube.ts` - Upload to YouTube

### Workflow

- `main.ts` - Main orchestration script
- `cli.ts` - Command-line interface

## API Integrations

### OpenAI

- **GPT-4**: Script generation from Issue/PR markdown
- **TTS API**: High-quality voice narration
- **DALL-E (Optional)**: Generate custom graphics

### YouTube Data API v3

- Upload videos programmatically
- Set metadata (title, description, tags)
- Manage playlists

### GitHub API

- Fetch Issue/PR content
- Extract code snippets and discussions
- Post video link as comment

## Cost Estimation

Based on a 10-minute video:

| Service | Usage | Cost (USD) |
|---------|-------|------------|
| OpenAI GPT-4 | ~5k tokens | $0.05 |
| OpenAI TTS | ~3k characters | $0.05 |
| YouTube Upload | Free | $0.00 |
| **Total** | | **~$0.10** |

## Examples

### Example 1: Simple Demo Video

**Input**: Issue #2 "Vercel Deployment Guide"
**Output**: 5-minute walkthrough video
**Content**: Step-by-step deployment instructions

### Example 2: Technical Deep Dive

**Input**: Issue #5 "Supabase + Dify Integration"
**Output**: 10-minute technical explanation
**Content**: Architecture diagrams, code examples, integration steps

### Example 3: Progress Report

**Input**: Weekly completed issues
**Output**: 3-minute summary video
**Content**: Highlights of completed features

## Troubleshooting

### FFmpeg not found
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### YouTube API quota exceeded
- Default quota: 10,000 units/day
- Upload costs: 1,600 units
- Request quota increase in Google Cloud Console

### Audio generation fails
- Check OpenAI API key
- Verify API quota/billing
- Ensure script is under character limit

## Security

- Never commit API keys to git
- Use environment variables for secrets
- Rotate tokens regularly
- Follow least-privilege principle for API scopes

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see [LICENSE](../../LICENSE) for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review example videos

## Roadmap

- [ ] Support for multiple languages (i18n)
- [ ] Custom avatar integration (D-ID, Synthesia)
- [ ] Advanced video editing (transitions, effects)
- [ ] Batch processing for multiple issues
- [ ] Analytics and performance metrics
- [ ] Live streaming capability
- [ ] Interactive elements (chapters, cards)

## References

- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [GitHub Actions Workflow](https://docs.github.com/en/actions)
