export async function callGeminiJson({ system = "", prompt, schemaHint = "" })
  {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }

    const response = await fetch(

      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
      +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${system}\n\nReturn valid JSON only.
              \n\n${schemaHint}\n\n${prompt}` }]
            }
          ],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned no text");
    }

    return JSON.parse(text);
  }

  export function getFounderPersonaContext(context = {}) {
    return context.founderVoiceSample
      ? `Founder voice sample: ${context.founderVoiceSample}`
      : "Founder voice: concise, specific, confident, and plainspoken.";
  }

  export async function generateSocialAssetImage(_assetText) {
    return null;
  }
