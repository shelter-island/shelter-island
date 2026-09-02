import OpenAI from 'openai';
import { createTheSunPrompt } from '../data/theSunPersona.js';

const THE_SUN_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 800;
const MAX_OUTPUT_TOKENS = 220;

const json = (res, status, body) => {
  res.status(status).json(body);
};

const parseBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return req.body;
};

const cleanContent = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE_LENGTH);
};

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-MAX_MESSAGES)
    .map((message) => {
      const role = message?.role === 'assistant' || message?.role === 'the-sun'
        ? 'assistant'
        : 'user';
      const content = cleanContent(message?.content);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
};

const buildInstructions = () => `${createTheSunPrompt()}

追加ルール:
- 返答は原則1〜4文で短くする。
- ユーザーの代わりに結論を決めない。
- 必要な時だけ質問する。
- THE SUNの口調を守り、説教や診断のように話さない。
- 危険や緊急性がある話題では、短く落ち着いて安全を優先する。`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  let messages;

  try {
    const body = parseBody(req);
    messages = normalizeMessages(body.messages);
  } catch (error) {
    console.error('THE SUN chat API received invalid JSON.', { name: error.name });
    return json(res, 400, { error: 'invalid_request' });
  }

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return json(res, 400, { error: 'invalid_request' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('THE SUN chat API is missing OPENAI_API_KEY.');
    return json(res, 503, { error: 'service_unavailable' });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: THE_SUN_MODEL,
      instructions: buildInstructions(),
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: MAX_OUTPUT_TOKENS,
      reasoning: { effort: 'low' },
      store: false,
    });

    const reply = cleanContent(response.output_text);

    if (!reply) {
      console.error('THE SUN chat API received an empty model response.');
      return json(res, 502, { error: 'empty_response' });
    }

    return json(res, 200, { reply });
  } catch (error) {
    console.error('THE SUN chat API request failed.', {
      name: error.name,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    return json(res, 502, { error: 'upstream_error' });
  }
}
