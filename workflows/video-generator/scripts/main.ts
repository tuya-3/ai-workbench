/**
 * Main Video Generation Orchestrator
 * Coordinates the entire video generation pipeline
 */

import * as path from 'path';
import * as fs from 'fs';
import { extractContent, IssueContent, PRContent } from './extract-content';
import { generateScript, VideoScript, validateAndAdjustScript } from './generate-script';
import { generateAudio, AudioGenerationResult } from './generate-audio';
import { generateSlides, SlideGenerationResult } from './generate-slides';
import { composeVideo, VideoCompositionResult } from './compose-video';
import { uploadToYouTube, generateYouTubeMetadata, postVideoLinkToGitHub, UploadResult } from './upload-youtube';

export interface GenerationConfig {
  // GitHub
  githubToken: string;
  owner: string;
  repo: string;
  
  // OpenAI
  openaiApiKey: string;
  
  // YouTube (optional)
  youtubeClientId?: string;
  youtubeClientSecret?: string;
  youtubeRefreshToken?: string;
  
  // Video settings
  workingDir?: string;
  keepIntermediateFiles?: boolean;
  uploadToYouTube?: boolean;
  postToGitHub?: boolean;
  
  // Video config
  videoConfig?: {
    resolution?: string;
    fps?: number;
    bitrate?: string;
    voice?: string;
    model?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  script?: VideoScript;
  audioResult?: AudioGenerationResult;
  slidesResult?: SlideGenerationResult;
  videoResult?: VideoCompositionResult;
  uploadResult?: UploadResult;
  error?: string;
  workingDir: string;
}

/**
 * Main function to generate video from Issue/PR
 */
export async function generateVideoFromIssueOrPR(
  type: 'issue' | 'pr',
  number: number,
  config: GenerationConfig
): Promise<GenerationResult> {
  const workingDir = config.workingDir || path.join('/tmp', `video-gen-${Date.now()}`);
  
  try {
    console.log(`\n🎬 Starting video generation for ${type} #${number}`);
    console.log(`Working directory: ${workingDir}`);
    
    // Create working directory structure
    fs.mkdirSync(workingDir, { recursive: true });
    const audioDir = path.join(workingDir, 'audio');
    const slidesDir = path.join(workingDir, 'slides');
    const outputDir = path.join(workingDir, 'output');
    [audioDir, slidesDir, outputDir].forEach(dir => fs.mkdirSync(dir, { recursive: true }));

    // Step 1: Extract content from GitHub
    console.log(`\n📥 [1/6] Extracting ${type} content from GitHub...`);
    const content = await extractContent(
      config.owner,
      config.repo,
      number,
      config.githubToken,
      type
    );
    console.log(`✅ Extracted: ${content.title}`);
    
    // Save content for reference
    fs.writeFileSync(
      path.join(workingDir, 'content.json'),
      JSON.stringify(content, null, 2)
    );

    // Step 2: Generate script
    console.log('\n📝 [2/6] Generating video script with GPT-4...');
    let script = await generateScript(content, config.openaiApiKey, {
      maxLength: 3000,
      temperature: 0.7,
      model: 'gpt-4-turbo-preview',
    });
    
    // Validate and adjust script duration
    script = validateAndAdjustScript(script, 600); // Max 10 minutes
    console.log(`✅ Script generated: ${script.sections.length} sections, ~${Math.floor(script.estimatedDuration / 60)} min ${script.estimatedDuration % 60} sec`);
    
    // Save script
    fs.writeFileSync(
      path.join(workingDir, 'script.json'),
      JSON.stringify(script, null, 2)
    );

    // Step 3: Generate audio
    console.log('\n🎙️ [3/6] Generating audio with OpenAI TTS...');
    const audioResult = await generateAudio(
      script,
      config.openaiApiKey,
      audioDir,
      {
        voice: (config.videoConfig?.voice as any) || 'alloy',
        model: (config.videoConfig?.model as any) || 'tts-1-hd',
        speed: 1.0,
      }
    );
    console.log(`✅ Generated ${audioResult.segments.length} audio segments, total ${Math.floor(audioResult.totalDuration / 60)}m ${Math.floor(audioResult.totalDuration % 60)}s`);

    // Step 4: Generate slides
    console.log('\n🖼️ [4/6] Generating slides...');
    const slidesResult = await generateSlides(script, slidesDir, {
      resolution: config.videoConfig?.resolution || '1920x1080',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#00d4ff',
    });
    console.log(`✅ Generated ${slidesResult.slides.length} slides`);

    // Step 5: Compose video
    console.log('\n🎬 [5/6] Composing final video with FFmpeg...');
    const videoPath = path.join(outputDir, `${type}_${number}_video.mp4`);
    const videoResult = await composeVideo(
      script,
      audioResult.segments,
      slidesResult.slides,
      videoPath,
      {
        resolution: config.videoConfig?.resolution || '1920x1080',
        fps: config.videoConfig?.fps || 30,
        bitrate: config.videoConfig?.bitrate || '5000k',
      }
    );
    console.log(`✅ Video created: ${videoResult.videoPath}`);
    console.log(`   Duration: ${Math.floor(videoResult.duration / 60)}m ${Math.floor(videoResult.duration % 60)}s`);
    console.log(`   Resolution: ${videoResult.resolution}`);

    // Step 6: Upload to YouTube (if configured)
    let uploadResult: UploadResult | undefined;
    if (config.uploadToYouTube && config.youtubeClientId && config.youtubeClientSecret && config.youtubeRefreshToken) {
      console.log('\n📤 [6/6] Uploading to YouTube...');
      
      const metadata = generateYouTubeMetadata(script, ['AI', 'Tutorial', 'DevOps'], '28', 'unlisted');
      
      uploadResult = await uploadToYouTube(
        videoResult.videoPath,
        metadata,
        {
          clientId: config.youtubeClientId,
          clientSecret: config.youtubeClientSecret,
          refreshToken: config.youtubeRefreshToken,
        }
      );
      
      console.log(`✅ Uploaded to YouTube: ${uploadResult.url}`);

      // Post link to GitHub if configured
      if (config.postToGitHub) {
        await postVideoLinkToGitHub(
          config.owner,
          config.repo,
          number,
          uploadResult.url,
          config.githubToken
        );
        console.log('✅ Posted video link to GitHub issue/PR');
      }
    } else {
      console.log('\n⏭️ [6/6] Skipping YouTube upload (not configured)');
    }

    // Clean up intermediate files if requested
    if (!config.keepIntermediateFiles) {
      console.log('\n🧹 Cleaning up intermediate files...');
      [audioDir, slidesDir].forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      });
    }

    console.log('\n✅ ✨ Video generation complete! ✨');
    console.log(`📁 Output: ${videoResult.videoPath}`);
    if (uploadResult) {
      console.log(`🔗 YouTube: ${uploadResult.url}`);
    }

    return {
      success: true,
      script,
      audioResult,
      slidesResult,
      videoResult,
      uploadResult,
      workingDir,
    };

  } catch (error: any) {
    console.error('\n❌ Error during video generation:', error.message);
    console.error(error.stack);

    return {
      success: false,
      error: error.message,
      workingDir,
    };
  }
}

/**
 * Check if all required dependencies are available
 */
export async function checkDependencies(): Promise<{
  ffmpeg: boolean;
  ffprobe: boolean;
  allOk: boolean;
}> {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  const checks = {
    ffmpeg: false,
    ffprobe: false,
    allOk: false,
  };

  try {
    await execAsync('ffmpeg -version');
    checks.ffmpeg = true;
  } catch (e) {
    console.error('❌ FFmpeg not found. Please install FFmpeg.');
  }

  try {
    await execAsync('ffprobe -version');
    checks.ffprobe = true;
  } catch (e) {
    console.error('❌ FFprobe not found. Please install FFmpeg (includes ffprobe).');
  }

  checks.allOk = checks.ffmpeg && checks.ffprobe;

  return checks;
}
