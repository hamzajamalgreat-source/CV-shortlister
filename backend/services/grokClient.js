const axios = require("axios");

const GROK_API_KEY = process.env.GROQ_API_KEY;
const GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function extractProfile(cvText) {
  if (!GROK_API_KEY) {
    throw new Error("GROQ_API_KEY not set");
  }

  const prompt = `Extract candidate information from this CV. Return ONLY valid JSON with this exact structure:
{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "skills": ["skill1", "skill2", ...],
  "experience_years": number,
  "education": "High School|Bachelor|Master|PhD",
  "projects": ["project1", "project2", ...]
}

CV Text:
${cvText}

Return ONLY the JSON object, no other text.`;

  try {
    const response = await axios.post(
      GROK_API_URL,
      {
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: "You are a CV parser. Extract information and return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error("Grok extraction error:", error.message);
    throw error;
  }
}

module.exports = { extractProfile };
