import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment variables. AI features will not work.");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey || "dummy-key");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async analyzeLog(logContent: string): Promise<string> {
    try {
      const prompt = `
        You are an IT system log analyzer. Analyze the following log content and identify any issues, anomalies, or potential problems.
        Be specific about what you find and provide suggestions for fixing any problems.
        Focus on critical errors, warnings, suspicious activities, resource issues (CPU, memory, disk space), and security concerns.
        
        Log content:
        ${logContent}
        
        Provide a concise analysis focusing on the most important findings first.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error calling Gemini API for log analysis:", error);
      throw new Error("Failed to analyze log with Gemini API");
    }
  }

  async getChatResponse(userMessage: string): Promise<string> {
    try {
      const prompt = `
        You are an IT support assistant chatbot. Respond to the following user query with helpful information.
        Be concise but thorough, and provide step-by-step guidance when appropriate for troubleshooting or how-to questions.
        If you need more information to provide a complete answer, ask for it.
        If the query is outside your knowledge area, politely suggest creating a support ticket instead.
        
        User query: ${userMessage}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error calling Gemini API for chat response:", error);
      throw new Error("Failed to get chat response from Gemini API");
    }
  }
}
