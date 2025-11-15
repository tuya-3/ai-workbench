# Example: Generating a Video from Issue #6

This example demonstrates how to generate an AI video from a GitHub Issue.

## Manual Generation

### Step 1: Set Environment Variables

Create `.env.local` file with your credentials:

```bash
OPENAI_API_KEY=sk-proj-...
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=tuya-3
GITHUB_REPO_NAME=ai-workbench

# Optional for YouTube upload
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
UPLOAD_TO_YOUTUBE=true
```

### Step 2: Check Dependencies

Verify FFmpeg is installed:

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

### Step 3: Generate Video

Run the generator for Issue #6:

```bash
npm run generate-video -- --issue 6
```

### Expected Output

```
🎬 Starting video generation for issue #6
Working directory: /tmp/video-gen-1699999999999

📥 [1/6] Extracting issue content from GitHub...
✅ Extracted: Issue/PR の内容から生成AIで解説動画を自動作成するワークフローを確立

📝 [2/6] Generating video script with GPT-4...
✅ Script generated: 5 sections, ~8 min 30 sec

🎙️ [3/6] Generating audio with OpenAI TTS...
Generating audio for section 1/5: Introduction
Audio saved to: /tmp/video-gen-1699999999999/audio/section_0_intro.mp3
Generating audio for section 2/5: Overview
Audio saved to: /tmp/video-gen-1699999999999/audio/section_1_main.mp3
...
✅ Generated 5 audio segments, total 8m 32s

🖼️ [4/6] Generating slides...
Generating slide 1/5: Introduction
Generating slide 2/5: Overview
...
✅ Generated 5 slides

🎬 [5/6] Composing final video with FFmpeg...
FFmpeg command: ffmpeg -loop 1 -i ".../slide_0_intro.png" ...
Executing FFmpeg...
FFmpeg output: ... (encoding progress)
✅ Video created: /tmp/video-gen-1699999999999/output/issue_6_video.mp4
   Duration: 8m 32s
   Resolution: 1920x1080

📤 [6/6] Uploading to YouTube...
Starting YouTube upload...
Video uploaded successfully: https://www.youtube.com/watch?v=dQw4w9WgXcQ
✅ Posted video link to GitHub issue/PR

✅ ✨ Video generation complete! ✨

============================================================
✅ SUCCESS!
============================================================
📹 Video: /tmp/video-gen-1699999999999/output/issue_6_video.mp4
🔗 YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ
============================================================
```

## Automated Generation via GitHub Actions

### Step 1: Configure Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- `OPENAI_API_KEY` - Your OpenAI API key
- `YOUTUBE_CLIENT_ID` - YouTube OAuth client ID (optional)
- `YOUTUBE_CLIENT_SECRET` - YouTube OAuth client secret (optional)
- `YOUTUBE_REFRESH_TOKEN` - YouTube OAuth refresh token (optional)
- `UPLOAD_TO_YOUTUBE` - Set to `true` to enable upload (optional)

### Step 2: Trigger Video Generation

1. Open Issue #6 (or create a new issue)
2. Add the label `generate-video`
3. Wait for GitHub Actions to complete

### Step 3: Check Progress

Go to Actions tab and watch the "Generate AI Video" workflow:

- ✅ Checkout repository
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Install FFmpeg
- ✅ Generate video
- ✅ Upload video artifact

### Step 4: View Results

After completion:

1. **Check comments**: The bot will post a comment with the YouTube link
2. **Download artifact**: If upload is disabled, download the MP4 from Actions artifacts
3. **View video**: Watch the generated video on YouTube

## Example Video Structure

For Issue #6, the generated video would include:

### Section 1: Introduction (15 seconds)
- **Slide**: Title card with issue number
- **Narration**: "Welcome! Today we're exploring Issue #6: Establishing an AI-powered workflow to automatically generate explanation videos from GitHub Issues and PRs."

### Section 2: Overview (2 minutes)
- **Slide**: Bullet points of key concepts
- **Narration**: Overview of the video generation workflow, background, and goals

### Section 3: Technical Stack (2 minutes)
- **Slide**: Technology logos and services
- **Narration**: Explanation of OpenAI, FFmpeg, YouTube API integration

### Section 4: Workflow (3 minutes)
- **Slide**: Flowchart diagram
- **Narration**: Step-by-step walkthrough of the automation pipeline

### Section 5: Examples & Summary (1 minute)
- **Slide**: Use cases and call-to-action
- **Narration**: Real-world examples and conclusion

## Customization

### Change Voice

Edit `workflows/video-generator/config/video-config.json`:

```json
{
  "audio": {
    "voice": "nova",  // Options: alloy, echo, fable, onyx, nova, shimmer
    "model": "tts-1-hd"
  }
}
```

### Adjust Video Quality

```json
{
  "video": {
    "resolution": "1920x1080",
    "fps": 30,
    "bitrate": "8000k"  // Higher for better quality
  }
}
```

### Custom Slide Colors

```json
{
  "slides": {
    "backgroundColor": "#000000",
    "textColor": "#ffffff",
    "accentColor": "#ff6b6b"  // Custom brand color
  }
}
```

## Troubleshooting

### Issue: "FFmpeg not found"

Install FFmpeg:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

### Issue: "OpenAI API rate limit exceeded"

Wait a few minutes or upgrade your OpenAI plan.

### Issue: "YouTube quota exceeded"

Default quota allows ~6 uploads per day. Request increase in Google Cloud Console.

### Issue: Video generation takes too long

- Normal time: 5-15 minutes
- Reduce script length to speed up
- Use faster TTS model: `tts-1` instead of `tts-1-hd`

## Cost Breakdown

For a 10-minute video from Issue #6:

| Service | Usage | Cost |
|---------|-------|------|
| GPT-4 Script | ~3,000 tokens | $0.03 |
| OpenAI TTS | ~2,500 chars | $0.04 |
| YouTube Upload | Free | $0.00 |
| **Total** | | **$0.07** |

## Next Steps

1. ✅ Generate your first video from a real issue
2. ✅ Customize the video style to match your brand
3. ✅ Set up automated workflow with GitHub Actions
4. ✅ Create a YouTube playlist for all generated videos
5. ✅ Share videos with your community

## Resources

- [Full Documentation](README.md)
- [Setup Guide](SETUP.md)
- [Video Configuration](config/video-config.json)
- [OpenAI TTS Pricing](https://openai.com/pricing)
- [YouTube API Quotas](https://developers.google.com/youtube/v3/getting-started#quota)
