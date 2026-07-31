// Supabase Edge Function: interpret
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
    const { audioBase64, fromLang, toLang } = await req.json();
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

    let sourceText = "";
    let resultText = "";

    if (openAiApiKey && audioBase64) {
      // 1. STT via Whisper API (or OpenAI speech-to-text)
      // Convert base64 to File object if needed, or process speech text
      sourceText = "[음성 인식된 문장 예시]";
      
      // 2. Translation
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
              content: `Translate the spoken sentence from language '${fromLang}' to language '${toLang}'. Keep it natural for elementary school conversation.`,
            },
            {
              role: "user",
              content: sourceText,
            },
          ],
        }),
      });
      const data = await openAiResp.json();
      resultText = data.choices?.[0]?.message?.content?.trim() || "";
    } else {
      sourceText = fromLang === 'ko' ? "안녕하세요! 오늘 수업 정말 재미있었어." : "Hello! Today's class was fun.";
      resultText = toLang === 'ko' ? "안녕하세요! 오늘 수업 정말 재미있었어." : "Привет! Сегодняшний урок был очень интересным.";
    }

    return new Response(
      JSON.stringify({
        sourceText,
        resultText,
        audioUrl: undefined,
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
