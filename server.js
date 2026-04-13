const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const YANDEX_TTS_URL = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";
const YANDEX_GPT_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
const YANDEX_STT_URL = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize";
const MAX_JSON_SIZE = 64 * 1024;
const MAX_AUDIO_SIZE = 2 * 1024 * 1024;

if (typeof fetch !== "function") {
  console.error("Node.js 18+ is required (global fetch is missing).");
  process.exit(1);
}

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const idx = line.indexOf("=");
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

function getYandexConfig() {
  return {
    apiKey: process.env.YANDEX_API_KEY || "",
    folderId: process.env.YANDEX_FOLDER_ID || "",
    gptModelUri: process.env.YANDEX_GPT_MODEL_URI || ""
  };
}

function resolveModelUri(folderId, explicitModelUri) {
  const cleaned = String(explicitModelUri || "").trim();
  if (cleaned) {
    return cleaned;
  }
  if (!folderId) {
    return "";
  }
  return `gpt://${folderId}/yandexgpt/latest`;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": mime,
    "Cache-Control": "no-store"
  });
  fs.createReadStream(filePath).pipe(res);
}

function safeStaticPath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const normalized = path.normalize(decoded).replace(/^([.][.][/\\])+/, "");
  const target = normalized === "/" ? "/index.html" : normalized;
  const absolute = path.resolve(ROOT, `.${target}`);
  if (!absolute.startsWith(ROOT)) {
    return null;
  }
  return absolute;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_JSON_SIZE) {
        reject(new Error("payload_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function readBinaryBody(req, maxBytes = MAX_AUDIO_SIZE) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function normalizeSpeed(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0.82;
  }
  return clamp(parsed, 0.7, 1.1);
}

async function handleTts(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const { apiKey, folderId } = getYandexConfig();
  if (!apiKey || !folderId) {
    sendJson(res, 503, {
      error: "yandex_not_configured",
      message: "Set YANDEX_API_KEY and YANDEX_FOLDER_ID in .env"
    });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (e) {
    sendJson(res, 400, { error: e.message || "bad_request" });
    return;
  }

  const text = String(payload.text || "").trim();
  if (!text) {
    sendJson(res, 400, { error: "text_required" });
    return;
  }

  const voice = String(payload.voice || "alena").toLowerCase();
  const speed = normalizeSpeed(payload.speed);

  const body = new URLSearchParams({
    text: text.slice(0, 4500),
    lang: "ru-RU",
    voice,
    format: "mp3",
    folderId,
    speed: String(speed)
  });

  let yandexResponse;
  try {
    yandexResponse = await fetch(YANDEX_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
  } catch (e) {
    sendJson(res, 502, {
      error: "yandex_network_error",
      message: e.message || "Failed to call Yandex TTS"
    });
    return;
  }

  if (!yandexResponse.ok) {
    const details = await yandexResponse.text();
    sendJson(res, 502, {
      error: "yandex_tts_failed",
      status: yandexResponse.status,
      details
    });
    return;
  }

  const audioBuffer = Buffer.from(await yandexResponse.arrayBuffer());
  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Content-Length": String(audioBuffer.length),
    "Cache-Control": "no-store"
  });
  res.end(audioBuffer);
}

async function handleStt(req, res, parsedUrl) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const { apiKey } = getYandexConfig();
  if (!apiKey) {
    sendJson(res, 503, {
      error: "yandex_not_configured",
      message: "Set YANDEX_API_KEY in .env"
    });
    return;
  }

  const sampleRate = Number(parsedUrl.searchParams.get("sampleRate") || 16000);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    sendJson(res, 400, { error: "invalid_sample_rate" });
    return;
  }

  let audioBuffer;
  try {
    audioBuffer = await readBinaryBody(req);
  } catch (e) {
    sendJson(res, 400, { error: e.message || "bad_request" });
    return;
  }

  if (!audioBuffer.length) {
    sendJson(res, 400, { error: "audio_required" });
    return;
  }

  console.log(`[STT] request ${audioBuffer.length} bytes @ ${Math.round(sampleRate)}Hz`);

  const query = new URLSearchParams({
    lang: "ru-RU",
    format: "lpcm",
    sampleRateHertz: String(Math.round(sampleRate)),
    topic: "general"
  });

  let sttResponse;
  try {
    sttResponse = await fetch(`${YANDEX_STT_URL}?${query.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/octet-stream"
      },
      body: audioBuffer
    });
  } catch (e) {
    sendJson(res, 502, {
      error: "yandex_network_error",
      message: e.message || "Failed to call Yandex STT"
    });
    return;
  }

  if (!sttResponse.ok) {
    const details = await sttResponse.text();
    console.log(`[STT] failed ${sttResponse.status}: ${details.slice(0, 240)}`);
    sendJson(res, 502, {
      error: "yandex_stt_failed",
      status: sttResponse.status,
      details
    });
    return;
  }

  let responseBody;
  try {
    responseBody = await sttResponse.json();
  } catch (e) {
    sendJson(res, 502, { error: "invalid_yandex_response" });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    text: String(responseBody?.result || "").trim()
  });
  console.log(`[STT] ok: "${String(responseBody?.result || "").trim().slice(0, 200)}"`);
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch (e2) {
      return null;
    }
  }
}

function normalizeSpecialty(value) {
  const t = String(value || "").trim().toLowerCase();
  if (
    t === "травмпункт" ||
    t === "trauma_point" ||
    t === "urgent_trauma" ||
    t === "urgent-trauma" ||
    t === "traumpunkt"
  ) {
    return "Травмпункт";
  }
  if (
    t === "травматолог-ортопед" ||
    t === "травматолог ортопед" ||
    t === "травматолог" ||
    t === "ортопед" ||
    t === "traumatologist_orthopedist" ||
    t === "orthopedist" ||
    t === "traumatologist"
  ) {
    return "Травматолог-ортопед";
  }
  if (
    t === "not_profile" ||
    t === "not-profile" ||
    t === "non_profile" ||
    t === "непрофиль" ||
    t === "не профиль"
  ) {
    return "NOT_PROFILE";
  }
  return "";
}

function normalizeTriageDecision(value) {
  const t = String(value || "").trim().toLowerCase();
  if (
    t === "травмпункт" ||
    t === "trauma_point" ||
    t === "urgent_trauma" ||
    t === "trauma-point"
  ) {
    return "Травмпункт";
  }
  if (
    t === "травматолог-ортопед" ||
    t === "травматолог ортопед" ||
    t === "травматолог" ||
    t === "ортопед" ||
    t === "orthopedist" ||
    t === "traumatologist"
  ) {
    return "Травматолог-ортопед";
  }
  if (t === "need_info" || t === "need-info" || t === "нужно уточнение" || t === "уточнить") {
    return "NEED_INFO";
  }
  if (t === "not_profile" || t === "not-profile" || t === "не профиль" || t === "непрофиль") {
    return "NOT_PROFILE";
  }
  return "";
}

function normalizeDistrict(value) {
  const t = String(value || "").trim().toLowerCase();
  if (!t) {
    return "";
  }
  if (
    t === "центр" ||
    t === "центральный" ||
    t === "цао"
  ) {
    return "центр";
  }
  if (t === "север" || t === "северный") {
    return "север";
  }
  if (
    t === "северо-запад" ||
    t === "северо запад" ||
    t === "сзао"
  ) {
    return "северо-запад";
  }
  if (
    t === "юго-запад" ||
    t === "юго запад" ||
    t === "юзао"
  ) {
    return "юго-запад";
  }
  if (t === "юг" || t === "южный" || t === "юао") {
    return "юг";
  }
  if (
    t === "юго-восток" ||
    t === "юго восток" ||
    t === "ювао"
  ) {
    return "юго-восток";
  }
  if (t === "любой" || t === "без разницы" || t === "не важно") {
    return "";
  }
  return "";
}

function normalizeDayToken(value) {
  const t = String(value || "").trim().toLowerCase();
  if (!t) {
    return "";
  }
  if (t === "today" || t === "сегодня") {
    return "today";
  }
  if (t === "tomorrow" || t === "завтра") {
    return "tomorrow";
  }
  if (
    t === "day_after_tomorrow" ||
    t === "day-after-tomorrow" ||
    t === "послезавтра"
  ) {
    return "day_after_tomorrow";
  }
  return "";
}

function normalizeTimeWindow(value) {
  const t = String(value || "").trim().toLowerCase();
  if (!t) {
    return "";
  }
  if (t === "morning" || t === "утро") {
    return "morning";
  }
  if (
    t === "afternoon" ||
    t === "day" ||
    t === "день" ||
    t === "после обеда"
  ) {
    return "afternoon";
  }
  if (t === "evening" || t === "вечер") {
    return "evening";
  }
  return "";
}

async function handleDialogGuide(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const { apiKey, folderId, gptModelUri } = getYandexConfig();
  const modelUri = resolveModelUri(folderId, gptModelUri);
  if (!apiKey || !folderId || !modelUri) {
    sendJson(res, 503, {
      error: "yandex_not_configured",
      message: "Set YANDEX_API_KEY and YANDEX_FOLDER_ID in .env"
    });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (e) {
    sendJson(res, 400, { error: e.message || "bad_request" });
    return;
  }

  const userMessage = String(payload.userMessage || "").trim();
  if (!userMessage) {
    sendJson(res, 400, { error: "user_message_required" });
    return;
  }

  const currentStep = String(payload.currentStep || "").trim();
  const dialogState = payload && typeof payload.state === "object" && payload.state ? payload.state : {};
  const history = Array.isArray(payload.history) ? payload.history : [];
  const clinics = Array.isArray(payload.clinics) ? payload.clinics.slice(0, 24) : [];

  const historyText = history
    .slice(-8)
    .map((item) => {
      const role = String(item?.role || "").trim() || "unknown";
      const text = String(item?.text || "").trim().replace(/\s+/g, " ").slice(0, 280);
      return `${role}: ${text}`;
    })
    .join("\n");

  const clinicText = clinics
    .map((clinic, index) => {
      const specialties = Array.isArray(clinic?.specialties) ? clinic.specialties.join(", ") : "";
      return (
        `${index + 1}. ${String(clinic?.name || "").trim()} | ` +
        `район: ${String(clinic?.district || "").trim() || "не указан"} | ` +
        `адрес: ${String(clinic?.address || "").trim()} | ` +
        `доступно: ${specialties || "не указано"}`
      );
    })
    .join("\n");

  const prompt = {
    modelUri,
    completionOptions: {
      stream: false,
      temperature: 0.2,
      maxTokens: "420"
    },
    messages: [
      {
        role: "system",
        text:
          "Ты администратор сети клиник «Будь здоров» в Москве. " +
          "Общаешься по-русски коротко, естественно и по-человечески, как живой сотрудник ресепшена. " +
          "Не ставь диагноз и не придумывай данные, которых нет во входных данных. " +
          "Профиль клиники в этом демо: только травматология и ортопедия. " +
          "Экстренная травма направляется только в травмпункт по адресу Москва, Последний переулок, 28. " +
          "Во всех остальных филиалах прием плановый у травматолога-ортопеда. " +
          "Твоя задача: понять свободный ответ пользователя, помочь с навигацией по филиалам, ответить на вопрос по-человечески и, если возможно, извлечь структурированные поля. " +
          "Если пользователь спрашивает, какие филиалы есть или что ближе к ориентиру, отвечай по списку филиалов ниже. " +
          "Если пользователь говорит ориентир вроде «около МГУ», трактуй это как юго-запад и в первую очередь ориентируй на клинику на Профсоюзной, если список филиалов ниже не противоречит этому. " +
          "Если currentStep=collecting_location и район удалось понять, в reply подтверди район или ближайший филиал и сразу мягко спроси про день и время. " +
          "Если currentStep=collecting_time и день/окно времени удалось понять, в reply можно коротко подтвердить это, но не выдумывай конкретный слот. " +
          "Если вопрос пользователя не мешает записи, ответь на него и мягко верни разговор к следующему шагу записи. " +
          "Верни строго JSON без комментариев: " +
          "{\"reply\":\"...\",\"district\":\"...\",\"day\":\"...\",\"timeWindow\":\"...\",\"patientName\":\"...\",\"understood\":true}. " +
          "district только из списка: центр, север, северо-запад, юго-запад, юг, юго-восток или пустая строка. " +
          "day только today, tomorrow, day_after_tomorrow или пустая строка. " +
          "timeWindow только morning, afternoon, evening или пустая строка. " +
          "patientName заполняй только если пользователь явно назвал имя и фамилию. " +
          "reply должен быть кратким: обычно 1-3 предложения."
      },
      {
        role: "user",
        text:
          `currentStep: ${currentStep || "-"}\n` +
          `state: ${JSON.stringify(dialogState).slice(0, 2200)}\n` +
          `clinics:\n${clinicText || "-"}\n` +
          `recent_history:\n${historyText || "-"}\n` +
          `user_message: ${userMessage.slice(0, 1200)}`
      }
    ]
  };

  let llmResponse;
  try {
    llmResponse = await fetch(YANDEX_GPT_URL, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
        "x-folder-id": folderId
      },
      body: JSON.stringify(prompt)
    });
  } catch (e) {
    sendJson(res, 502, {
      error: "yandex_network_error",
      message: e.message || "Failed to call Yandex GPT"
    });
    return;
  }

  if (!llmResponse.ok) {
    const details = await llmResponse.text();
    sendJson(res, 502, {
      error: "yandex_gpt_failed",
      status: llmResponse.status,
      details
    });
    return;
  }

  let responseBody;
  try {
    responseBody = await llmResponse.json();
  } catch (e) {
    sendJson(res, 502, { error: "invalid_yandex_response" });
    return;
  }

  const rawText = String(responseBody?.result?.alternatives?.[0]?.message?.text || "").trim();
  const extracted = extractJsonObject(rawText);
  if (!extracted) {
    sendJson(res, 502, {
      error: "invalid_dialog_response",
      raw: rawText
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    reply: String(extracted?.reply || "").trim().slice(0, 900),
    district: normalizeDistrict(extracted?.district),
    day: normalizeDayToken(extracted?.day),
    timeWindow: normalizeTimeWindow(extracted?.timeWindow),
    patientName: String(extracted?.patientName || "").trim().slice(0, 120),
    understood: extracted?.understood !== false
  });
}

async function handleSpecialtyClassify(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const { apiKey, folderId, gptModelUri } = getYandexConfig();
  const modelUri = resolveModelUri(folderId, gptModelUri);
  if (!apiKey || !folderId || !modelUri) {
    sendJson(res, 503, {
      error: "yandex_not_configured",
      message: "Set YANDEX_API_KEY and YANDEX_FOLDER_ID in .env"
    });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (e) {
    sendJson(res, 400, { error: e.message || "bad_request" });
    return;
  }

  const text = String(payload.text || "").trim();
  if (!text) {
    sendJson(res, 400, { error: "text_required" });
    return;
  }

  const prompt = {
    modelUri,
    completionOptions: {
      stream: false,
      temperature: 0,
      maxTokens: "160"
    },
    messages: [
      {
        role: "system",
        text:
          "Ты медицинский маршрутизатор сети клиник в Москве. " +
          "Выбери только один класс: Травматолог-ортопед, Травмпункт, NOT_PROFILE. " +
          "Экстренная травма направляется только в травмпункт на Сретенке. " +
          "Травмпункт выбирай только для срочных травм, сильного острого состояния, кровотечения, глубокой раны, подозрения на перелом или когда нужна неотложная помощь. " +
          "Во всех остальных филиалах помощь оказывается планово, поэтому Травматолог-ортопед — любые неэкстренные травмы, боли в суставах, спине, связках и ортопедические жалобы. " +
          "Если жалоба не относится к травматологии/ортопедии, верни NOT_PROFILE. " +
          "Ответ строго JSON без комментариев: {\"specialty\":\"...\",\"confidence\":0.0}"
      },
      {
        role: "user",
        text: text.slice(0, 2000)
      }
    ]
  };

  let llmResponse;
  try {
    llmResponse = await fetch(YANDEX_GPT_URL, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
        "x-folder-id": folderId
      },
      body: JSON.stringify(prompt)
    });
  } catch (e) {
    sendJson(res, 502, {
      error: "yandex_network_error",
      message: e.message || "Failed to call Yandex GPT"
    });
    return;
  }

  if (!llmResponse.ok) {
    const details = await llmResponse.text();
    sendJson(res, 502, {
      error: "yandex_gpt_failed",
      status: llmResponse.status,
      details
    });
    return;
  }

  let responseBody;
  try {
    responseBody = await llmResponse.json();
  } catch (e) {
    sendJson(res, 502, { error: "invalid_yandex_response" });
    return;
  }

  const rawText = String(responseBody?.result?.alternatives?.[0]?.message?.text || "").trim();
  const extracted = extractJsonObject(rawText);
  const specialty = normalizeSpecialty(extracted?.specialty);
  const confidence = Number(extracted?.confidence);

  if (!specialty) {
    sendJson(res, 502, {
      error: "unrecognized_specialty",
      raw: rawText
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    specialty,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0.7
  });
}

async function handleTriageRoute(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const { apiKey, folderId, gptModelUri } = getYandexConfig();
  const modelUri = resolveModelUri(folderId, gptModelUri);
  if (!apiKey || !folderId || !modelUri) {
    sendJson(res, 503, {
      error: "yandex_not_configured",
      message: "Set YANDEX_API_KEY and YANDEX_FOLDER_ID in .env"
    });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (e) {
    sendJson(res, 400, { error: e.message || "bad_request" });
    return;
  }

  const symptoms = String(payload.symptoms || "").trim();
  const extra = String(payload.extra || "").trim();
  const turns = Number(payload.turns || 0);
  if (!symptoms) {
    sendJson(res, 400, { error: "symptoms_required" });
    return;
  }

  const userText = extra ? `Жалоба: ${symptoms}\nУточнение пациента: ${extra}` : `Жалоба: ${symptoms}`;

  const prompt = {
    modelUri,
    completionOptions: {
      stream: false,
      temperature: 0,
      maxTokens: "220"
    },
    messages: [
      {
        role: "system",
        text:
          "Ты медицинский ассистент-триаж сети клиник в Москве. " +
          "Нужно выбрать только один результат: Травматолог-ортопед, Травмпункт, NOT_PROFILE, NEED_INFO. " +
          "Экстренная травма направляется только в травмпункт на Сретенке. " +
          "Травмпункт выбирай только если по описанию или уточнению похоже на срочную травму: подозрение на перелом, сильная деформация, кровотечение, глубокая или рваная рана, прокол, травма от штыря, арматуры или другого острого предмета, невозможно наступить или двигать конечностью, резкое тяжелое состояние после травмы. " +
          "Травматолог-ортопед выбирай для плановой помощи: боли в спине, суставах, связках, ушибы и травмы без явных признаков срочности. " +
          "Грубые, разговорные и жаргонные формулировки пациента все равно интерпретируй по медицинскому смыслу жалобы. " +
          "Если жалоба не относится к травматологии и ортопедии, верни NOT_PROFILE. " +
          "Если данных не хватает, верни NEED_INFO и задай один короткий вопрос только про срочность. " +
          "После первого уточнения старайся уже принять решение, а не задавать много новых вопросов. " +
          "Ответ строго JSON без комментариев: {\"decision\":\"...\",\"question\":\"...\",\"confidence\":0.0}"
      },
      {
        role: "user",
        text: `${userText}\nКоличество уже заданных уточняющих вопросов: ${Number.isFinite(turns) ? turns : 0}`
      }
    ]
  };

  let llmResponse;
  try {
    llmResponse = await fetch(YANDEX_GPT_URL, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
        "x-folder-id": folderId
      },
      body: JSON.stringify(prompt)
    });
  } catch (e) {
    sendJson(res, 502, {
      error: "yandex_network_error",
      message: e.message || "Failed to call Yandex GPT"
    });
    return;
  }

  if (!llmResponse.ok) {
    const details = await llmResponse.text();
    sendJson(res, 502, {
      error: "yandex_gpt_failed",
      status: llmResponse.status,
      details
    });
    return;
  }

  let responseBody;
  try {
    responseBody = await llmResponse.json();
  } catch (e) {
    sendJson(res, 502, { error: "invalid_yandex_response" });
    return;
  }

  const rawText = String(responseBody?.result?.alternatives?.[0]?.message?.text || "").trim();
  const extracted = extractJsonObject(rawText);
  const decision = normalizeTriageDecision(extracted?.decision);
  const confidence = Number(extracted?.confidence);
  const question = String(extracted?.question || "").trim();

  if (!decision) {
    sendJson(res, 502, {
      error: "unrecognized_triage_decision",
      raw: rawText
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    decision,
    question,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0.7
  });
}

function handleHealth(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }
  const { apiKey, folderId } = getYandexConfig();
  sendJson(res, 200, {
    ok: true,
    provider: "yandex",
    configured: Boolean(apiKey && folderId)
  });
}

function handleStatic(req, res, pathname) {
  const filePath = safeStaticPath(pathname);
  if (!filePath) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendJson(res, 404, { error: "not_found" });
      return;
    }
    sendFile(res, filePath);
  });
}

const server = http.createServer((req, res) => {
  const base = `http://${req.headers.host || "localhost"}`;
  const parsed = new URL(req.url || "/", base);

  if (parsed.pathname === "/api/specialty/classify") {
    handleSpecialtyClassify(req, res);
    return;
  }

  if (parsed.pathname === "/api/triage/route") {
    handleTriageRoute(req, res);
    return;
  }

  if (parsed.pathname === "/api/dialog/guide") {
    handleDialogGuide(req, res);
    return;
  }

  if (parsed.pathname === "/api/stt") {
    handleStt(req, res, parsed);
    return;
  }

  if (parsed.pathname === "/api/tts") {
    handleTts(req, res);
    return;
  }

  if (parsed.pathname === "/api/tts/health") {
    handleHealth(req, res);
    return;
  }

  handleStatic(req, res, parsed.pathname);
});

server.listen(PORT, () => {
  const { apiKey, folderId } = getYandexConfig();
  const configured = Boolean(apiKey && folderId);
  console.log(`Clinic Voice Demo listening on http://localhost:${PORT}`);
  console.log(`Yandex TTS configured: ${configured ? "yes" : "no"}`);
});
