// Supabase Edge Function: translate
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageBase64, text, targetLang = "ko" } = await req.json();

    let extractedText = text || "";
    const googleVisionKey = Deno.env.get("GOOGLE_VISION_API_KEY");
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

    // 1. OCR if imageBase64 is provided and text is empty
    if (imageBase64 && !extractedText) {
      if (googleVisionKey) {
        const visionResp = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requests: [
                {
                  image: { content: imageBase64 },
                  features: [{ type: "TEXT_DETECTION" }],
                },
              ],
            }),
          }
        );
        const visionData = await visionResp.json();
        extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || "";
      } else {
        // Fallback for testing/mock if Vision API key not set
        extractedText = "[OCR Demo Text] 초등 국어 교과서 5학년 1학기 지문 예시입니다.";
      }
    }

    // 2. Translate text to targetLang using OpenAI
    let translatedText = "";
    if (openAiApiKey && extractedText) {
      const openAiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert educational translator. Translate the text into language code '${targetLang}'. Retain simple, friendly tone suitable for elementary school students. Output only the translated text.`,
            },
            {
              role: "user",
              content: extractedText,
            },
          ],
        }),
      });
      const openAiData = await openAiResp.json();
      translatedText = openAiData.choices?.[0]?.message?.content?.trim() || "";
    } else {
      // Mock fallback if OpenAI key not set
      translatedText = `[${targetLang} 번역 결과] ${extractedText}`;
    }

    return new Response(
      JSON.stringify({
        sourceText: extractedText,
        resultText: translatedText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
