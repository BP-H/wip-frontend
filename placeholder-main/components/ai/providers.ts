// ai/providers.ts
export type GenParams = { prompt: string; model?: string };
export interface Provider {
  name: string;
  supportsImages?: boolean;
  generate(params: GenParams, opt: { apiKey?: string }): Promise<string>;
}

export const registry: Record<string, Provider> = {
  openai: {
    name: 'OpenAI',
    async generate({ prompt, model = 'gpt-4o-mini' }, { apiKey }) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
      });
      if (!r.ok) {
        throw new Error(`OpenAI error ${r.status}: ${await r.text()}`);
      }
      const j = await r.json();
      return j?.choices?.[0]?.message?.content ?? '';
    }
  },
  // add: higgsfield, local LLMs, etc. behind the same interface
};
