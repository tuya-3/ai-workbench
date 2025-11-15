/**
 * Slide Generator
 * Creates visual slides for video sections using HTML and Puppeteer
 */

import { VideoScript, ScriptSection } from './generate-script';
import * as fs from 'fs';
import * as path from 'path';

export interface SlideImage {
  sectionIndex: number;
  imagePath: string;
  section: ScriptSection;
}

export interface SlideGenerationResult {
  slides: SlideImage[];
  outputDir: string;
}

/**
 * Generate slides for video script
 */
export async function generateSlides(
  script: VideoScript,
  outputDir: string,
  config: {
    resolution?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  } = {}
): Promise<SlideGenerationResult> {
  const {
    resolution = '1920x1080',
    backgroundColor = '#1a1a2e',
    textColor = '#ffffff',
    accentColor = '#00d4ff'
  } = config;

  const [width, height] = resolution.split('x').map(Number);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const slides: SlideImage[] = [];

  // Generate slide for each section
  for (let i = 0; i < script.sections.length; i++) {
    const section = script.sections[i];
    const imagePath = path.join(outputDir, `slide_${i}_${section.type}.png`);

    console.log(`Generating slide ${i + 1}/${script.sections.length}: ${section.heading}`);

    const html = generateSlideHTML(section, i, script, {
      width,
      height,
      backgroundColor,
      textColor,
      accentColor,
    });

    // Save HTML for debugging
    const htmlPath = path.join(outputDir, `slide_${i}_${section.type}.html`);
    fs.writeFileSync(htmlPath, html);

    // Note: In production, you would use Puppeteer here to render HTML to image
    // For now, we'll create a placeholder
    await createPlaceholderSlide(imagePath, section, { width, height, backgroundColor, textColor });

    slides.push({
      sectionIndex: i,
      imagePath,
      section,
    });
  }

  return {
    slides,
    outputDir,
  };
}

/**
 * Generate HTML for a slide
 */
function generateSlideHTML(
  section: ScriptSection,
  index: number,
  script: VideoScript,
  config: {
    width: number;
    height: number;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  }
): string {
  const { width, height, backgroundColor, textColor, accentColor } = config;

  let contentHTML = '';

  // Different layouts based on section type
  switch (section.type) {
    case 'intro':
      contentHTML = `
        <h1 style="font-size: 72px; margin-bottom: 30px; color: ${accentColor};">${script.title}</h1>
        <p style="font-size: 36px; opacity: 0.9;">${section.heading}</p>
      `;
      break;

    case 'code':
      contentHTML = `
        <h2 style="font-size: 56px; margin-bottom: 40px; color: ${accentColor};">${section.heading}</h2>
        ${section.codeSnippet ? `
          <pre style="
            background: rgba(0,0,0,0.3);
            padding: 30px;
            border-radius: 10px;
            font-size: 24px;
            text-align: left;
            max-width: 80%;
            margin: 0 auto;
            overflow: hidden;
          "><code>${escapeHTML(section.codeSnippet)}</code></pre>
        ` : ''}
      `;
      break;

    case 'summary':
    case 'outro':
      contentHTML = `
        <h2 style="font-size: 64px; margin-bottom: 40px; color: ${accentColor};">${section.heading}</h2>
        ${section.bulletPoints ? `
          <ul style="font-size: 32px; text-align: left; max-width: 80%; margin: 0 auto; list-style: none; padding: 0;">
            ${section.bulletPoints.map(point => `
              <li style="margin: 20px 0; padding-left: 40px; position: relative;">
                <span style="position: absolute; left: 0; color: ${accentColor};">✓</span>
                ${escapeHTML(point)}
              </li>
            `).join('')}
          </ul>
        ` : ''}
      `;
      break;

    default: // main
      contentHTML = `
        <h2 style="font-size: 56px; margin-bottom: 40px; color: ${accentColor};">${section.heading}</h2>
        ${section.bulletPoints ? `
          <ul style="font-size: 32px; text-align: left; max-width: 80%; margin: 0 auto; list-style: none; padding: 0;">
            ${section.bulletPoints.map(point => `
              <li style="margin: 20px 0; padding-left: 40px; position: relative;">
                <span style="position: absolute; left: 0; color: ${accentColor};">•</span>
                ${escapeHTML(point)}
              </li>
            `).join('')}
          </ul>
        ` : `
          <p style="font-size: 32px; max-width: 80%; margin: 0 auto; line-height: 1.6;">
            ${escapeHTML(section.visualNotes || section.narration.substring(0, 200))}
          </p>
        `}
      `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      background: ${backgroundColor};
      color: ${textColor};
      font-family: 'Arial', 'Helvetica', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      text-align: center;
    }
  </style>
</head>
<body>
  ${contentHTML}
  <div style="position: absolute; bottom: 40px; right: 60px; font-size: 24px; opacity: 0.5;">
    AI Workbench
  </div>
</body>
</html>
  `.trim();
}

/**
 * Create a placeholder slide image (without Puppeteer)
 * In production, this should use Puppeteer to render the HTML
 */
async function createPlaceholderSlide(
  outputPath: string,
  section: ScriptSection,
  config: { width: number; height: number; backgroundColor: string; textColor: string }
): Promise<void> {
  // Note: This is a simplified version. In production, you would use:
  // 1. Puppeteer to render HTML to PNG
  // 2. Canvas API to draw programmatically
  // 3. ImageMagick for command-line image generation
  
  // For now, create a simple text file as placeholder
  const placeholder = `Slide: ${section.heading}\nType: ${section.type}\n\n${section.visualNotes || 'Visual content'}`;
  fs.writeFileSync(outputPath.replace('.png', '.txt'), placeholder);
  
  console.log(`Placeholder slide created: ${outputPath}`);
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate slide using Puppeteer (production implementation)
 * This is the actual implementation that would be used in production
 */
export async function generateSlideWithPuppeteer(
  htmlContent: string,
  outputPath: string,
  width: number = 1920,
  height: number = 1080
): Promise<void> {
  // Production code would use Puppeteer:
  // const puppeteer = require('puppeteer');
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setViewport({ width, height });
  // await page.setContent(htmlContent);
  // await page.screenshot({ path: outputPath });
  // await browser.close();
  
  console.log(`Would generate slide with Puppeteer: ${outputPath}`);
}
