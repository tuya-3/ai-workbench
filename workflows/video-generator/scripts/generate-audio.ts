/**
 * Audio Generator using OpenAI Text-to-Speech
 * Converts script narration into high-quality audio files
 */

import { VideoScript } from './generate-script';
import * as fs from 'fs';
import * as path from 'path';

export interface AudioSegment {
  sectionIndex: number;
  audioPath: string;
  duration: number;
  text: string;
}

export interface AudioGenerationResult {
  segments: AudioSegment[];
  totalDuration: number;
  outputDir: string;
}

/**
 * Generate audio from video script using OpenAI TTS
 */
export async function generateAudio(
  script: VideoScript,
  apiKey: string,
  outputDir: string,
  config: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
    speed?: number;
  } = {}
): Promise<AudioGenerationResult> {
  const {
    voice = 'alloy',
    model = 'tts-1-hd',
    speed = 1.0
  } = config;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const segments: AudioSegment[] = [];
  let totalDuration = 0;

  // Generate audio for each section
  for (let i = 0; i < script.sections.length; i++) {
    const section = script.sections[i];
    const narration = section.narration;

    if (!narration || narration.trim().length === 0) {
      continue;
    }

    console.log(`Generating audio for section ${i + 1}/${script.sections.length}: ${section.heading}`);

    const audioPath = path.join(outputDir, `section_${i}_${section.type}.mp3`);

    try {
      await generateSingleAudio(narration, audioPath, apiKey, { voice, model, speed });

      // Get actual audio duration (estimate based on character count and speed)
      const estimatedDuration = estimateAudioDuration(narration, speed);

      segments.push({
        sectionIndex: i,
        audioPath,
        duration: estimatedDuration,
        text: narration,
      });

      totalDuration += estimatedDuration;
    } catch (error) {
      console.error(`Failed to generate audio for section ${i}:`, error);
      throw error;
    }
  }

  return {
    segments,
    totalDuration,
    outputDir,
  };
}

/**
 * Generate a single audio file using OpenAI TTS API
 */
async function generateSingleAudio(
  text: string,
  outputPath: string,
  apiKey: string,
  config: {
    voice: string;
    model: string;
    speed: number;
  }
): Promise<void> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      voice: config.voice,
      input: text,
      speed: config.speed,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS API error: ${response.statusText} - ${errorText}`);
  }

  // Get audio data as ArrayBuffer
  const audioBuffer = await response.arrayBuffer();

  // Write to file
  fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

  console.log(`Audio saved to: ${outputPath}`);
}

/**
 * Estimate audio duration based on text length and speed
 * Average speaking rate: ~150 words per minute (2.5 words per second)
 * Adjusted by speed parameter
 */
function estimateAudioDuration(text: string, speed: number = 1.0): number {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5 * speed;
  const duration = wordCount / wordsPerSecond;
  return Math.ceil(duration);
}

/**
 * Combine multiple audio files into one
 */
export async function combineAudioFiles(
  audioFiles: string[],
  outputPath: string
): Promise<void> {
  // This requires FFmpeg to be installed
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  // Create concat file list for FFmpeg
  const concatFilePath = path.join(path.dirname(outputPath), 'concat_list.txt');
  const concatContent = audioFiles.map(file => `file '${file}'`).join('\n');
  fs.writeFileSync(concatFilePath, concatContent);

  try {
    // Use FFmpeg to concatenate audio files
    const command = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy "${outputPath}"`;
    await execAsync(command);
    console.log(`Combined audio saved to: ${outputPath}`);
  } finally {
    // Clean up concat file
    if (fs.existsSync(concatFilePath)) {
      fs.unlinkSync(concatFilePath);
    }
  }
}

/**
 * Get actual audio duration using FFmpeg
 */
export async function getAudioDuration(audioPath: string): Promise<number> {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    const { stdout } = await execAsync(command);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('Failed to get audio duration:', error);
    return 0;
  }
}
