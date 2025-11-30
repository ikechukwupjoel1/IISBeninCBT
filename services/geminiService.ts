import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateQuestions = async (topic: string, count: number, difficulty: string): Promise<Question[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, returning mock data fallback or empty.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} ${difficulty} difficulty multiple-choice questions about "${topic}" for a high school level exam.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The question text" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 4 possible answers"
              },
              correctAnswer: { type: Type.STRING, description: "The exact string of the correct answer from the options" },
              explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" }
            },
            required: ["text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const rawData = response.text ? JSON.parse(response.text) : [];

    // Map to our internal Question type
    return rawData.map((q: any, index: number) => ({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: q.text,
      type: QuestionType.MULTIPLE_CHOICE,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: 2, // Default points
      explanation: q.explanation
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw error;
  }
};

export const explainPerformance = async (score: number, total: number, topic: string): Promise<string> => {
  if (!apiKey) return "Great job completing the exam! (AI feedback unavailable)";

  try {
    // Create a timeout promise that resolves to a fallback message after 3 seconds
    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("Great job! (AI feedback timed out)"), 3000);
    });

    const aiPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `A student scored ${score} out of ${total} on a ${topic} exam. Provide a 2-sentence encouraging remark and a brief study tip based on this performance. Address the student directly.`
    }).then(response => response.text || "Keep up the good work!");

    // Race the AI request against the timeout
    return await Promise.race([aiPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Assessment complete.";
  }
};