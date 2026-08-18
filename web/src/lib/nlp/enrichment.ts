import { z } from 'zod';

// Minimal required schema for the LLM output
const EnrichmentOutputSchema = z.object({
  items: z.array(
    z.object({
      term: z.string(),
      translation: z.string(),
      context: z.object({
        translation: z.string()
      })
    })
  )
});

export async function enrichWithAI(jobId: string, supabase: any, apiKeys: any[]) {
  try {
    // 1. Fetch the job to get current extracted_items
    const { data: job, error: jobError } = await supabase
      .from('document_jobs')
      .select('result_summary')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error(`enrichWithAI: Job ${jobId} not found`);
      return;
    }

    const resultSummary = job.result_summary || {};
    const extractedItems = resultSummary.extracted_items || [];
    
    // Filter items that need enrichment
    const pendingItems = extractedItems.filter((item: any) => item.enrichment_status === 'pending');
    if (pendingItems.length === 0) return; // Nothing to enrich

    // Pre-filter: optionally, we only enrich grammar items or hard words (e.g., C1/C2) to save tokens
    // But for MVP, let's try to enrich all pending items.
    
    const availableKeys = Array.isArray(apiKeys) ? apiKeys.filter(k => k.status === 'HEALTHY' || k.status === 'ACTIVE' || !k.status).map(k => k.key) : [];
    if (availableKeys.length === 0) {
      console.warn("No healthy API keys available for AI Enrichment");
      return;
    }

    const systemPrompt = `You are an expert bilingual linguist (English-Vietnamese).
Your task is to enrich a pre-extracted list of English vocabulary and grammar items based on their exact context.
For each item in the input list, provide a highly accurate, context-specific Vietnamese translation for both the term and its original sentence.

OUTPUT FORMAT:
Return ONLY a JSON object with an "items" array. Each item must exactly match the "term" of the input, and provide the enriched "translation" and "context.translation".
Example:
{
  "items": [
    {
      "term": "outsource",
      "translation": "thuê ngoài",
      "context": {
        "translation": "Quyết định thuê ngoài khâu sản xuất của công ty đã vấp phải..."
      }
    }
  ]
}
Do not return Markdown code fences (\`\`\`json). Return raw JSON.`;

    // Construct user prompt with pending items
    const userPrompt = `Please enrich these items:
${JSON.stringify(pendingItems.map((i: any) => ({
  term: i.term,
  context: i.context.original,
  entryType: i.entryType
})), null, 2)}`;

    let chunkSuccess = false;
    let enrichedMap = new Map();

    for (let keyIdx = 0; keyIdx < availableKeys.length; keyIdx++) {
      if (chunkSuccess) break;
      const currentKey = availableKeys[keyIdx];
      let retryCount = 0;
      
      while (retryCount < 2 && !chunkSuccess) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${currentKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: { 
                temperature: 0.1,
                responseMimeType: "application/json"
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              const cleanContent = rawContent.replace(/^```(?:json)?/im, '').replace(/```$/im, '').trim();
              const parsed = JSON.parse(cleanContent);
              const validated = EnrichmentOutputSchema.parse(parsed);
              
              // Build a map for easy updating
              validated.items.forEach(item => {
                enrichedMap.set(item.term.toLowerCase(), item);
              });
              chunkSuccess = true;
            }
          } else {
             break; // key failed, move to next key
          }
        } catch (err) {
          retryCount++;
        }
      }
    }

    if (chunkSuccess) {
      // Merge results
      const updatedItems = extractedItems.map((item: any) => {
        if (item.enrichment_status === 'pending') {
          const enriched = enrichedMap.get(item.term.toLowerCase());
          if (enriched) {
            return {
              ...item,
              translation: enriched.translation,
              context: {
                ...item.context,
                translation: enriched.context.translation
              },
              enrichment_status: 'done'
            };
          }
        }
        return item;
      });

      resultSummary.extracted_items = updatedItems;
      
      // Update DB
      await supabase
        .from('document_jobs')
        .update({ result_summary: resultSummary })
        .eq('id', jobId);
    }
  } catch (err) {
    console.error(`enrichWithAI Error for job ${jobId}:`, err);
  }
}
