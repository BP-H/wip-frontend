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
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
      });
      const j = await r.json();
      return j?.choices?.[0]?.message?.content ?? '';
    }
  },
  // add: higgsfield, local LLMs, etc. behind the same interface
};
