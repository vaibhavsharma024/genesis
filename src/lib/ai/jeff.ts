/**
 * JEFF AI Model Client
 * Modular AI client supporting JEFF API / custom endpoints and Google Gemini fallback.
 * Configurable entirely via environment variables without hard-coded responses.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface JeffCallOptions {
  systemPrompt: string;
  history?: ChatHistoryMessage[];
  message: string;
  temperature?: number;
}

export interface JeffCallResult {
  reply: string;
  sources?: string[];
  modelUsed: string;
}

/**
 * Call the JEFF AI Model dynamically.
 * Uses the JEFF configuration from the environment (JEFF_API_KEY, JEFF_API_URL, JEFF_MODEL).
 * Does not invent endpoints or fallback models.
 */
export async function callJeffAI(options: JeffCallOptions): Promise<JeffCallResult> {
  const { systemPrompt, history = [], message, temperature = 0.2 } = options;

  const jeffApiKey = process.env.JEFF_API_KEY?.trim();
  const jeffModel = process.env.JEFF_MODEL?.trim() || 'jeff-1';
  const jeffApiUrl = process.env.JEFF_API_URL?.trim();

  // Validate required JEFF configuration
  const missingConfigs: string[] = [];
  if (!jeffApiKey || jeffApiKey.includes('your_jeff_api_key')) {
    missingConfigs.push('JEFF_API_KEY');
  }
  if (!jeffApiUrl || jeffApiUrl.includes('example.com')) {
    missingConfigs.push('JEFF_API_URL');
  }

  if (missingConfigs.length > 0) {
    const failureMsg = `Missing JEFF AI configuration: ${missingConfigs.join(', ')} is not configured in .env.local.`;
    console.error('[JEFF AI] exact failure reason:', failureMsg);
    throw new Error(failureMsg);
  }

  // JEFF request started
  const endpoint = jeffApiUrl!.endsWith('/') ? jeffApiUrl!.slice(0, -1) : jeffApiUrl!;
  const targetUrl = endpoint.includes('/chat')
    ? endpoint
    : `${endpoint}/chat/completions`;

  console.log('[JEFF AI] JEFF request started:', {
    targetUrl,
    model: jeffModel,
    hasApiKey: Boolean(jeffApiKey),
    apiKeyPrefix: jeffApiKey ? `${jeffApiKey.slice(0, 3)}...` : 'none',
    historyCount: history.length,
    messageLength: message.length,
    timestamp: new Date().toISOString(),
  });

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jeffApiKey}`,
      },
      body: JSON.stringify({
        model: jeffModel,
        messages: formattedMessages,
        temperature,
      }),
    });
  } catch (netErr: unknown) {
    const netErrMsg = netErr instanceof Error ? netErr.message : String(netErr);
    console.error('[JEFF AI] exact failure reason: Network/fetch failed:', netErrMsg);
    throw new Error(`Failed to connect to JEFF API at ${targetUrl}: ${netErrMsg}`);
  }

  // HTTP status returned by JEFF
  console.log('[JEFF AI] HTTP status returned by JEFF:', response.status, response.statusText);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const failReason = `JEFF API request failed with HTTP ${response.status}: ${errText.slice(0, 300)}`;
    console.error('[JEFF AI] exact failure reason:', failReason);
    throw new Error(failReason);
  }

  // Response parsing result
  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch (jsonErr: unknown) {
    const jsonErrMsg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
    console.error('[JEFF AI] response parsing result: Invalid JSON returned by JEFF:', jsonErrMsg);
    throw new Error(`JEFF API returned invalid JSON: ${jsonErrMsg}`);
  }

  const choices = Array.isArray(data.choices) ? data.choices : [];
  const firstChoice = choices[0] as { message?: { content?: string } } | undefined;
  const replyText =
    (typeof firstChoice?.message?.content === 'string' && firstChoice.message.content) ||
    (typeof data.reply === 'string' && data.reply) ||
    (typeof data.response === 'string' && data.response) ||
    (typeof data.text === 'string' && data.text) ||
    '';

  console.log('[JEFF AI] response parsing result:', {
    hasChoices: choices.length > 0,
    hasContent: Boolean(replyText),
    replyLength: replyText.length,
    keysInResponse: Object.keys(data),
  });

  if (!replyText.trim()) {
    const emptyErr = 'JEFF API returned an empty or unparseable response payload.';
    console.error('[JEFF AI] exact failure reason:', emptyErr, data);
    throw new Error(emptyErr);
  }

  return {
    reply: replyText.trim(),
    modelUsed: `JEFF (${jeffModel})`,
  };
}
