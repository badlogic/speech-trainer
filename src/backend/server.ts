import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
   res.json({ status: "healthy" });
});

app.post("/api/generate-words", async (req, res) => {
   try {
      const { theme, sound, count = 10 } = req.body;

      if (!theme || !sound) {
         return res.status(400).json({ error: "Theme and sound are required" });
      }

      const soundDescriptions: Record<string, string> = {
         S: "S sound (like snake)",
         T: "T sound (like tap)",
         P: "P sound (like pop)",
         K: "K sound (like cat)",
         W: "W sound (like water)",
      };

      const prompt = `Generate exactly ${count} simple words for children learning the ${soundDescriptions[sound] || sound}, themed around ${theme}.

Respond with ONLY a JSON array in this EXACT format:
[{"word": "example", "emoji": "🌟"}, {"word": "another", "emoji": "✨"}]

Rules:
- Return ONLY the JSON array, no other text
- Each object must have exactly "word" and "emoji" keys
- Include exactly ${count} words
- Words must contain the ${sound} sound
- Use simple words for ages 4-8
- No markdown, no code blocks, no backticks
- Start with [ and end with ]`;

      const response = await openai.chat.completions.create({
         model: "gpt-4o-2024-08-06",
         messages: [
            {
               role: "system",
               content:
                  "You are a JSON API that only responds with raw JSON arrays. Never include markdown formatting, code blocks, or any text outside the JSON. Never wrap responses in backticks or include any explanation.",
            },
            {
               role: "user",
               content: prompt,
            },
         ],
         temperature: 0.7,
         max_tokens: 200,
      });
      const content = response.choices[0].message.content;
      if (!content) {
         throw new Error("No content in OpenAI response");
      }

      // Remove markdown code blocks if present
      const cleanContent = content
         .replace(/```json\s*\n?/g, "")
         .replace(/```\s*$/g, "")
         .trim();

      // Parse the response - it might be wrapped in an object or just an array
      const parsed = JSON.parse(cleanContent);
      const words = Array.isArray(parsed) ? parsed : parsed.words || [];

      res.json({ words });
   } catch (error) {
      console.error("Error generating words:", error);
      res.status(500).json({ error: "Failed to generate words" });
   }
});

app.post("/api/generate-image", async (req, res) => {
   try {
      const { word } = req.body;

      if (!word) {
         return res.status(400).json({ error: "Word is required" });
      }

      const response = await openai.images.generate({
         model: "dall-e-2",
         prompt: `Simple, colorful, child-friendly cartoon illustration of "${word}"`,
         size: "512x512",
         n: 1,
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
         throw new Error("No image URL in OpenAI response");
      }

      // Set cache headers to prevent re-fetching
      res.set("Cache-Control", "public, max-age=3600");
      res.json({ imageUrl });
   } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
   }
});

app.listen(port, () => {
   console.log(`Backend server running on port ${port}`);
});
