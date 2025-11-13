/**
 * AI Script Generator
 * Converts Issue/PR content into video script using OpenAI GPT-4
 */

import { IssueContent, PRContent } from './extract-content';

export interface VideoScript {
  title: string;
  description: string;
  sections: ScriptSection[];
  estimatedDuration: number; // in seconds
  metadata: {
    sourceType: 'issue' | 'pr';
    sourceNumber: number;
    generatedAt: string;
  };
}

export interface ScriptSection {
  type: 'intro' | 'main' | 'code' | 'summary' | 'outro';
  heading: string;
  narration: string;
  visualNotes?: string;
  duration: number; // estimated duration in seconds
  codeSnippet?: string;
  bulletPoints?: string[];
}

/**
 * Generate video script from Issue/PR content using OpenAI
 */
export async function generateScript(
  content: IssueContent | PRContent,
  apiKey: string,
  config: {
    maxLength?: number;
    temperature?: number;
    model?: string;
  } = {}
): Promise<VideoScript> {
  const {
    maxLength = 3000,
    temperature = 0.7,
    model = 'gpt-4-turbo-preview'
  } = config;

  const prompt = buildPrompt(content, maxLength);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const scriptText = data.choices[0].message.content;

  // Parse the script from GPT-4 response
  const script = parseScriptFromGPT(scriptText, content);

  return script;
}

/**
 * Build prompt for GPT-4
 */
function buildPrompt(content: IssueContent | PRContent, maxLength: number): string {
  const isPR = content.type === 'pr';
  
  let prompt = `Create a technical video script from the following GitHub ${isPR ? 'Pull Request' : 'Issue'}:

Title: ${content.title}

Content:
${content.body.substring(0, maxLength)}

${content.comments.length > 0 ? `
Key Discussion Points:
${content.comments.slice(0, 3).map(c => `- ${c.author}: ${c.body.substring(0, 200)}`).join('\n')}
` : ''}

${isPR && (content as PRContent).commits ? `
Changes:
- ${(content as PRContent).additions} additions, ${(content as PRContent).deletions} deletions
- ${(content as PRContent).changedFiles} files changed
- Key commits: ${(content as PRContent).commits.slice(0, 3).map(c => c.message).join(', ')}
` : ''}

Create a video script with the following structure:
1. Intro (15-30 seconds) - Hook and overview
2. Main content (3-8 minutes) - Detailed explanation broken into clear sections
3. Code examples (if applicable) - 1-2 key snippets with explanations
4. Summary (30-45 seconds) - Key takeaways
5. Outro (15 seconds) - Call to action

For each section, provide:
- Heading
- Natural narration text (as if speaking to viewers)
- Visual notes (what should be shown on screen)
- Estimated duration

Format the response as structured JSON.`;

  return prompt;
}

/**
 * System prompt for GPT-4
 */
function getSystemPrompt(): string {
  return `You are an expert technical content creator specializing in creating engaging video scripts from GitHub Issues and Pull Requests. 

Your scripts should:
- Be conversational and engaging, not robotic
- Explain technical concepts clearly for a technical audience
- Include natural transitions between sections
- Suggest relevant visuals (code snippets, diagrams, bullet points)
- Be paced well for voice narration (not too fast or dense)
- Include a strong opening hook and clear conclusion

Return your response as a valid JSON object with this structure:
{
  "title": "Video title",
  "description": "Video description for YouTube",
  "sections": [
    {
      "type": "intro|main|code|summary|outro",
      "heading": "Section heading",
      "narration": "Full narration text",
      "visualNotes": "What to show on screen",
      "duration": 30,
      "codeSnippet": "optional code",
      "bulletPoints": ["optional", "bullet", "points"]
    }
  ]
}`;
}

/**
 * Parse GPT-4 response into VideoScript
 */
function parseScriptFromGPT(scriptText: string, content: IssueContent | PRContent): VideoScript {
  try {
    // Try to extract JSON from the response
    const jsonMatch = scriptText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in GPT response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Calculate total duration
    const estimatedDuration = parsed.sections.reduce(
      (total: number, section: ScriptSection) => total + (section.duration || 0),
      0
    );

    return {
      title: parsed.title || content.title,
      description: parsed.description || `Video generated from ${content.type} #${content.number}`,
      sections: parsed.sections || [],
      estimatedDuration,
      metadata: {
        sourceType: content.type,
        sourceNumber: content.number,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    // Fallback: create a simple script if parsing fails
    console.error('Failed to parse GPT response, using fallback script:', error);
    return createFallbackScript(content);
  }
}

/**
 * Create a simple fallback script if GPT parsing fails
 */
function createFallbackScript(content: IssueContent | PRContent): VideoScript {
  const sections: ScriptSection[] = [
    {
      type: 'intro',
      heading: 'Introduction',
      narration: `Welcome! Today we're looking at ${content.type === 'pr' ? 'Pull Request' : 'Issue'} number ${content.number}: ${content.title}`,
      visualNotes: 'Show title slide with issue/PR number',
      duration: 15,
    },
    {
      type: 'main',
      heading: 'Overview',
      narration: content.body.substring(0, 500) + '...',
      visualNotes: 'Show main content as bullet points',
      duration: 120,
      bulletPoints: content.body.split('\n').filter(l => l.trim()).slice(0, 5),
    },
    {
      type: 'summary',
      heading: 'Summary',
      narration: `That's a quick overview of ${content.title}. Check out the full details in the description below.`,
      visualNotes: 'Show summary slide',
      duration: 30,
    },
  ];

  return {
    title: content.title,
    description: `Video generated from GitHub ${content.type} #${content.number}`,
    sections,
    estimatedDuration: sections.reduce((sum, s) => sum + s.duration, 0),
    metadata: {
      sourceType: content.type,
      sourceNumber: content.number,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Validate script duration and adjust if needed
 */
export function validateAndAdjustScript(
  script: VideoScript,
  maxDuration: number = 600
): VideoScript {
  if (script.estimatedDuration <= maxDuration) {
    return script;
  }

  // Trim sections proportionally
  const ratio = maxDuration / script.estimatedDuration;
  const adjustedSections = script.sections.map(section => ({
    ...section,
    duration: Math.floor(section.duration * ratio),
  }));

  return {
    ...script,
    sections: adjustedSections,
    estimatedDuration: adjustedSections.reduce((sum, s) => sum + s.duration, 0),
  };
}
