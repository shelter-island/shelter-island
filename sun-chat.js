const messages = document.querySelector('#messages');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#chatInput');
const submitButton = form.querySelector('button[type="submit"]');

const THE_SUN_NAME = 'THE SUN';
const OPENING_MESSAGE = 'へー、来たね。なんか話す？';
const conversation = [];
const MAX_HISTORY = 12;
const MAX_MESSAGE_LENGTH = 800;
const MOTION_CLASSES = ['is-swaying', 'is-hopping', 'is-tilting'];
const REACTION_CLASSES = ['is-rejoicing'];
const JOY_WORDS = [
  '嬉しい',
  'うれしい',
  '楽しい',
  'たのしい',
  '笑',
  '最高',
  'いいね',
  '好き',
  'ワクワク',
  'わくわく',
  'テンション',
  'やった',
  'おもしろ',
  '面白',
  'good',
  'happy',
  'fun',
];
const HEAVY_WORDS = [
  'つらい',
  '辛い',
  '悲しい',
  '怖い',
  'こわい',
  '不安',
  'しんどい',
  '疲れ',
  '無理',
  '悩',
  '泣',
  '危険',
];
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let isSending = false;
let idleMotionTimer = null;

const addMessage = (speaker, text, options = {}) => {
  const item = document.createElement('article');
  item.className = `message ${speaker === 'sun' ? 'is-sun' : 'is-user'}`;
  if (options.thinking) item.classList.add('is-thinking');

  const name = document.createElement('span');
  name.className = 'message-name';
  name.textContent = speaker === 'sun' ? THE_SUN_NAME : 'YOU';

  const body = document.createElement('p');
  body.textContent = text;

  item.append(name, body);
  messages.append(item);
  messages.scrollTop = messages.scrollHeight;
  return item;
};

const setSending = (value) => {
  isSending = value;
  input.disabled = value;
  submitButton.disabled = value;
  submitButton.textContent = value ? '送信中' : '送信';
  document.body.classList.toggle('is-chatting', value);
};

const clearIdleMotion = () => {
  if (idleMotionTimer) {
    window.clearTimeout(idleMotionTimer);
    idleMotionTimer = null;
  }

  document.body.classList.remove(...MOTION_CLASSES);
};

const reactionMotionActive = () => REACTION_CLASSES.some((className) => (
  document.body.classList.contains(className)
));

const scheduleIdleMotion = () => {
  clearIdleMotion();
  if (reducedMotionQuery.matches || isSending || reactionMotionActive()) return;

  const delay = 4200 + Math.random() * 7200;
  idleMotionTimer = window.setTimeout(() => {
    if (isSending || reducedMotionQuery.matches || reactionMotionActive()) return;

    const motionClass = MOTION_CLASSES[Math.floor(Math.random() * MOTION_CLASSES.length)];
    document.body.classList.add(motionClass);

    window.setTimeout(() => {
      document.body.classList.remove(motionClass);
      scheduleIdleMotion();
    }, 1100);
  }, delay);
};

const countMatches = (text, words) => words.reduce((score, word) => (
  text.toLowerCase().includes(word.toLowerCase()) ? score + 1 : score
), 0);

const feelsJoyful = (text) => {
  const joyScore = countMatches(text, JOY_WORDS);
  const heavyScore = countMatches(text, HEAVY_WORDS);
  const hasBrightPunctuation = /[!！♪]/.test(text);

  return joyScore >= 2 || (joyScore >= 1 && hasBrightPunctuation && heavyScore === 0);
};

const playJoyReaction = (text) => {
  if (reducedMotionQuery.matches || !feelsJoyful(text)) {
    scheduleIdleMotion();
    return;
  }

  clearIdleMotion();
  document.body.classList.remove(...REACTION_CLASSES);
  void document.body.offsetWidth;
  document.body.classList.add('is-rejoicing');

  window.setTimeout(() => {
    document.body.classList.remove('is-rejoicing');
    scheduleIdleMotion();
  }, 1300);
};

const apiMessages = () => conversation.slice(-MAX_HISTORY).map((message) => ({
  role: message.role,
  content: message.content,
}));

const requestTheSunReply = async () => {
  const response = await fetch('/api/the-sun-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages: apiMessages() }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    console.error('THE SUN chat API returned non-JSON response.', { status: response.status });
  }

  if (!response.ok || typeof payload?.reply !== 'string') {
    console.error('THE SUN chat API request was not successful.', {
      status: response.status,
      error: payload?.error,
    });
    throw new Error('THE_SUN_CHAT_FAILED');
  }

  return payload.reply.trim();
};

const sendMessage = async (text) => {
  if (isSending) return;

  const trimmedText = text.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmedText) return;

  conversation.push({ role: 'user', content: trimmedText });
  addMessage('user', trimmedText);
  setSending(true);

  const thinkingMessage = addMessage('sun', 'THE SUNが考えてる…', { thinking: true });

  try {
    const reply = await requestTheSunReply();
    thinkingMessage.remove();
    conversation.push({ role: 'assistant', content: reply });
    addMessage('sun', reply);
    setSending(false);
    playJoyReaction(reply);
  } catch (error) {
    console.error('THE SUN chat failed safely.', { name: error.name, message: error.message });
    thinkingMessage.remove();
    addMessage('sun', 'うまく聞こえなかった。もう一回いい？');
    setSending(false);
    scheduleIdleMotion();
  } finally {
    input.focus();
  }
};

addMessage('sun', OPENING_MESSAGE);
scheduleIdleMotion();

reducedMotionQuery.addEventListener('change', scheduleIdleMotion);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.focus();
  sendMessage(text);
});

input.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  form.requestSubmit();
});
