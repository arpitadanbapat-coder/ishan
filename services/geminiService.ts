import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, ResearchLevel, Role, GroundingSource, MemoryItem } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Helper to sanitize internal message structure to API format
const formatHistory = (history: Message[]) => {
  return history.map(msg => {
    // If the message contains an image, we need to send multipart content
    if (msg.image) {
      const parts: any[] = [{ text: msg.text }];
      // Extract base64 data (remove "data:image/jpeg;base64," prefix)
      const matches = msg.image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
      return {
        role: msg.role,
        parts: parts
      };
    }
    // Default text-only message
    return {
      role: msg.role,
      parts: [{ text: msg.text }]
    };
  });
};

interface StreamResponse {
  text: string;
  sources: GroundingSource[];
}

export const streamGeminiResponse = async (
  prompt: string,
  history: Message[],
  level: ResearchLevel,
  onChunk: (text: string) => void,
  onComplete: (fullText: string, sources: GroundingSource[]) => void,
  customInstruction?: string,
  memories?: MemoryItem[],
  image?: string // Optional base64 image for the current turn
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let modelName = 'gemini-2.5-flash';
    let tools: any[] = [];
    let thinkingConfig: any = undefined;

    switch (level) {
      case ResearchLevel.QUICK:
        modelName = 'gemini-2.5-flash';
        break;
      case ResearchLevel.MODERATE:
        modelName = 'gemini-2.5-flash';
        tools = [{ googleSearch: {} }];
        break;
      case ResearchLevel.DEEP:
        // Using Pro for deeper reasoning + search
        modelName = 'gemini-3-pro-preview'; 
        tools = [{ googleSearch: {} }];
        thinkingConfig = { thinkingBudget: 4096 }; // Reserve tokens for thinking
        break;
    }

    // Format memories for injection
    let memoryBlock = "";
    if (memories && memories.length > 0) {
      memoryBlock = `\n\n[NEURAL_CORE_DATA (LEARNED MEMORY)]\nThe following facts have been permanently learned from the user and must override default knowledge:\n${memories.map(m => `- ${m.fact}`).join('\n')}\n[END NEURAL_CORE_DATA]`;
    }

    // Combine base instruction with memory and user custom instruction
    let finalSystemInstruction = SYSTEM_INSTRUCTION + memoryBlock;
    
    if (customInstruction && customInstruction.trim() !== '') {
      finalSystemInstruction += `\n\n[USER CUSTOM PERSONA/INSTRUCTION START]\n${customInstruction}\n[USER CUSTOM PERSONA/INSTRUCTION END]`;
    }

    // Initialize chat with history
    const chat = ai.chats.create({
      model: modelName,
      history: formatHistory(history),
      config: {
        systemInstruction: finalSystemInstruction,
        tools: tools.length > 0 ? tools : undefined,
        thinkingConfig: thinkingConfig,
      }
    });

    // Prepare message payload (text or text + image)
    let messagePayload: any = { text: prompt };
    
    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
         messagePayload = {
           parts: [
             { text: prompt },
             { inlineData: { mimeType: matches[1], data: matches[2] } }
           ]
         };
      }
    }

    const resultStream = await chat.sendMessageStream({ message: messagePayload });
    
    let fullText = "";
    let aggregatedSources: GroundingSource[] = [];

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      
      // Extract text
      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }

      // Extract Grounding Metadata (Sources)
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            // Fallback for title if missing (e.g. just use domain)
            const uri = chunk.web.uri;
            let title = chunk.web.title;
            if (!title) {
               try {
                  title = new URL(uri).hostname;
               } catch (e) {
                  title = "External Source";
               }
            }

            aggregatedSources.push({
              uri: uri,
              title: title
            });
          }
        });
      }
    }

    // Remove duplicates from sources
    const uniqueSources = aggregatedSources.filter((source, index, self) =>
      index === self.findIndex((t) => (
        t.uri === source.uri
      ))
    );

    onComplete(fullText, uniqueSources);

  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("Error: Unable to connect to Veritas Intelligence Network. Please check your connection or API limit.");
    onComplete("Error encountered.", []);
  }
};