import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const MOCK_MODE = !API_KEY || process.env.AI_MOCK_MODE === 'true';

let genAI;
if (!MOCK_MODE) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * Generates personalized project feedback using AI
 * @param {Object} projectData 
 * @param {Array} criteriaScores - Array of { name, score, comment }
 */
export const generateFeedback = async (projectData, criteriaScores) => {
  if (MOCK_MODE) {
    console.log('🤖 AI Mock Mode: Generating simulated feedback...');
    return generateMockFeedback(projectData, criteriaScores);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are an expert academic evaluator. Provide a concise, professional, and encouraging feedback summary for a student's final year project based on their rubric scores.
    
    Project Title: "${projectData.title}"
    Student: "${projectData.student?.name || 'the student'}"
    Category: "${projectData.category}"
    
    Rubric Scores:
    ${criteriaScores.map(s => `- ${s.name}: ${s.score}/100${s.comment ? ` (Note: ${s.comment})` : ' (No specific comment provided)'}`).join('\n')}
    
    Guidelines:
    - Address the student by name.
    - Highlight the area with the highest score as a strength.
    - Provide actionable advice for the area with the lowest score.
    - Keep the tone professional but supportive.
    - Max 4-5 sentences.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Service Error:', error);
    return "An error occurred while generating AI feedback. Here is a manual summary: Your project shows potential. Focus on refining the technical execution and documentation depth.";
  }
};

/**
 * Simulated AI response for development/testing
 */
function generateMockFeedback(projectData, criteriaScores) {
  const avg = criteriaScores.reduce((acc, c) => acc + c.score, 0) / criteriaScores.length;
  const topCriterion = [...criteriaScores].sort((a, b) => b.score - a.score)[0];
  const lowCriterion = [...criteriaScores].sort((a, b) => a.score - b.score)[0];

  return `[AI GEN (MOCK)] Dr. Jenkins, here is a breakdown for ${projectData.title}. The student, ${projectData.student?.name || 'James'}, has demonstrated strong proficiency in ${topCriterion.name}, which is evident in the project architecture. However, there is significant room for growth in ${lowCriterion.name}. For future iterations, I recommend focusing on unit test coverage and deeper documentation of the edge cases. Overall, a solid performance (Average: ${avg.toFixed(1)}%).`;
}
