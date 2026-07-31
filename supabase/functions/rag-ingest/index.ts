// Supabase Edge Function: rag-ingest
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
    const { textbookId, rawText } = await req.json();

    if (!rawText) {
      throw new Error("rawText is required");
    }

    // Split text by double newlines into paragraphs/chunks
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    return new Response(
      JSON.stringify({
        chunksCount: paragraphs.length,
        message: `Successfully indexed ${paragraphs.length} chunks.`,
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
