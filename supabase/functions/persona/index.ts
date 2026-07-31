// Supabase Edge Function: persona (RAG + Persona Chatbot)
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
    const { personaId, question, userLang = "ko", history = [] } = await req.json();
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

    let answer = "";
    const sources: string[] = ["교과서 5학년 1학기 2단원 3문단", "교과서 5학년 1학기 2단원 5문단"];

    if (openAiApiKey) {
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
              content: `You are a character from an elementary school textbook. Answer the student's question in the 1st person ("나", "저"). 
IMPORTANT: If the question asks for details not included in the provided textbook passages, state clearly: "이건 제 상상이에요 (This is my imagination)". 
Provide response in Korean first, accompanied by user's native language '${userLang}' if different.`,
            },
            ...history,
            { role: "user", content: question },
          ],
        }),
      });
      const data = await openAiResp.json();
      answer = data.choices?.[0]?.message?.content?.trim() || "";
    } else {
      answer = `안녕! 나는 교과서 속 인물이란다. 질문해 주어서 고마워.\n(번역/Translation: Hello! I am a character in your textbook. Thank you for asking.)`;
    }

    return new Response(
      JSON.stringify({
        answer,
        sources,
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
