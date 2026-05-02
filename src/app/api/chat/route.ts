import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the AI securely using the key in your .env.local file
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // Receive the prompt from the frontend dashboard
    const { prompt } = await req.json();

    // Call the Gemini 2.5 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Send the AI's text response back to the frontend
    return NextResponse.json({ reply: response.text });
    
  } catch (error) {
    console.error("AI Connection Error:", error);
    return NextResponse.json(
      { reply: "Error connecting to the AI brain. Please check your API key." },
      { status: 500 }
    );
  }
}