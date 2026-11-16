import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServerClient } from "../src/lib/supabase";
import { extractProfile } from "../src/lib/grokClient";

async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err) {
      return "";
    }
  } else if (ext === "docx") {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err) {
      return "";
    }
  }

  return "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const supabase = createServerClient(token);

    const { data: user, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const formData = req.body;
    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ error: "No file provided" });
    }

    const fileBuffer = Buffer.isBuffer(formData.file) ? formData.file : Buffer.from(formData.file || "");
    const filename = formData.filename || "document";

    const text = await extractTextFromFile(fileBuffer, filename);
    if (!text) {
      return res.status(422).json({ error: "Failed to extract text" });
    }

    const extractedData = (await extractProfile(text)) as any;

    const criteria = {
      title: extractedData?.name || "Untitled Job",
      description: text.slice(0, 500),
      requiredSkills: extractedData?.skills || [],
      preferredSkills: [],
      minExperienceYears: 0,
      educationRequirement: "None" as const,
      weights: { skills: 25, experience: 25, projects: 25, education: 25 },
    };

    return res.status(200).json({ criteria });
  } catch (err: any) {
    console.error("Error processing job:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
