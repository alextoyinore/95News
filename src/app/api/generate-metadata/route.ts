import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { title, content, type } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";
        if (type === "tags") {
            prompt = `As an expert SEO editor for a high-traffic news magazine (95News), generate exactly 5-8 relevant, trending tags for an article with the following details. 
            Title: "${title}"
            Content Summary: ${content.substring(0, 2000)}
            
            Return ONLY a comma-separated list of tags, no hashtags, no introductory text.`;
        } else if (type === "focusKeyword") {
            prompt = `Generate one high-performance focus keyword (2-4 words) for SEO based on this article.
            Title: "${title}"
            Content Summary: ${content.substring(0, 1000)}
            
            Return ONLY the keyword, no quotes, no labels.`;
        } else if (type === "metaDescription") {
            prompt = `Write a compelling, click-worthy SEO meta description (max 155 characters) for this news article.
            Title: "${title}"
            Content Summary: ${content.substring(0, 2000)}
            
            Return ONLY the description text.`;
        } else if (type === "all") {
            prompt = `As an expert SEO editor for 95News, generate metadata for this article.
            Title: "${title}"
            Content Summary: ${content.substring(0, 2000)}
            
            Return a JSON object with exactly these fields:
            {
              "tags": ["tag1", "tag2", ...],
              "focusKeyword": "string",
              "metaDescription": "string"
            }
            Return ONLY the raw JSON.`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Handle JSON parsing if type is "all"
        if (type === "all") {
            try {
                // Remove markdown code blocks if present
                const jsonText = text.replace(/```json\n?|\n?```/g, '');
                const parsed = JSON.parse(jsonText);
                return NextResponse.json(parsed);
            } catch (e) {
                console.error("AI JSON Parse Error:", e, text);
                return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
            }
        }

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate metadata" }, { status: 500 });
    }
}
