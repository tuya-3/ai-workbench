/**
 * Video Composer
 * Combines audio, slides, and transitions into final video using FFmpeg
 */

import { AudioSegment } from './generate-audio';
import { SlideImage } from './generate-slides';
import { VideoScript } from './generate-script';
import * as fs from 'fs';
import * as path from 'path';

export interface VideoCompositionResult {
  videoPath: string;
  duration: number;
  resolution: string;
}

/**
 * Compose final video from audio and slides
 */
export async function composeVideo(
  script: VideoScript,
  audioSegments: AudioSegment[],
  slides: SlideImage[],
  outputPath: string,
  config: {
    resolution?: string;
    fps?: number;
    bitrate?: string;
    includeIntro?: boolean;
    includeOutro?: boolean;
    transitionDuration?: number;
  } = {}
): Promise<VideoCompositionResult> {
  const {
    resolution = '1920x1080',
    fps = 30,
    bitrate = '5000k',
    includeIntro = false,
    includeOutro = false,
    transitionDuration = 0.5
  } = config;

  console.log('Starting video composition...');

  // Create FFmpeg filter complex for combining slides and audio
  const filterComplex = buildFilterComplex(
    audioSegments,
    slides,
    resolution,
    fps,
    transitionDuration
  );

  // Build FFmpeg command
  const command = buildFFmpegCommand(
    audioSegments,
    slides,
    outputPath,
    filterComplex,
    {
      resolution,
      fps,
      bitrate,
      includeIntro,
      includeOutro,
    }
  );

  console.log('FFmpeg command:', command);

  // Execute FFmpeg
  await executeFFmpeg(command);

  // Get video duration
  const duration = audioSegments.reduce((sum, seg) => sum + seg.duration, 0);

  return {
    videoPath: outputPath,
    duration,
    resolution,
  };
}

/**
 * Build FFmpeg filter complex for video composition
 */
function buildFilterComplex(
  audioSegments: AudioSegment[],
  slides: SlideImage[],
  resolution: string,
  fps: number,
  transitionDuration: number
): string {
  const filters: string[] = [];

  // For each slide, create a video segment
  slides.forEach((slide, index) => {
    const audioSegment = audioSegments[index];
    if (!audioSegment) return;

    const duration = audioSegment.duration;

    // Create video from image with duration
    filters.push(
      `[${index}:v]scale=${resolution},setsar=1,fps=${fps},` +
      `loop=loop=-1:size=${fps * duration}:start=0[v${index}]`
    );
  });

  // Concatenate all video segments
  if (slides.length > 1) {
    const inputs = slides.map((_, i) => `[v${i}]`).join('');
    filters.push(`${inputs}concat=n=${slides.length}:v=1:a=0[outv]`);
  } else {
    filters.push('[v0]copy[outv]');
  }

  return filters.join(';');
}

/**
 * Build complete FFmpeg command
 */
function buildFFmpegCommand(
  audioSegments: AudioSegment[],
  slides: SlideImage[],
  outputPath: string,
  filterComplex: string,
  config: {
    resolution: string;
    fps: number;
    bitrate: string;
    includeIntro: boolean;
    includeOutro: boolean;
  }
): string {
  const inputs: string[] = [];

  // Add slide images as inputs
  slides.forEach(slide => {
    inputs.push(`-loop 1 -i "${slide.imagePath}"`);
  });

  // Add audio files as inputs
  audioSegments.forEach(audio => {
    inputs.push(`-i "${audio.audioPath}"`);
  });

  const inputStr = inputs.join(' ');

  // Combine all audio tracks
  const audioFilter = audioSegments.length > 1
    ? `-filter_complex "${audioSegments.map((_, i) => `[${slides.length + i}:a]`).join('')}concat=n=${audioSegments.length}:v=0:a=1[outa]" -map "[outv]" -map "[outa]"`
    : `-map "[outv]" -map ${slides.length}:a`;

  return `ffmpeg ${inputStr} \
    -filter_complex "${filterComplex}" \
    ${audioFilter} \
    -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 192k \
    -r ${config.fps} -b:v ${config.bitrate} \
    -pix_fmt yuv420p \
    -shortest \
    -y "${outputPath}"`;
}

/**
 * Execute FFmpeg command
 */
async function executeFFmpeg(command: string): Promise<void> {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    console.log('Executing FFmpeg...');
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stderr) {
      console.log('FFmpeg output:', stderr);
    }

    console.log('Video composition complete!');
  } catch (error: any) {
    console.error('FFmpeg error:', error.stderr || error.message);
    throw new Error(`Video composition failed: ${error.message}`);
  }
}

/**
 * Simplified video composition for basic use cases
 */
export async function composeSimpleVideo(
  audioPath: string,
  imagePath: string,
  outputPath: string,
  duration?: number
): Promise<void> {
  const command = duration
    ? `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -t ${duration} -y "${outputPath}"`
    : `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -y "${outputPath}"`;

  await executeFFmpeg(command);
}

/**
 * Add intro/outro to video
 */
export async function addIntroOutro(
  mainVideoPath: string,
  introPath: string | null,
  outroPath: string | null,
  outputPath: string
): Promise<void> {
  if (!introPath && !outroPath) {
    // No intro/outro, just copy the file
    fs.copyFileSync(mainVideoPath, outputPath);
    return;
  }

  const videoPaths: string[] = [];
  if (introPath) videoPaths.push(introPath);
  videoPaths.push(mainVideoPath);
  if (outroPath) videoPaths.push(outroPath);

  // Create concat file for FFmpeg
  const concatFilePath = path.join(path.dirname(outputPath), 'concat_videos.txt');
  const concatContent = videoPaths.map(p => `file '${p}'`).join('\n');
  fs.writeFileSync(concatFilePath, concatContent);

  try {
    const command = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy -y "${outputPath}"`;
    await executeFFmpeg(command);
  } finally {
    // Clean up
    if (fs.existsSync(concatFilePath)) {
      fs.unlinkSync(concatFilePath);
    }
  }
}

/**
 * Get video info using FFprobe
 */
export async function getVideoInfo(videoPath: string): Promise<{
  duration: number;
  resolution: string;
  fps: number;
  bitrate: number;
}> {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,bit_rate -show_entries format=duration -of json "${videoPath}"`;
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);

    const stream = data.streams[0];
    const format = data.format;

    return {
      duration: parseFloat(format.duration),
      resolution: `${stream.width}x${stream.height}`,
      fps: eval(stream.r_frame_rate), // e.g., "30/1" -> 30
      bitrate: parseInt(stream.bit_rate),
    };
  } catch (error) {
    console.error('Failed to get video info:', error);
    throw error;
  }
}
