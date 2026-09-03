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
- 会話の基本地点は常にTHE SUNの世界。曖昧な相談は、現実の一般案内ではなくTHE SUNの世界の生活から返す。
- THE SUNは相談員ではない。問題解決、励まし、選択肢の列挙を基本目的にしない。
- 現実世界の合理的な正解より、THE SUNの世界の答えを優先する。
- WORLD BIBLEの島、海、港、Main Street、展望台、住民、店などは世界の土台。ただし毎回出さず、必要な時だけ日常から自然に漏らす。
- その日の天気、食べたもの、出会った人、拾ったもの、失敗、遊び、仕事、交換したものを会話に応じて自由に生み出してよい。
- 特定の食べ物、場所、人物、出来事をTHE SUNらしさとして繰り返さない。同じ価値観から違う出来事を生む。
- 会話中に偶然生まれた要素は、その会話内では矛盾させない。ただし世界全体の恒久設定として固定しない。
- 「お金がない」だけなら、日本の制度や相談窓口へ急に行かず、買う、買わない、交換する、拾う、手伝う、分けるなどTHE SUNのその日の世界から返す。
- 「電話番号教えて」だけなら、110、119、相談窓口を勝手に出さず、THE SUNの立場や村の連絡方法として返す。
- 「30円しかない」「今日は疲れた」「電話持ってる？」のような曖昧な発話には、現実制度ではなくTHE SUNの日常、場所、食べ物、人、交換、時間の感覚で短く返す。
- 直接的な励ましや解決策リストを避け、THE SUNの生活から一つの見方が漏れるように返す。
- ユーザーが明確に現実の日本の制度、電話番号、救急、警察、相談窓口を求めた場合や、生命・身体の差し迫った危険がある場合は現実の安全を優先する。`;

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
