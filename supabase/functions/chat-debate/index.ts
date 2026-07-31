// Supabase Edge Function: chat-debate (Textbook Grounded AI Debate Partner)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample Textbook RAG passages for debate topics
const TEXTBOOK_DEBATE_GROUNDING: Record<string, { passage: string; sources: string[] }> = {
  default: {
    passage: `초등 6학년 1학기 국어 1단원 (비판적 사고와 토론): 
"토론을 할 때에는 상대방의 의견을 존중하며, 교과서 및 신뢰할 수 있는 자료를 바탕으로 근거를 제시해야 합니다. 올바른 토론 태도는 상대방의 주장을 끝까지 듣고, 객관적인 사실과 예시를 들어 자신의 주장을 펼치는 것입니다."`,
    sources: ["국어 6-1 가 1단원 (비판적 사고와 토론) 2문단"],
  },
  smartphone: {
    passage: `초등 5학년 2학기 국어 4단원 (매체와 표현): 
"스마트폰은 학습 자료 검색 및 긴급 연락에 유용하지만, 수업 시간 중 지나친 사용은 집중력을 떨어뜨리고 친구들과의 직접적인 소통을 방해할 수 있습니다. 따라서 올바른 사용 규칙(약속)을 정하고 실천하는 것이 필요합니다."`,
    sources: ["국어 5-2 4단원 (매체와 표현) 3문단"],
  },
  environment: {
    passage: `초등 6학년 2학기 사회 2단원 (지구촌 환경 문제): 
"일회용품 사용 증가는 해양 쓰레기 및 환경 오염의 주요 원인입니다. 환경을 보호하기 위해 개인 텀블러 사용, 분리배출 생활화, 일회용품 줄이기 운동에 적극 참여해야 합니다."`,
    sources: ["사회 6-2 2단원 (환경 문제) 4문단"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic, message, userLang = "ko", history = [], textbookId } = await req.json();
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

    // Retrieve Grounding passage
    let grounding = TEXTBOOK_DEBATE_GROUNDING.default;
    if (topic && topic.includes("스마트폰")) {
      grounding = TEXTBOOK_DEBATE_GROUNDING.smartphone;
    } else if (topic && (topic.includes("환경") || topic.includes("일회용품"))) {
      grounding = TEXTBOOK_DEBATE_GROUNDING.environment;
    }

    let replyKo = "";
    let replyUser = "";
    const sources = grounding.sources;

    if (openAiApiKey) {
      const messages = [
        {
          role: "system",
          content: `You are '민준', a friendly 6th-grade Korean elementary school student engaged in a debate on '${topic}'.
You have learned from the Korean textbook:
[TEXTBOOK GROUNDING PASSAGE]:
${grounding.passage}

INSTRUCTIONS:
1. Speak as a friendly, polite Korean elementary student ('민준').
2. Actively cite ideas and facts from the Korean textbook passage above to ground your debate arguments.
3. Keep your tone encouraging, respectful, and educational.`,
        },
        ...history,
        { role: "user", content: message },
      ];

      const openAiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
        }),
      });
      const data = await openAiResp.json();
      replyKo = data.choices?.[0]?.message?.content?.trim() || "";

      if (userLang !== "ko") {
        const transResp = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: `Translate the Korean debate message into language code '${userLang}' for an elementary student.`,
              },
              { role: "user", content: replyKo },
            ],
          }),
        });
        const transData = await transResp.json();
        replyUser = transData.choices?.[0]?.message?.content?.trim() || replyKo;
      } else {
        replyUser = replyKo;
      }
    } else {
      replyKo = `좋은 생각이야! 국어 교과서 지문(${grounding.sources[0]})에서도 언급했듯이, 주제 '${topic}'에 대해 올바른 규칙과 근거를 바탕으로 토론하는 것이 중요해. 너는 어떻게 생각해?`;
      replyUser = userLang === "ko" ? replyKo : `[${userLang} 번역] ${replyKo}`;
    }

    return new Response(
      JSON.stringify({
        replyKo,
        replyUser,
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
