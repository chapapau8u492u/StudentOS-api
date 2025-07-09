
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API key - in production, use environment variables
const GEMINI_API_KEY = 'AIzaSyBdmJafDA7pVwj7cshLLi1PMfzsuxxkoy8';

// AI Generation endpoint
app.post('/api/ai/generate-summary', async (req, res) => {
  try {
    const { fullName, jobTitle } = req.body;
    
    if (!fullName || !jobTitle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fullName and jobTitle'
      });
    }

    const prompt = `Create a professional resume summary for ${fullName} who works as a ${jobTitle}. 

Requirements:
- Write 3-4 crisp bullet points highlighting key strengths and achievements
- Each point should be concise and impactful (max 15-20 words)
- Focus on quantifiable achievements and core competencies
- Use action words and avoid generic phrases
- Format as bullet points with • symbol
- Make it compelling for hiring managers

Example format:
• Experienced [role] with X+ years expertise in [key skills] and [specialization]
• Proven track record of [specific achievement] resulting in [quantifiable result]
• Strong background in [core competency] with focus on [value proposition]
• Skilled in [technical/soft skills] with ability to [key strength]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const generatedSummary = data.candidates[0].content.parts[0].text.trim();
      res.json({
        success: true,
        summary: generatedSummary
      });
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// AI Experience Description endpoint
app.post('/api/ai/generate-experience', async (req, res) => {
  try {
    const { jobTitle, company } = req.body;
    
    if (!jobTitle || !company) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: jobTitle and company'
      });
    }

    const prompt = `Write professional bullet points for a ${jobTitle} role at ${company}. 

Requirements:
- Create 4-5 impactful bullet points
- Start each point with strong action verbs (Led, Managed, Developed, Implemented, etc.)
- Include quantifiable results wherever possible (percentages, numbers, metrics)
- Focus on achievements and impact, not just responsibilities
- Keep each bullet concise but specific (15-25 words max)
- Format with • symbol
- Make it compelling for hiring managers

Example format:
• Led [specific project/team] resulting in [quantifiable outcome] within [timeframe]
• Developed [solution/process] that improved [metric] by [percentage/amount]
• Managed [responsibility] while maintaining [quality standard] and achieving [result]
• Collaborated with [stakeholders] to deliver [outcome] exceeding [benchmark] by [amount]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const generatedDescription = data.candidates[0].content.parts[0].text.trim();
      res.json({
        success: true,
        description: generatedDescription
      });
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate experience description',
      details: error.message
    });
  }
});

// AI Template Generation endpoint
app.post('/api/ai/generate-template', async (req, res) => {
  try {
    const { prompt: userPrompt } = req.body;
    
    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt'
      });
    }

    const prompt = `You are an expert web developer and resume template designer. Create a professional resume template based on this request: "${userPrompt}". 

Please provide:
1. HTML structure using Handlebars syntax for dynamic content (use variables like {{fullName}}, {{email}}, {{phone}}, {{experiences}}, {{skills}}, etc.)
2. Professional CSS styling that is modern and responsive
3. Brief description of the template

Requirements:
- Use Handlebars helpers: {{#if}}, {{#each}}, {{formatDate}}, {{#if_has_photo}}
- Make it responsive and accessible
- Use modern design principles
- Include proper styling for print media
- Support profile photos conditionally

Format your response exactly like this:
DESCRIPTION: [Brief description]
HTML: [Complete HTML code with Handlebars]
CSS: [Complete CSS code]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const content = data.candidates[0].content.parts[0].text;
      
      // Parse the AI response
      const descriptionMatch = content.match(/DESCRIPTION: (.*?)(?=HTML:|$)/s);
      const htmlMatch = content.match(/HTML: (.*?)(?=CSS:|$)/s);
      const cssMatch = content.match(/CSS: (.*?)$/s);
      
      if (htmlMatch && cssMatch) {
        res.json({
          success: true,
          template: {
            description: descriptionMatch ? descriptionMatch[1].trim() : 'AI generated resume template',
            html: htmlMatch[1].trim(),
            css: cssMatch[1].trim()
          }
        });
      } else {
        throw new Error('Failed to parse AI response');
      }
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate template',
      details: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AI API'
  });
});

app.listen(PORT, () => {
  console.log(`AI API server running on port ${PORT}`);
});
