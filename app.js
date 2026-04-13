const chatEl = document.getElementById("chat");
const summaryEl = document.getElementById("summary");
const historyEl = document.getElementById("history");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const resetBtn = document.getElementById("resetBtn");
const statusBadge = document.getElementById("statusBadge");
const micBtnState = document.getElementById("micBtnState");
const micBtnLabel = document.getElementById("micBtnLabel");
const chips = Array.from(document.querySelectorAll(".chip"));
const ttsProviderSelect = document.getElementById("ttsProvider");
const voiceSelect = document.getElementById("voiceSelect");
const speechRateInput = document.getElementById("speechRate");
const speechRateValue = document.getElementById("speechRateValue");

const clinics = [
  {
    name: "Будь здоров - Флагманский медцентр на Рязанском проспекте",
    district: "юго-восток",
    address: "г. Москва, Рязанский проспект, д. 2Б",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "10:00" },
        { day: "today", time: "16:30" },
        { day: "tomorrow", time: "15:30" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника на Фрунзенской",
    district: "центр",
    address: "г. Москва, Комсомольский проспект, д. 28",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "11:00" },
        { day: "today", time: "18:00" },
        { day: "tomorrow", time: "12:30" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника на Сущевском Валу",
    district: "север",
    address: "г. Москва, ул. Сущевский Вал, д. 12",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "09:30" },
        { day: "today", time: "15:00" },
        { day: "tomorrow", time: "11:30" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника на Сретенке",
    district: "центр",
    address: "г. Москва, ул. Последний переулок, д. 28",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "10:30" },
        { day: "today", time: "17:30" },
        { day: "tomorrow", time: "13:00" }
      ],
      Травмпункт: [
        { day: "today", time: "09:00" },
        { day: "today", time: "12:00" },
        { day: "today", time: "16:00" },
        { day: "tomorrow", time: "10:00" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника на Профсоюзной",
    district: "юго-запад",
    address: "г. Москва, ул. Архитектора Власова, д. 6",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "09:30" },
        { day: "today", time: "14:30" },
        { day: "tomorrow", time: "13:00" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника на Ходынке",
    district: "северо-запад",
    address: "г. Москва, ул. Гризодубовой, д. 1, корп. 2 и 3",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "10:30" },
        { day: "today", time: "15:30" },
        { day: "tomorrow", time: "12:00" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника в Строгино",
    district: "северо-запад",
    address: "г. Москва, Неманский проезд, д. 13, корп. 2, пом. 1",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "11:30" },
        { day: "today", time: "18:30" },
        { day: "tomorrow", time: "14:00" }
      ]
    }
  },
  {
    name: "Будь здоров - Клиника на Тульской",
    district: "юг",
    address: "г. Москва, Гамсоновский переулок, д. 2, стр. 6",
    doctors: {
      "Травматолог-ортопед": [
        { day: "today", time: "10:00" },
        { day: "today", time: "16:00" },
        { day: "tomorrow", time: "13:30" }
      ]
    }
  }
];

const specialtyRules = {
  Травмпункт: [
    "травмпункт",
    "срочно",
    "кров",
    "рана",
    "порез",
    "шов",
    "глубок",
    "неотлож",
    "сильный ушиб",
    "подозрение на перелом",
    "рван",
    "прокол",
    "протк",
    "напорол",
    "штыр",
    "острый предмет"
  ],
  "Травматолог-ортопед": [
    "травм",
    "перелом",
    "ушиб",
    "вывих",
    "растяж",
    "связк",
    "гематом",
    "отек",
    "сустав",
    "колен",
    "плеч",
    "локт",
    "стоп",
    "лодыж",
    "пятк",
    "позвоноч",
    "осанк",
    "артроз",
    "сколиоз",
    "спин",
    "поясниц",
    "шея"
  ]
};

const districtsMap = {
  центр: ["центр", "центре", "центральный", "цао", "сретенка", "фрунзенская", "комсомольский"],
  север: ["север", "савеловский", "марьина роща", "сущевский вал"],
  "северо-запад": ["северо-запад", "северо запад", "сзао", "строгино", "ходынка"],
  "юго-запад": [
    "юго-запад",
    "юго запад",
    "юзао",
    "профсоюзная",
    "архитектора власова",
    "мгу",
    "университет",
    "ленинские горы",
    "вернадского"
  ],
  юг: ["юг", "юао", "тульская", "гамсоновский"],
  "юго-восток": ["юго-восток", "юго восток", "ювао", "рязанский", "текстильщики"]
};

const state = {
  step: "collecting_symptoms",
  patientName: "",
  symptoms: "",
  pendingSymptoms: "",
  urgencyNotes: "",
  triageTurns: 0,
  specialty: "",
  district: "",
  preferredDay: "",
  preferredWindow: "",
  preferredExactTime: "",
  pendingPhone: "",
  phone: "",
  booking: null,
  history: []
};

const dialogHistory = [];

let recognition = null;
let micActive = false;
let isSpeaking = false;
let suppressRecognitionRestart = false;
let shouldResumeListeningAfterSpeech = false;
let selectedVoice = null;
let selectedVoiceName = "";
let speechQueue = Promise.resolve();
const currentSpeechRate = 1.04;
let activeAudio = null;
let yandexFailureNotified = false;
let yandexTtsConfigured = false;
let currentTtsProvider = "yandex";
let currentYandexVoice = "marina";
let aiClassifierFallbackNotified = false;
let recognitionStableText = "";
let recognitionLiveTail = "";
let recognitionLiveSnapshot = "";
let recognitionCommitTimer = null;
let recognitionRestartTimer = null;
let recognitionRunning = false;
let recognitionInterimByIndex = new Map();
let lastAssistantSpokenNorm = "";
let lastAssistantSpokenAt = 0;
let assistantSpeechReleasedAt = 0;
let assistantSpeechStartedAt = 0;
let playbackCancelledAt = 0;
let manualMicStopAt = 0;
let lastUserTurnNorm = "";
let lastUserTurnAt = 0;
let lastUserTurnStep = "";
let speechSessionId = 0;
let bargeInAudioContext = null;
let bargeInAnalyser = null;
let bargeInSource = null;
let bargeInData = null;
let bargeInStream = null;
let bargeInProcessor = null;
let bargeInSilentGain = null;
let bargeInRafId = 0;
let bargeInLastTs = 0;
let bargeInSpeechMs = 0;
let bargeInNoiseFloor = 0.008;
let micInputSampleRate = 16000;
let sttCaptureActive = false;
let sttCaptureStartedAt = 0;
let sttSpeechMs = 0;
let sttSilenceMs = 0;
let sttFloatChunks = [];
let sttPreRollChunks = [];
let sttPreRollFrames = 0;
let sttRequestInFlight = false;
let sttSessionId = 0;
let yandexSttFailureNotified = false;

const USER_SPEECH_IDLE_MS = 850;
const USER_FINAL_CHUNK_COMMIT_MS = 520;
const RECOGNITION_RESUME_DELAY_MS = 0;
const ASSISTANT_ECHO_GUARD_MS = 6000;
const ASSISTANT_POST_SPEECH_GUARD_MS = 0;
const STOP_RECOGNITION_DURING_ASSISTANT_SPEECH = true;
const USER_DUPLICATE_WINDOW_MS = 3200;
const BARGE_IN_ENABLE_AFTER_MS = 850;
const BARGE_IN_MIN_RMS_THRESHOLD = 0.032;
const BARGE_IN_RMS_MULTIPLIER = 3.2;
const BARGE_IN_HOLD_MS = 320;
const USER_SPEECH_START_HOLD_MS = 110;
const USER_SPEECH_END_SILENCE_MS = 680;
const USER_SPEECH_MAX_MS = 14000;
const USER_SPEECH_MIN_MS = 220;
const USER_PREROLL_MS = 180;
const STT_TARGET_SAMPLE_RATE = 16000;
const STT_CONTINUE_MIN_RMS_THRESHOLD = 0.018;
const STT_CONTINUE_RMS_MULTIPLIER = 1.9;
const STT_MIN_CAPTURE_BEFORE_SILENCE_MS = 280;
const LOW_SIGNAL_UTTERANCES = new Set([
  "вот",
  "ну",
  "ага",
  "угу",
  "да",
  "нет",
  "алло",
  "слышно",
  "эм",
  "мм",
  "а"
]);
const SYMPTOM_CUE_FRAGMENTS = [
  "бол",
  "боль",
  "темпер",
  "каш",
  "насмор",
  "тошн",
  "рвот",
  "изжог",
  "давлен",
  "пульс",
  "сердц",
  "голов",
  "живот",
  "горл",
  "ух",
  "нос",
  "поясниц",
  "спин",
  "сустав",
  "онемен",
  "сып",
  "зуд",
  "слабост"
];
const ACUTE_TRAUMA_CUE_FRAGMENTS = [
  "травм",
  "ушиб",
  "подвер",
  "порва",
  "потян",
  "растяж",
  "упал",
  "удар",
  "вывих",
  "связк",
  "слом",
  "подскольз"
];
const EMERGENCY_TRAUMA_CUE_FRAGMENTS = [
  "кров",
  "рана",
  "порез",
  "глубок",
  "рван",
  "разорва",
  "прокол",
  "протк",
  "напорол",
  "штыр",
  "арматур",
  "острый предмет",
  "неотлож",
  "срочно",
  "перелом",
  "деформа",
  "не могу наступ",
  "невозможно наступ",
  "не могу двиг",
  "невозможно двиг",
  "очень сильная боль"
];
const PLANNED_ORTHO_CUE_FRAGMENTS = [
  "хронич",
  "давно",
  "несколько недель",
  "несколько месяцев",
  "болит спина",
  "болит поясница",
  "сустав",
  "артроз",
  "сколиоз",
  "осанк"
];

const yandexVoices = [
  { id: "marina", label: "Марина" },
  { id: "alena", label: "Алёна" },
  { id: "oksana", label: "Оксана" },
  { id: "jane", label: "Jane" },
  { id: "madi_ru", label: "Мади" },
  { id: "filipp", label: "Филипп" },
  { id: "ermil", label: "Ермил" },
  { id: "omazh", label: "Омаж" },
  { id: "zahar", label: "Захар" }
];

const speechReplacements = [
  [/Травматолог-ортопед/gi, "травматолог-ортопед"],
  [/Травмпункт/gi, "травмпункт"],
  [/ЧМЗ/gi, "Че-эм-зе"],
  [/\+7/g, "плюс семь"]
];

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function dateFromToken(token) {
  const now = new Date();
  const date = new Date(now);
  if (token === "tomorrow") {
    date.setDate(now.getDate() + 1);
  } else if (token === "day_after_tomorrow") {
    date.setDate(now.getDate() + 2);
  }
  return date;
}

function dayLabel(token) {
  const date = dateFromToken(token);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function dayLabelForSpeech(token) {
  const date = dateFromToken(token);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function timeWindowFromText(text) {
  const t = normalize(text);
  if (t.includes("утр")) {
    return "morning";
  }
  if (t.includes("вечер")) {
    return "evening";
  }
  if (t.includes("дн") || t.includes("после обеда")) {
    return "afternoon";
  }
  return "";
}

function padTimeUnit(value) {
  return String(value).padStart(2, "0");
}

function normalizeHour24(hour, suffix = "") {
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    return -1;
  }

  const hint = normalize(suffix);
  if (hint.includes("утр")) {
    return hour === 12 ? 0 : hour;
  }
  if (hint.includes("веч")) {
    return hour < 12 ? hour + 12 : hour;
  }
  if (hint.includes("дн")) {
    if (hour >= 1 && hour <= 11) {
      return hour + 12;
    }
    return hour;
  }
  if (hint.includes("ноч")) {
    return hour === 12 ? 0 : hour;
  }

  if (hour >= 1 && hour <= 7) {
    return hour + 12;
  }

  return hour;
}

function inferWindowFromExactTime(timeValue) {
  const minutes = slotTimeToMinutes(timeValue);
  if (minutes < 0) {
    return "";
  }
  const hour = Math.floor(minutes / 60);
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  return "evening";
}

function exactTimeFromText(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return "";
  }

  const normalized = normalize(raw);
  const numericMatch = normalized.match(/(?:^|\s)(?:в|на)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(утра|вечера|дня|ночи)?\b/);
  if (numericMatch) {
    const hour24 = normalizeHour24(Number(numericMatch[1]), numericMatch[3] || "");
    const minute = Number(numericMatch[2] || "0");
    if (hour24 >= 0 && minute >= 0 && minute < 60) {
      return `${padTimeUnit(hour24)}:${padTimeUnit(minute)}`;
    }
  }

  const hourWords = {
    "ноль": 0,
    "час": 1,
    "часа": 1,
    "один": 1,
    "одна": 1,
    "два": 2,
    "две": 2,
    "три": 3,
    "четыре": 4,
    "пять": 5,
    "шесть": 6,
    "семь": 7,
    "восемь": 8,
    "девять": 9,
    "десять": 10,
    "одиннадцать": 11,
    "двенадцать": 12,
    "тринадцать": 13,
    "четырнадцать": 14,
    "пятнадцать": 15,
    "шестнадцать": 16,
    "семнадцать": 17,
    "восемнадцать": 18,
    "девятнадцать": 19,
    "двадцать": 20,
    "двадцать один": 21,
    "двадцать два": 22,
    "двадцать три": 23
  };

  const wordMatch = normalized.match(
    /(?:^|\s)(?:в|на)\s+(двадцать два|двадцать три|двадцать один|ноль|часа|час|одна|один|две|два|три|четыре|пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать|тринадцать|четырнадцать|пятнадцать|шестнадцать|семнадцать|восемнадцать|девятнадцать|двадцать)\s*(утра|вечера|дня|ночи)?\b/
  );
  if (wordMatch) {
    const hour = hourWords[wordMatch[1]] ?? -1;
    const hour24 = normalizeHour24(hour, wordMatch[2] || "");
    if (hour24 >= 0) {
      return `${padTimeUnit(hour24)}:00`;
    }
  }

  return "";
}

function dayFromText(text) {
  const t = normalize(text);
  if (t.includes("послезавтра")) {
    return "day_after_tomorrow";
  }
  if (t.includes("завтра")) {
    return "tomorrow";
  }
  if (t.includes("сегодня")) {
    return "today";
  }
  return "";
}

function extractDistrict(text) {
  const t = normalize(text);
  if (t.includes("не важно") || t.includes("без разницы") || t.includes("любой")) {
    return "";
  }

  for (const [district, aliases] of Object.entries(districtsMap)) {
    if (aliases.some((alias) => t.includes(alias))) {
      return district;
    }
  }
  return null;
}

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  return "";
}

function extractPhoneFromWords(text) {
  const wordToDigit = {
    "ноль": "0",
    "нуль": "0",
    "один": "1",
    "одна": "1",
    "два": "2",
    "две": "2",
    "три": "3",
    "четыре": "4",
    "пять": "5",
    "шесть": "6",
    "семь": "7",
    "восемь": "8",
    "девять": "9"
  };

  const tokens = normalize(text)
    .replace(/[^a-zа-яё0-9+\s-]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);

  let digits = "";
  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      digits += token;
      continue;
    }
    if (token in wordToDigit) {
      digits += wordToDigit[token];
    }
  }

  if (digits.length < 10) {
    return "";
  }

  if (digits.length > 11) {
    const match11 = digits.match(/[78]\d{10}/);
    if (match11) {
      digits = match11[0];
    } else {
      digits = digits.slice(-10);
    }
  }

  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return formatPhone(normalizePhone(digits));
  }
  if (digits.length >= 10) {
    return formatPhone(normalizePhone(digits.slice(-10)));
  }

  return "";
}

function formatPhone(e164Phone) {
  const digits = String(e164Phone || "").replace(/\D/g, "");
  if (digits.length !== 11 || !digits.startsWith("7")) {
    return e164Phone;
  }
  const local = digits.slice(1);
  return `+7 ${local.slice(0, 3)} ${local.slice(3, 6)}-${local.slice(6, 8)}-${local.slice(8, 10)}`;
}

function extractPhone(text) {
  const matches = String(text || "").match(/(\+?\d[\d\s\-\(\)]{6,}\d)/g) || [];
  let best = "";
  let bestLen = 0;

  for (const candidate of matches) {
    const normalized = normalizePhone(candidate);
    if (!normalized) {
      continue;
    }
    const digitsLen = normalized.replace(/\D/g, "").length;
    if (digitsLen > bestLen) {
      bestLen = digitsLen;
      best = normalized;
    }
  }

  if (best) {
    return formatPhone(best);
  }

  return extractPhoneFromWords(text);
}

function isContactConfirmed(text) {
  const t = normalize(text);
  return (
    t.includes("подтвержда") ||
    t.includes("подтвердить") ||
    t === "да" ||
    t.includes("верно") ||
    t.includes("правильно") ||
    t.includes("подходит")
  );
}

function isContactCorrection(text) {
  const t = normalize(text);
  return t.includes("неверно") || t.includes("ошибка") || t.includes("исправ") || t === "нет";
}

function isPositiveConfirmation(text) {
  const t = normalize(text);
  return (
    t === "да" ||
    t.includes("подходит") ||
    t.includes("удобно") ||
    t.includes("хорошо") ||
    t.includes("соглас") ||
    t.includes("берем") ||
    t.includes("записывайте")
  );
}

function isNegativeConfirmation(text) {
  const t = normalize(text);
  return (
    t === "нет" ||
    t.includes("не подходит") ||
    t.includes("неудобно") ||
    t.includes("другое время") ||
    t.includes("другой день") ||
    t.includes("не могу")
  );
}

function extractName(text, options = {}) {
  const { allowSingleWord = false } = options;
  const raw = String(text || "");
  const m = raw.match(/меня зовут\s+([А-Яа-яЁё\-]+)/i);
  if (m) {
    return m[1];
  }

  if (!allowSingleWord) {
    return "";
  }

  const words = raw.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1 && /^[А-Яа-яЁё\-]{2,}$/.test(words[0])) {
    const candidate = normalize(words[0]);
    if (LOW_SIGNAL_UTTERANCES.has(candidate) || hasSymptomCue(candidate) || detectSpecialtyBySymptoms(candidate)) {
      return "";
    }
    return words[0];
  }
  return "";
}

function extractPatientFullName(text) {
  const raw = String(text || "")
    .trim()
    .replace(/[.,!?;:]+/g, " ")
    .replace(/\s+/g, " ");
  if (!raw || /\d/.test(raw)) {
    return "";
  }

  const normalized = normalize(raw);
  if (
    LOW_SIGNAL_UTTERANCES.has(normalized) ||
    hasSymptomCue(normalized) ||
    detectSpecialtyBySymptoms(normalized) ||
    extractDistrict(normalized) !== null ||
    dayFromText(normalized) ||
    timeWindowFromText(normalized)
  ) {
    return "";
  }

  const stripped = raw.replace(
    /^(меня зовут|это|пациент|пациентка|имя и фамилия|имя фамилия|запишите|зовут)\s+/i,
    ""
  );
  const words = stripped.split(/\s+/).filter((word) => /^[А-Яа-яЁё\-]+$/.test(word));
  if (words.length < 2) {
    return "";
  }
  return words.slice(0, 3).join(" ");
}

function getTraumaPointIdentityPrompt() {
  return "Поняла, вам нужно в травмпункт, который находится по адресу: Москва, Последний переулок, 28. Подскажите, имя и фамилию пациента.";
}

function getWelcomePrompt() {
  return "Здравствуйте. Я голосовой ассистент сети клиник «Будь здоров». Расскажите, что вас беспокоит.";
}

function shouldForceUrgencyClarification(symptoms, decision, turns = 0) {
  const text = normalize(symptoms);
  if (!text || turns > 0) {
    return false;
  }

  if (decision !== "Травматолог-ортопед" && decision !== "Травмпункт") {
    return false;
  }

  const hasAcuteTraumaCue = ACUTE_TRAUMA_CUE_FRAGMENTS.some((fragment) => text.includes(fragment));
  const hasEmergencyCue = EMERGENCY_TRAUMA_CUE_FRAGMENTS.some((fragment) => text.includes(fragment));
  const hasPlannedCue = PLANNED_ORTHO_CUE_FRAGMENTS.some((fragment) => text.includes(fragment));

  return hasAcuteTraumaCue && !hasEmergencyCue && !hasPlannedCue;
}

function getUrgencyClarificationPrompt() {
  return "Уточню, пожалуйста: травма произошла сегодня, есть выраженный отек, деформация, кровотечение или невозможно наступить либо двигать конечностью?";
}

function inferProfileDecisionFromLocalSignals(symptoms) {
  const text = normalize(symptoms);
  if (!text) {
    return "";
  }

  const hasAcuteTraumaCue = ACUTE_TRAUMA_CUE_FRAGMENTS.some((fragment) => text.includes(fragment));
  const hasEmergencyCue = EMERGENCY_TRAUMA_CUE_FRAGMENTS.some((fragment) => text.includes(fragment));
  const hasPlannedCue = PLANNED_ORTHO_CUE_FRAGMENTS.some((fragment) => text.includes(fragment));
  const heuristicSpecialty = detectSpecialtyBySymptoms(text);

  if (hasEmergencyCue && (hasAcuteTraumaCue || heuristicSpecialty)) {
    return "Травмпункт";
  }

  if (hasAcuteTraumaCue || hasPlannedCue || heuristicSpecialty === "Травматолог-ортопед") {
    return "Травматолог-ортопед";
  }

  return "";
}

function applyProfileSafetyOverride(symptoms, decision, turns = 0) {
  const localDecision = inferProfileDecisionFromLocalSignals(symptoms);
  if (!localDecision) {
    return decision;
  }

  if (decision === "NOT_PROFILE" || !decision) {
    if (shouldForceUrgencyClarification(symptoms, localDecision, turns)) {
      return "NEED_INFO";
    }
    return localDecision;
  }

  return decision;
}

function hasSymptomCue(text) {
  const normalized = normalize(text);
  return SYMPTOM_CUE_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function isLikelyIncompleteSymptoms(text) {
  const normalized = normalize(text);
  if (!normalized) {
    return true;
  }

  if (LOW_SIGNAL_UTTERANCES.has(normalized)) {
    return true;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return false;
  }

  if (hasSymptomCue(normalized)) {
    return false;
  }

  return normalized.length <= 6;
}

function detectSpecialtyBySymptoms(symptoms) {
  const text = normalize(symptoms);
  let best = "";
  let bestScore = 0;

  for (const [specialty, keywords] of Object.entries(specialtyRules)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = specialty;
      bestScore = score;
    }
  }

  return best;
}

function slotMatchesWindow(slotTime, windowToken) {
  if (!windowToken) {
    return true;
  }
  const hour = Number(slotTime.split(":")[0]);
  if (windowToken === "morning") {
    return hour >= 8 && hour < 12;
  }
  if (windowToken === "afternoon") {
    return hour >= 12 && hour < 17;
  }
  if (windowToken === "evening") {
    return hour >= 17 && hour <= 21;
  }
  return true;
}

function slotTimeToMinutes(slotTime) {
  const [hoursRaw, minutesRaw] = String(slotTime || "").split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return -1;
  }
  return hours * 60 + minutes;
}

function slotIsStillAvailable(slot) {
  if (!slot || slot.day !== "today") {
    return true;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotTimeToMinutes(slot.time) > currentMinutes;
}

function slotDayRank(dayToken) {
  if (dayToken === "today") {
    return 0;
  }
  if (dayToken === "tomorrow") {
    return 1;
  }
  if (dayToken === "day_after_tomorrow") {
    return 2;
  }
  return 9;
}

function pickBooking() {
  if (!state.specialty) {
    return null;
  }

  const candidates = clinics.filter((clinic) => clinic.doctors[state.specialty]);
  if (!candidates.length) {
    return null;
  }

  const preferredExactMinutes = state.preferredExactTime ? slotTimeToMinutes(state.preferredExactTime) : -1;
  const candidateSlots = [];

  for (const clinic of candidates) {
    const slots = clinic.doctors[state.specialty];
    const futureSlots = slots.filter((slot) => slotIsStillAvailable(slot));
    for (const slot of futureSlots) {
      if (state.preferredDay && slot.day !== state.preferredDay) {
        continue;
      }
      if (state.preferredWindow && !slotMatchesWindow(slot.time, state.preferredWindow)) {
        continue;
      }

      candidateSlots.push({
        clinicName: clinic.name,
        district: clinic.district,
        address: clinic.address,
        specialty: state.specialty,
        day: slot.day,
        time: slot.time
      });
    }
  }

  if (!candidateSlots.length) {
    return null;
  }

  candidateSlots.sort((a, b) => {
    const districtPenaltyA = state.district && a.district !== state.district ? 1 : 0;
    const districtPenaltyB = state.district && b.district !== state.district ? 1 : 0;
    if (districtPenaltyA !== districtPenaltyB) {
      return districtPenaltyA - districtPenaltyB;
    }

    const dayRankA = slotDayRank(a.day);
    const dayRankB = slotDayRank(b.day);
    if (!state.preferredDay && dayRankA !== dayRankB) {
      return dayRankA - dayRankB;
    }

    if (preferredExactMinutes >= 0) {
      const timeA = slotTimeToMinutes(a.time);
      const timeB = slotTimeToMinutes(b.time);
      const diffA = Math.abs(timeA - preferredExactMinutes);
      const diffB = Math.abs(timeB - preferredExactMinutes);
      if (diffA !== diffB) {
        return diffA - diffB;
      }

      const beforeA = timeA < preferredExactMinutes ? 1 : 0;
      const beforeB = timeB < preferredExactMinutes ? 1 : 0;
      if (beforeA !== beforeB) {
        return beforeA - beforeB;
      }
    }

    const timeA = slotTimeToMinutes(a.time);
    const timeB = slotTimeToMinutes(b.time);
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return String(a.clinicName).localeCompare(String(b.clinicName), "ru");
  });

  const chosen = candidateSlots[0] || null;
  if (chosen) {
    return chosen;
  }

  return null;
}

function renderSummary() {
  const rows = [
    ["Жалобы", state.symptoms || "-"],
    ["Профиль врача", state.specialty || "-"],
    ["Район", state.district || "любой"],
    ["Предпочтение по дню", state.preferredDay ? dayLabel(state.preferredDay) : "-"],
    [
      "Предпочтение по времени",
      state.preferredExactTime
        ? state.preferredExactTime
        : state.preferredWindow === "morning"
          ? "утро"
          : state.preferredWindow === "afternoon"
            ? "день"
            : state.preferredWindow === "evening"
              ? "вечер"
              : "-"
    ],
    ["Пациент", state.patientName || "-"],
    ["Телефон", state.phone || "-"]
  ];

  summaryEl.innerHTML = rows
    .map(
      ([label, value]) =>
        `<div class="summary-item"><span class="label">${label}</span><span class="value">${value}</span></div>`
    )
    .join("");
}

function renderHistory() {
  if (!state.history.length) {
    historyEl.innerHTML = '<div class="summary-item">Пока нет подтвержденных записей.</div>';
    return;
  }

  historyEl.innerHTML = state.history
    .slice()
    .reverse()
    .map((item) => {
      return `
      <div class="history-item">
        <div><strong>${item.name}</strong> • ${item.specialty}</div>
        <div class="muted">${item.clinic}, ${item.address}</div>
        <div class="muted">${item.dateLabel} в ${item.time} • ${item.phone}</div>
      </div>`;
    })
    .join("");
}

function addMessage(role, text) {
  dialogHistory.push({
    role,
    text: String(text || "")
  });
  if (dialogHistory.length > 16) {
    dialogHistory.splice(0, dialogHistory.length - 16);
  }

  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = text;
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function rankVoice(voice) {
  const name = String(voice?.name || "").toLowerCase();
  let score = 0;
  if (voice?.lang === "ru-RU") {
    score += 80;
  }
  if (String(voice?.lang || "").toLowerCase().startsWith("ru")) {
    score += 40;
  }
  if (name.includes("yandex")) {
    score += 40;
  }
  if (name.includes("google")) {
    score += 35;
  }
  if (name.includes("microsoft")) {
    score += 25;
  }
  if (name.includes("alena") || name.includes("milena") || name.includes("irina") || name.includes("anna")) {
    score += 12;
  }
  return score;
}

function getRussianVoices() {
  if (!window.speechSynthesis) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  return voices
    .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("ru"))
    .sort((a, b) => rankVoice(b) - rankVoice(a));
}

function prepareTextForSpeech(text) {
  let out = String(text || "");
  for (const [pattern, replacement] of speechReplacements) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s*•\s*/g, ". ").trim();
}

function updateRateLabel() {
  if (speechRateValue) {
    speechRateValue.textContent = `${currentSpeechRate.toFixed(2)}x`;
  }
}

function populateBrowserVoiceSelect() {
  if (!voiceSelect) {
    return;
  }

  const ruVoices = getRussianVoices();
  voiceSelect.innerHTML = "";

  if (!ruVoices.length) {
    const option = document.createElement("option");
    option.textContent = "Русский голос недоступен";
    option.value = "";
    voiceSelect.appendChild(option);
    voiceSelect.disabled = true;
    selectedVoice = null;
    selectedVoiceName = "";
    return;
  }

  voiceSelect.disabled = false;
  ruVoices.forEach((voice, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  let index = 0;
  if (selectedVoiceName) {
    const existing = ruVoices.findIndex((voice) => voice.name === selectedVoiceName);
    if (existing >= 0) {
      index = existing;
    }
  }

  voiceSelect.value = String(index);
  selectedVoice = ruVoices[index];
  selectedVoiceName = selectedVoice.name;
}

function populateYandexVoiceSelect() {
  if (!voiceSelect) {
    return;
  }

  voiceSelect.innerHTML = "";
  voiceSelect.disabled = false;

  yandexVoices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.id;
    option.textContent = voice.label;
    voiceSelect.appendChild(option);
  });

  const exists = yandexVoices.some((voice) => voice.id === currentYandexVoice);
  if (!exists) {
    currentYandexVoice = yandexVoices[0].id;
  }
  voiceSelect.value = currentYandexVoice;
}

function syncVoiceSelectByProvider() {
  populateYandexVoiceSelect();
}

async function checkYandexTtsHealth() {
  try {
    const res = await fetch("/api/tts/health", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("health check failed");
    }
    const payload = await res.json();
    yandexTtsConfigured = Boolean(payload.configured);
  } catch (e) {
    yandexTtsConfigured = false;
  }
}

async function detectSpecialtyBySymptomsAi(symptoms) {
  const text = String(symptoms || "").trim();
  if (!text) {
    return "";
  }

  try {
    const res = await fetch("/api/specialty/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      let details = {};
      try {
        details = await res.json();
      } catch (e) {
        // ignore
      }

      const fallbackSpecialty = detectSpecialtyBySymptoms(text);
      if (res.status === 403 || details?.error === "yandex_gpt_failed") {
        if (!aiClassifierFallbackNotified) {
          aiClassifierFallbackNotified = true;
          assistantReply(
            "Нейросетевая классификация YandexGPT сейчас недоступна по правам доступа. Временно использую резервный режим маршрутизации."
          );
        }
        return fallbackSpecialty;
      }

      throw new Error(`specialty_classify_${res.status}`);
    }

    const payload = await res.json();
    const specialty = String(payload?.specialty || "").trim();
    if (specialty === "Травматолог-ортопед" || specialty === "Травмпункт") {
      return specialty;
    }
    return detectSpecialtyBySymptoms(text);
  } catch (e) {
    console.warn("Specialty classification failed:", e?.message || e);
    const fallbackSpecialty = detectSpecialtyBySymptoms(text);
    if (!fallbackSpecialty && aiClassifierFallbackNotified) {
      return "";
    }
    if (!aiClassifierFallbackNotified) {
      aiClassifierFallbackNotified = true;
      assistantReply(
        "Нейросетевая классификация YandexGPT сейчас недоступна. Временно использую резервный режим маршрутизации."
      );
    }
    return fallbackSpecialty;
  }
}

async function triageRouteAi(symptoms, extra = "", turns = 0) {
  const baseSymptoms = String(symptoms || "").trim();
  const extraInfo = String(extra || "").trim();
  if (!baseSymptoms) {
    return { decision: "", question: "" };
  }

  try {
    const res = await fetch("/api/triage/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        symptoms: baseSymptoms,
        extra: extraInfo,
        turns
      })
    });

    if (!res.ok) {
      let details = {};
      try {
        details = await res.json();
      } catch (e) {
        // ignore
      }

      const fallbackSpecialty = await detectSpecialtyBySymptomsAi(`${baseSymptoms} ${extraInfo}`.trim());
      if (fallbackSpecialty) {
        return { decision: fallbackSpecialty, question: "" };
      }
      if (details?.error === "yandex_gpt_failed" || res.status === 403) {
        return { decision: "", question: "" };
      }
      throw new Error(`triage_route_${res.status}`);
    }

    const payload = await res.json();
    return {
      decision: String(payload?.decision || "").trim(),
      question: String(payload?.question || "").trim()
    };
  } catch (e) {
    console.warn("Triage route failed:", e?.message || e);
    const fallbackSpecialty = await detectSpecialtyBySymptomsAi(`${baseSymptoms} ${extraInfo}`.trim());
    return {
      decision: fallbackSpecialty,
      question: ""
    };
  }
}

function normalizeDialogDistrict(value) {
  const t = normalize(value);
  if (!t) {
    return "";
  }
  if (["центр", "центральный", "цао"].includes(t)) {
    return "центр";
  }
  if (["север", "северный"].includes(t)) {
    return "север";
  }
  if (["северо-запад", "северо запад", "сзао"].includes(t)) {
    return "северо-запад";
  }
  if (["юго-запад", "юго запад", "юзао"].includes(t)) {
    return "юго-запад";
  }
  if (["юг", "южный", "юао"].includes(t)) {
    return "юг";
  }
  if (["юго-восток", "юго восток", "ювао"].includes(t)) {
    return "юго-восток";
  }
  return "";
}

function normalizeDialogDay(value) {
  const t = normalize(value);
  if (!t) {
    return "";
  }
  if (t === "today" || t === "сегодня") {
    return "today";
  }
  if (t === "tomorrow" || t === "завтра") {
    return "tomorrow";
  }
  if (t === "day_after_tomorrow" || t === "day-after-tomorrow" || t === "послезавтра") {
    return "day_after_tomorrow";
  }
  return "";
}

function normalizeDialogTimeWindow(value) {
  const t = normalize(value);
  if (!t) {
    return "";
  }
  if (t === "morning" || t === "утро") {
    return "morning";
  }
  if (t === "afternoon" || t === "day" || t === "день" || t === "после обеда") {
    return "afternoon";
  }
  if (t === "evening" || t === "вечер") {
    return "evening";
  }
  return "";
}

function sanitizeDialogPatientName(value) {
  const raw = String(value || "")
    .trim()
    .replace(/[.,!?;:]+/g, " ")
    .replace(/\s+/g, " ");
  if (!raw || /\d/.test(raw)) {
    return "";
  }
  const words = raw.split(/\s+/).filter((word) => /^[А-Яа-яЁё\-]+$/.test(word));
  if (words.length < 2) {
    return "";
  }
  return words.slice(0, 3).join(" ");
}

function looksLikeOpenQuestion(text) {
  const t = normalize(text);
  if (!t) {
    return false;
  }
  return (
    t.includes("?") ||
    t.includes("какие") ||
    t.includes("какой") ||
    t.includes("какая") ||
    t.includes("какое") ||
    t.includes("какие врачи") ||
    t.includes("какой врач") ||
    t.includes("специалист") ||
    t.includes("врач") ||
    t.includes("где") ||
    t.includes("рядом") ||
    t.includes("около") ||
    t.includes("возле") ||
    t.includes("ближе") ||
    t.includes("филиал") ||
    t.includes("отделени") ||
    t.includes("адрес")
  );
}

function getDialogClinicCatalog() {
  return clinics.map((clinic) => ({
    name: clinic.name,
    district: clinic.district,
    address: clinic.address,
    specialties: Object.keys(clinic.doctors || {})
  }));
}

function getDialogStateSnapshot() {
  return {
    step: state.step,
    symptoms: state.symptoms || state.pendingSymptoms,
    specialty: state.specialty,
    district: state.district,
    preferredDay: state.preferredDay,
    preferredWindow: state.preferredWindow,
    preferredExactTime: state.preferredExactTime,
    patientName: state.patientName,
    booking: state.booking
      ? {
          clinicName: state.booking.clinicName,
          district: state.booking.district,
          address: state.booking.address,
          specialty: state.booking.specialty,
          day: state.booking.day,
          time: state.booking.time
        }
      : null
  };
}

async function guideDialogAi(userMessage) {
  const text = String(userMessage || "").trim();
  if (!text) {
    return null;
  }

  try {
    const res = await fetch("/api/dialog/guide", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userMessage: text,
        currentStep: state.step,
        state: getDialogStateSnapshot(),
        history: dialogHistory.slice(-8),
        clinics: getDialogClinicCatalog()
      })
    });

    if (!res.ok) {
      return null;
    }

    const payload = await res.json();
    return {
      reply: String(payload?.reply || "").trim(),
      district: normalizeDialogDistrict(payload?.district),
      day: normalizeDialogDay(payload?.day),
      timeWindow: normalizeDialogTimeWindow(payload?.timeWindow),
      patientName: sanitizeDialogPatientName(payload?.patientName),
      understood: payload?.understood !== false
    };
  } catch (e) {
    console.warn("Dialog guide failed:", e?.message || e);
    return null;
  }
}

function proceedAfterSpecialtyDecision() {
  if (!state.pendingSymptoms) {
    return false;
  }

  state.symptoms = state.pendingSymptoms;
  state.pendingSymptoms = "";
  state.urgencyNotes = "";
  state.triageTurns = 0;

  if (state.specialty === "Травмпункт") {
    state.district = "центр";
    state.step = "collecting_patient_name";
    assistantReply(getTraumaPointIdentityPrompt());
    renderSummary();
    return true;
  }

  if (state.specialty === "Травматолог-ортопед") {
    state.step = "collecting_location";
    assistantReply(`Поняла. По описанию симптомов рекомендую: ${state.specialty}. В каком районе вам удобнее?`);
    renderSummary();
    return true;
  }

  return false;
}

function resolveRussianVoice() {
  if (selectedVoice) {
    return selectedVoice;
  }
  const ruVoices = getRussianVoices();
  selectedVoice = ruVoices[0] || null;
  selectedVoiceName = selectedVoice ? selectedVoice.name : "";
  return selectedVoice;
}

function clearSpeech() {
  speechSessionId += 1;
  sttSessionId += 1;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (activeAudio) {
    playbackCancelledAt = Date.now();
    try {
      activeAudio.pause();
      activeAudio.src = "";
    } catch (e) {
      // ignore cleanup errors
    }
    activeAudio = null;
  }
  speechQueue = Promise.resolve();
  isSpeaking = false;
  suppressRecognitionRestart = false;
  shouldResumeListeningAfterSpeech = false;
  clearRecognitionBuffer();
  cancelSttCapture(true);
  if (recognitionRestartTimer) {
    clearTimeout(recognitionRestartTimer);
    recognitionRestartTimer = null;
  }
}

function stopBargeInLoop() {
  if (bargeInRafId) {
    cancelAnimationFrame(bargeInRafId);
    bargeInRafId = 0;
  }
  bargeInSpeechMs = 0;
  bargeInLastTs = 0;
  bargeInNoiseFloor = 0.008;
}

function releaseBargeInResources() {
  stopBargeInLoop();
  cancelSttCapture(false);
  sttRequestInFlight = false;
  sttPreRollChunks = [];
  sttPreRollFrames = 0;
  if (bargeInProcessor) {
    try {
      bargeInProcessor.disconnect();
    } catch (e) {
      // ignore
    }
    bargeInProcessor.onaudioprocess = null;
    bargeInProcessor = null;
  }
  if (bargeInSilentGain) {
    try {
      bargeInSilentGain.disconnect();
    } catch (e) {
      // ignore
    }
    bargeInSilentGain = null;
  }
  if (bargeInSource) {
    try {
      bargeInSource.disconnect();
    } catch (e) {
      // ignore
    }
    bargeInSource = null;
  }
  if (bargeInAnalyser) {
    try {
      bargeInAnalyser.disconnect();
    } catch (e) {
      // ignore
    }
    bargeInAnalyser = null;
  }
  if (bargeInStream) {
    bargeInStream.getTracks().forEach((track) => track.stop());
    bargeInStream = null;
  }
  if (bargeInAudioContext) {
    try {
      bargeInAudioContext.close();
    } catch (e) {
      // ignore
    }
    bargeInAudioContext = null;
  }
  bargeInData = null;
}

async function ensureBargeInMonitor() {
  if (bargeInAnalyser && bargeInData) {
    return true;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    bargeInStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return false;
    }

    bargeInAudioContext = new Ctx();
    if (bargeInAudioContext.state === "suspended") {
      await bargeInAudioContext.resume();
    }
    bargeInSource = bargeInAudioContext.createMediaStreamSource(bargeInStream);
    bargeInAnalyser = bargeInAudioContext.createAnalyser();
    bargeInAnalyser.fftSize = 1024;
    bargeInAnalyser.smoothingTimeConstant = 0.2;
    micInputSampleRate = bargeInAudioContext.sampleRate || STT_TARGET_SAMPLE_RATE;
    bargeInProcessor = bargeInAudioContext.createScriptProcessor(4096, 1, 1);
    bargeInSilentGain = bargeInAudioContext.createGain();
    bargeInSilentGain.gain.value = 0;
    bargeInSource.connect(bargeInAnalyser);
    bargeInSource.connect(bargeInProcessor);
    bargeInProcessor.connect(bargeInSilentGain);
    bargeInSilentGain.connect(bargeInAudioContext.destination);
    bargeInProcessor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      if (!input || !input.length) {
        return;
      }
      const chunk = new Float32Array(input.length);
      chunk.set(input);
      handleMicAudioChunk(chunk);
    };
    bargeInData = new Uint8Array(bargeInAnalyser.fftSize);
    return true;
  } catch (e) {
    releaseBargeInResources();
    return false;
  }
}

function pushPreRollChunk(chunk) {
  if (!chunk?.length) {
    return;
  }
  sttPreRollChunks.push(chunk);
  sttPreRollFrames += chunk.length;

  const maxFrames = Math.round((micInputSampleRate * USER_PREROLL_MS) / 1000);
  while (sttPreRollFrames > maxFrames && sttPreRollChunks.length) {
    const removed = sttPreRollChunks.shift();
    sttPreRollFrames -= removed.length;
  }
}

function handleMicAudioChunk(chunk) {
  if (!micActive || isSpeaking || !chunk?.length) {
    return;
  }

  if (sttCaptureActive) {
    sttFloatChunks.push(chunk);
    return;
  }

  pushPreRollChunk(chunk);
}

function beginSttCapture(usePreRoll = true) {
  if (sttCaptureActive || sttRequestInFlight || isSpeaking) {
    return;
  }

  sttCaptureActive = true;
  sttCaptureStartedAt = Date.now();
  sttSpeechMs = USER_SPEECH_START_HOLD_MS;
  sttSilenceMs = 0;
  sttFloatChunks = usePreRoll ? [...sttPreRollChunks] : [];
}

function cancelSttCapture(clearPreRoll = true) {
  sttCaptureActive = false;
  sttCaptureStartedAt = 0;
  sttSpeechMs = 0;
  sttSilenceMs = 0;
  sttFloatChunks = [];
  if (clearPreRoll) {
    sttPreRollChunks = [];
    sttPreRollFrames = 0;
  }
}

function mergeFloat32Chunks(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function resampleFloat32Buffer(source, inputRate, outputRate) {
  if (inputRate === outputRate) {
    return source;
  }

  const ratio = inputRate / outputRate;
  const targetLength = Math.max(1, Math.round(source.length / ratio));
  const out = new Float32Array(targetLength);
  let sourceOffset = 0;

  for (let i = 0; i < targetLength; i += 1) {
    const nextSourceOffset = Math.min(source.length, Math.round((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = sourceOffset; j < nextSourceOffset; j += 1) {
      sum += source[j];
      count += 1;
    }
    out[i] = count ? sum / count : source[Math.min(source.length - 1, sourceOffset)] || 0;
    sourceOffset = nextSourceOffset;
  }

  return out;
}

function encodePcm16(samples) {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, value < 0 ? value * 0x8000 : value * 0x7fff, true);
  }
  return buffer;
}

async function transcribeCapturedAudio(chunks, sessionId) {
  if (!chunks.length) {
    return;
  }

  const merged = mergeFloat32Chunks(chunks);
  const resampled = resampleFloat32Buffer(merged, micInputSampleRate, STT_TARGET_SAMPLE_RATE);
  const estimatedMs = (resampled.length / STT_TARGET_SAMPLE_RATE) * 1000;
  if (estimatedMs < USER_SPEECH_MIN_MS) {
    return;
  }

  sttRequestInFlight = true;
  try {
    const response = await fetch(`/api/stt?sampleRate=${STT_TARGET_SAMPLE_RATE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream"
      },
      body: encodePcm16(resampled)
    });

    if (!response.ok) {
      let details = {};
      try {
        details = await response.json();
      } catch (e) {
        // ignore
      }
      const status = details?.status || response.status;
      if (!yandexSttFailureNotified) {
        yandexSttFailureNotified = true;
        if (status === 401 || status === 403) {
          assistantReply("Yandex SpeechKit STT недоступен по правам доступа. Для сервисного аккаунта нужны роль ai.speechkit-stt.user и scope yc.ai.speechkitStt.execute.");
        } else {
          assistantReply("Не удалось распознать речь через Yandex SpeechKit. Проверьте ключ и доступ к STT.");
        }
      }
      return;
    }

    yandexSttFailureNotified = false;
    const payload = await response.json();
    if (sessionId !== sttSessionId) {
      return;
    }
    const text = String(payload?.text || "").trim();
    if (text) {
      handleConversation(text);
    }
  } catch (e) {
    if (!yandexSttFailureNotified) {
      yandexSttFailureNotified = true;
      assistantReply("Временная ошибка Yandex SpeechKit STT. Попробуйте еще раз.");
    }
  } finally {
    sttRequestInFlight = false;
  }
}

function finalizeSttCapture() {
  if (!sttCaptureActive) {
    return;
  }

  const chunks = sttFloatChunks;
  const sessionId = sttSessionId;
  cancelSttCapture(true);
  void transcribeCapturedAudio(chunks, sessionId);
}

function interruptAssistantForBargeIn() {
  if (!isSpeaking) {
    return;
  }

  speechSessionId += 1;
  speechQueue = Promise.resolve();
  playbackCancelledAt = Date.now();
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.src = "";
    } catch (e) {
      // ignore
    }
    activeAudio = null;
  }
  endAssistantSpeech();
  beginSttCapture(false);
}

function startBargeInLoop() {
  if (bargeInRafId || !bargeInAnalyser || !bargeInData) {
    return;
  }

  const tick = (ts) => {
    bargeInRafId = requestAnimationFrame(tick);
    if (!micActive || !bargeInAnalyser || !bargeInData) {
      bargeInSpeechMs = 0;
      return;
    }

    if (!bargeInLastTs) {
      bargeInLastTs = ts;
    }
    const dt = Math.min(50, Math.max(0, ts - bargeInLastTs));
    bargeInLastTs = ts;

    bargeInAnalyser.getByteTimeDomainData(bargeInData);
    let sum = 0;
    for (let i = 0; i < bargeInData.length; i += 1) {
      const centered = (bargeInData[i] - 128) / 128;
      sum += centered * centered;
    }
    const rms = Math.sqrt(sum / bargeInData.length);
    const sttStartThreshold = Math.max(BARGE_IN_MIN_RMS_THRESHOLD, bargeInNoiseFloor * BARGE_IN_RMS_MULTIPLIER);
    const sttContinueThreshold = Math.max(STT_CONTINUE_MIN_RMS_THRESHOLD, bargeInNoiseFloor * STT_CONTINUE_RMS_MULTIPLIER);

    if (!isSpeaking) {
      const speechLikeRms = sttCaptureActive ? rms >= sttContinueThreshold : rms >= sttStartThreshold;
      if (!speechLikeRms) {
        bargeInNoiseFloor = bargeInNoiseFloor * 0.992 + rms * 0.008;
      } else {
        bargeInNoiseFloor = bargeInNoiseFloor * 0.999 + Math.min(rms, bargeInNoiseFloor) * 0.001;
      }
      bargeInSpeechMs = Math.max(0, bargeInSpeechMs - dt * 2);
      if (sttRequestInFlight) {
        sttSpeechMs = 0;
        sttSilenceMs = 0;
        return;
      }

      if (!sttCaptureActive) {
        if (rms >= sttStartThreshold) {
          sttSpeechMs += dt;
          sttSilenceMs = 0;
          if (sttSpeechMs >= USER_SPEECH_START_HOLD_MS) {
            beginSttCapture(true);
          }
        } else {
          sttSpeechMs = Math.max(0, sttSpeechMs - dt);
        }
      } else {
        if (rms >= sttContinueThreshold) {
          sttSilenceMs = 0;
        } else if (Date.now() - sttCaptureStartedAt >= STT_MIN_CAPTURE_BEFORE_SILENCE_MS) {
          sttSilenceMs += dt;
          if (sttSilenceMs >= USER_SPEECH_END_SILENCE_MS) {
            finalizeSttCapture();
          }
        }
      }

      if (sttCaptureActive && Date.now() - sttCaptureStartedAt >= USER_SPEECH_MAX_MS) {
        finalizeSttCapture();
      }
      return;
    }

    if (Date.now() - assistantSpeechStartedAt < BARGE_IN_ENABLE_AFTER_MS) {
      bargeInSpeechMs = 0;
      return;
    }

    const dynamicThreshold = Math.max(BARGE_IN_MIN_RMS_THRESHOLD, bargeInNoiseFloor * BARGE_IN_RMS_MULTIPLIER);
    if (rms >= dynamicThreshold) {
      bargeInSpeechMs += dt;
      if (bargeInSpeechMs >= BARGE_IN_HOLD_MS) {
        bargeInSpeechMs = 0;
        interruptAssistantForBargeIn();
      }
      return;
    }

    bargeInSpeechMs = Math.max(0, bargeInSpeechMs - dt * 2);
  };

  bargeInRafId = requestAnimationFrame(tick);
}

function clearRecognitionBuffer() {
  if (recognitionCommitTimer) {
    clearTimeout(recognitionCommitTimer);
    recognitionCommitTimer = null;
  }
  recognitionStableText = "";
  recognitionLiveTail = "";
  recognitionLiveSnapshot = "";
  recognitionInterimByIndex.clear();
}

function normalizeSpeechForCompare(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-zа-яё0-9+\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeNormalizedText(text) {
  const normalized = normalizeSpeechForCompare(text);
  return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
}

function countLeadingTokenMatches(tokensA, tokensB) {
  let matches = 0;
  const limit = Math.min(tokensA.length, tokensB.length);
  for (let i = 0; i < limit; i += 1) {
    if (tokensA[i] !== tokensB[i]) {
      break;
    }
    matches += 1;
  }
  return matches;
}

function hasAssistantLikePrefix(recognizedTokens, assistantTokens) {
  if (!recognizedTokens.length || !assistantTokens.length) {
    return false;
  }

  const leadingMatches = countLeadingTokenMatches(recognizedTokens, assistantTokens);
  if (leadingMatches >= 2) {
    return true;
  }

  if (recognizedTokens.length <= 2 && recognizedTokens[0] === assistantTokens[0]) {
    return true;
  }

  const assistantLeading = new Set(assistantTokens.slice(0, 6));
  let shared = 0;
  for (const token of recognizedTokens.slice(0, 6)) {
    if (assistantLeading.has(token)) {
      shared += 1;
    }
  }
  return shared >= 4;
}

function findCurrentStepCueIndex(tokens, textNorm) {
  if (!tokens.length) {
    return -1;
  }

  if (state.step === "collecting_symptoms" || (state.step === "done" && !state.symptoms)) {
    const specialtyFragments = Object.values(specialtyRules).flat();
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      const isSymptomToken =
        SYMPTOM_CUE_FRAGMENTS.some((fragment) => token.includes(fragment)) ||
        specialtyFragments.some((fragment) => token.includes(fragment));
      if (isSymptomToken) {
        return Math.max(0, i - 1);
      }
    }
    return -1;
  }

  if (state.step === "collecting_location") {
    if (extractDistrict(textNorm) === null) {
      return -1;
    }
    const districtFragments = Object.values(districtsMap)
      .flat()
      .flatMap((alias) => normalizeSpeechForCompare(alias).split(/\s+/).filter(Boolean));
    for (let i = 0; i < tokens.length; i += 1) {
      if (districtFragments.some((fragment) => tokens[i].includes(fragment) || fragment.includes(tokens[i]))) {
        return i;
      }
    }
    return 0;
  }

  if (state.step === "collecting_time") {
    const hasTimeCue =
      Boolean(dayFromText(textNorm) || timeWindowFromText(textNorm) || exactTimeFromText(textNorm)) ||
      textNorm.includes("любой") ||
      textNorm.includes("без разницы") ||
      textNorm.includes("не важно");
    if (!hasTimeCue) {
      return -1;
    }
    const timeFragments = [
      "сегодня",
      "завтра",
      "послезавтра",
      "утро",
      "день",
      "вечер",
      "любой",
      "без",
      "разницы",
      "важно",
      "час",
      "часа",
      "в"
    ];
    for (let i = 0; i < tokens.length; i += 1) {
      if (timeFragments.some((fragment) => tokens[i].includes(fragment) || fragment.includes(tokens[i]))) {
        return i;
      }
    }
    return 0;
  }

  return -1;
}

function shouldDropAssistantEcho(recognizedText) {
  const now = Date.now();
  if (!lastAssistantSpokenNorm || now - lastAssistantSpokenAt > ASSISTANT_ECHO_GUARD_MS) {
    return false;
  }

  const recognizedNorm = normalizeSpeechForCompare(recognizedText);
  if (!recognizedNorm) {
    return false;
  }

  if (recognizedNorm === lastAssistantSpokenNorm) {
    return true;
  }

  if (recognizedNorm.length >= 8 && lastAssistantSpokenNorm.startsWith(recognizedNorm)) {
    return true;
  }

  return false;
}

function stripAssistantEcho(recognizedText) {
  const raw = String(recognizedText || "").trim();
  if (!raw) {
    return "";
  }

  const now = Date.now();
  const recognizedNorm = normalizeSpeechForCompare(raw);
  if (!recognizedNorm) {
    return "";
  }

  if (!lastAssistantSpokenNorm || now - lastAssistantSpokenAt > ASSISTANT_ECHO_GUARD_MS) {
    return raw;
  }

  let cleaned = recognizedNorm;
  const assistantNorm = lastAssistantSpokenNorm;
  let cleanedTokens = tokenizeNormalizedText(cleaned);
  const assistantTokens = tokenizeNormalizedText(assistantNorm);

  if (cleaned === assistantNorm) {
    return "";
  }

  if (cleaned.startsWith(`${assistantNorm} `)) {
    cleaned = cleaned.slice(assistantNorm.length).trim();
  }

  if (cleaned.endsWith(` ${assistantNorm}`)) {
    cleaned = cleaned.slice(0, cleaned.length - assistantNorm.length).trim();
  }

  cleanedTokens = tokenizeNormalizedText(cleaned);

  const cueIndex = findCurrentStepCueIndex(cleanedTokens, cleaned);
  const assistantLikePrefix = hasAssistantLikePrefix(cleanedTokens, assistantTokens);
  if (cueIndex > 0 && assistantLikePrefix) {
    return cleanedTokens.slice(cueIndex).join(" ").trim();
  }

  if (assistantLikePrefix && cueIndex < 0) {
    return "";
  }

  if (cleanedTokens.length <= 2 && cleanedTokens.every((token) => assistantTokens.slice(0, 5).includes(token))) {
    return "";
  }

  if (assistantNorm.startsWith(cleaned) && cleaned.length >= 8) {
    return "";
  }

  return cleaned || "";
}

function shouldDropDuplicateUserTurn(userTextNorm, step) {
  const now = Date.now();
  if (!userTextNorm || !step) {
    return false;
  }
  if (now - lastUserTurnAt > USER_DUPLICATE_WINDOW_MS) {
    return false;
  }
  return lastUserTurnNorm === userTextNorm && lastUserTurnStep === step;
}

function rememberUserTurn(userTextNorm, step) {
  if (!userTextNorm || !step) {
    return;
  }
  lastUserTurnNorm = userTextNorm;
  lastUserTurnStep = step;
  lastUserTurnAt = Date.now();
}

function composeRecognitionText() {
  return `${recognitionStableText} ${recognitionLiveTail}`.replace(/\s+/g, " ").trim();
}

function scheduleRecognitionCommit(delayMs = USER_SPEECH_IDLE_MS) {
  if (recognitionCommitTimer) {
    clearTimeout(recognitionCommitTimer);
  }

  recognitionCommitTimer = setTimeout(() => {
    const readyText = composeRecognitionText();
    const filteredText = stripAssistantEcho(readyText);
    recognitionCommitTimer = null;
    recognitionStableText = "";
    recognitionLiveTail = "";
    recognitionLiveSnapshot = "";

    if (filteredText && !shouldDropAssistantEcho(filteredText)) {
      handleConversation(filteredText);
    }
  }, delayMs);
}

function beginAssistantSpeech() {
  clearRecognitionBuffer();
  cancelSttCapture(false);
  isSpeaking = true;
  assistantSpeechStartedAt = Date.now();
  if (STOP_RECOGNITION_DURING_ASSISTANT_SPEECH && micActive && recognition) {
    shouldResumeListeningAfterSpeech = true;
    suppressRecognitionRestart = true;
    try {
      recognition.stop();
    } catch (e) {
      // ignore stop race
    }
  }
}

function startRecognitionWithRetry(attempt = 0) {
  if (!recognition || !micActive || isSpeaking || recognitionRunning) {
    return;
  }

  try {
    recognition.start();
  } catch (e) {
    if (attempt < 4) {
      setTimeout(() => startRecognitionWithRetry(attempt + 1), 120);
      return;
    }
    micActive = false;
    setMicState(false);
  }
}

function scheduleRecognitionRestart(delayMs = 0) {
  if (!recognition || !micActive || isSpeaking) {
    return;
  }
  if (recognitionRestartTimer) {
    clearTimeout(recognitionRestartTimer);
  }
  recognitionRestartTimer = setTimeout(() => {
    recognitionRestartTimer = null;
    startRecognitionWithRetry(0);
  }, delayMs);
}

function endAssistantSpeech() {
  isSpeaking = false;
  assistantSpeechReleasedAt = Date.now();
  sttSpeechMs = 0;
  sttSilenceMs = 0;
  if (STOP_RECOGNITION_DURING_ASSISTANT_SPEECH && micActive && shouldResumeListeningAfterSpeech && recognition) {
    shouldResumeListeningAfterSpeech = false;
    scheduleRecognitionRestart(RECOGNITION_RESUME_DELAY_MS);
  }
}

function speakWithBrowser(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ru-RU";
    utter.rate = currentSpeechRate;
    utter.pitch = 0.92;

    const voice = selectedVoice || resolveRussianVoice();
    if (voice) {
      utter.voice = voice;
    }

    utter.onstart = () => {
      beginAssistantSpeech();
    };

    const finish = () => {
      endAssistantSpeech();
      resolve(true);
    };

    utter.onend = finish;
    utter.onerror = finish;
    window.speechSynthesis.speak(utter);
  });
}

async function speakWithYandex(text) {
  let audioUrl = "";
  beginAssistantSpeech();
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        voice: currentYandexVoice,
        speed: currentSpeechRate
      })
    });

    if (!response.ok) {
      throw new Error(`yandex_tts_${response.status}`);
    }

    const audioBlob = await response.blob();
    audioUrl = URL.createObjectURL(audioBlob);

    await new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      activeAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("audio_playback_failed"));
      audio.play().catch(reject);
    });

    yandexFailureNotified = false;
    if (activeAudio) {
      activeAudio = null;
    }
    return true;
  } catch (e) {
    const errorText = String(e?.message || e || "");
    const recentCancel = Date.now() - playbackCancelledAt < 1800;
    const manualMicStop = Date.now() - manualMicStopAt < 1800;

    if (errorText.includes("audio_playback_failed") && (recentCancel || manualMicStop || !micActive)) {
      return true;
    }

    if (!yandexFailureNotified) {
      const looksLikeAuthError =
        errorText.includes("yandex_tts_401") || errorText.includes("yandex_tts_403") || errorText.includes("yandex_tts_404");
      console.warn(
        looksLikeAuthError
          ? "Yandex TTS auth error: проверьте YANDEX_API_KEY и YANDEX_FOLDER_ID"
          : "Yandex TTS temporary error"
      );
      yandexFailureNotified = true;
    }
    return false;
  } finally {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    endAssistantSpeech();
  }
}

async function speak(text) {
  const prepared = prepareTextForSpeech(text);
  lastAssistantSpokenNorm = normalizeSpeechForCompare(prepared);
  lastAssistantSpokenAt = Date.now();
  await speakWithYandex(prepared);
}

function assistantReply(text) {
  const mySessionId = speechSessionId;
  speechQueue = speechQueue
    .then(async () => {
      if (mySessionId !== speechSessionId) {
        return;
      }
      addMessage("assistant", text);
      if (mySessionId !== speechSessionId) {
        return;
      }
      await speak(text);
    })
    .catch(() => {
      // keep queue alive
    });
}

function confirmBooking() {
  if (!state.booking || !state.phone) {
    return false;
  }

  const spokenDateLabel = dayLabelForSpeech(state.booking.day);
  const record = {
    name: state.patientName || "Пациент",
    phone: state.phone,
    specialty: state.booking.specialty,
    clinic: state.booking.clinicName,
    address: state.booking.address,
    dateLabel: dayLabel(state.booking.day),
    time: state.booking.time
  };

  state.history.push(record);
  renderHistory();

  assistantReply(
    `Готово. Записала ${record.name} к врачу: ${record.specialty}. ` +
      `Клиника: ${record.clinic}, адрес: ${record.address}. ` +
      `Дата: ${spokenDateLabel}, время: ${record.time}. Контакт: ${record.phone}.`
  );
  assistantReply("Если нужно оформить еще одну запись, нажмите «Новая запись».");
  state.step = "done";
  return true;
}

async function handleConversation(text) {
  const clean = String(text || "").trim();
  if (!clean) {
    return;
  }

  const cleanLower = normalize(clean);
  const stepBefore = state.step || "";
  if (shouldDropDuplicateUserTurn(cleanLower, stepBefore)) {
    return;
  }
  rememberUserTurn(cleanLower, stepBefore);
  addMessage("user", clean);

  if (cleanLower.includes("новая запись") || cleanLower.includes("сначала")) {
    resetConversation(true);
    return;
  }

  const possiblePhone = extractPhone(clean);
  const canUseSingleWordName = state.step === "collecting_contact" || state.step === "confirm_contact";
  const possibleName = extractName(clean, { allowSingleWord: canUseSingleWordName });
  const possibleFullName = extractPatientFullName(clean);
  const district = extractDistrict(clean);
  const day = dayFromText(clean);
  const windowToken = timeWindowFromText(clean);
  const exactTime = exactTimeFromText(clean);
  const noPreference =
    cleanLower.includes("без разницы") || cleanLower.includes("не важно") || cleanLower.includes("любой");

  const shouldUseDialogGuide =
    state.step !== "clarifying_urgency" &&
    (
      state.step === "collecting_location" ||
      state.step === "collecting_time" ||
      state.step === "collecting_patient_name" ||
      looksLikeOpenQuestion(clean)
    );

  const dialogGuide = shouldUseDialogGuide ? await guideDialogAi(clean) : null;
  const guidedDistrict = normalizeDialogDistrict(dialogGuide?.district);
  const resolvedDistrict = district !== null ? district : (guidedDistrict || null);
  const resolvedDay = day || normalizeDialogDay(dialogGuide?.day);
  const resolvedWindow = windowToken || normalizeDialogTimeWindow(dialogGuide?.timeWindow);
  const resolvedFullName = possibleFullName || sanitizeDialogPatientName(dialogGuide?.patientName);

  if (possibleName && !state.patientName) {
    state.patientName = possibleName;
  }

  if (resolvedDistrict !== null) {
    state.district = resolvedDistrict;
  }

  if (resolvedDay) {
    state.preferredDay = resolvedDay;
  }

  if (exactTime) {
    state.preferredExactTime = exactTime;
    if (!resolvedWindow) {
      state.preferredWindow = inferWindowFromExactTime(exactTime);
    }
  } else if (resolvedWindow || noPreference) {
    state.preferredExactTime = "";
  }

  if (resolvedWindow) {
    state.preferredWindow = resolvedWindow;
  }

  const shouldAnswerOpenQuestionFirst =
    Boolean(dialogGuide?.reply) &&
    looksLikeOpenQuestion(clean) &&
    !possiblePhone &&
    !resolvedFullName &&
    !resolvedDay &&
    !resolvedWindow &&
    resolvedDistrict === null;

  if (shouldAnswerOpenQuestionFirst) {
    assistantReply(dialogGuide.reply);
    renderSummary();
    return;
  }

  if (state.step === "collecting_symptoms" && possiblePhone && !state.symptoms) {
    assistantReply("Сначала опишите, что вас беспокоит, чтобы я выбрала профиль врача.");
    renderSummary();
    return;
  }

  if (state.step === "collecting_symptoms" && !state.symptoms && !possiblePhone && isLikelyIncompleteSymptoms(clean)) {
    assistantReply("Не расслышала жалобу. Скажите коротко, например: «подвернул голеностоп после падения».");
    renderSummary();
    return;
  }

  if (!state.symptoms && !possiblePhone && state.step === "collecting_symptoms") {
    state.pendingSymptoms = clean;
    state.urgencyNotes = "";
    state.triageTurns = 0;

    const triage = await triageRouteAi(clean, "", 0);
    const safeDecision = applyProfileSafetyOverride(clean, triage.decision, 0);
    if (!safeDecision) {
      assistantReply("Не удалось определить профиль врача. Повторите жалобу, пожалуйста.");
      renderSummary();
      return;
    }

    if (safeDecision === "NOT_PROFILE") {
      state.pendingSymptoms = "";
      assistantReply(
        "Извините, это не профиль нашей клиники, мы специализируемся только на травматологии и ортопедии."
      );
      renderSummary();
      return;
    }

    if (shouldForceUrgencyClarification(clean, safeDecision, 0) || safeDecision === "NEED_INFO") {
      state.step = "clarifying_urgency";
      state.triageTurns = 1;
      assistantReply(triage.question || getUrgencyClarificationPrompt());
      renderSummary();
      return;
    }

    state.specialty = safeDecision;
    proceedAfterSpecialtyDecision();
    return;
  }

  if (state.step === "clarifying_urgency") {
    state.urgencyNotes = state.urgencyNotes ? `${state.urgencyNotes}. ${clean}` : clean;
    const triage = await triageRouteAi(state.pendingSymptoms, state.urgencyNotes, state.triageTurns);
    const triageText = `${state.pendingSymptoms} ${state.urgencyNotes}`.trim();
    const safeDecision = applyProfileSafetyOverride(triageText, triage.decision, state.triageTurns);

    if (!safeDecision) {
      assistantReply("Не удалось уточнить срочность. Повторите, пожалуйста, есть ли выраженная деформация, кровотечение или невозможно наступить?");
      renderSummary();
      return;
    }

    if (safeDecision === "NEED_INFO" && state.triageTurns < 2) {
      state.triageTurns += 1;
      assistantReply(
        triage.question ||
          "Подскажите еще, пожалуйста: травма произошла сегодня, и вы можете опираться на конечность или двигать ею?"
      );
      renderSummary();
      return;
    }

    if (safeDecision === "NOT_PROFILE") {
      state.pendingSymptoms = "";
      state.urgencyNotes = "";
      state.triageTurns = 0;
      state.step = "collecting_symptoms";
      assistantReply(
        "Извините, это не профиль нашей клиники, мы специализируемся только на травматологии и ортопедии."
      );
      renderSummary();
      return;
    }

    state.specialty =
      safeDecision === "NEED_INFO" ? "Травматолог-ортопед" : safeDecision;
    proceedAfterSpecialtyDecision();
    return;
  }

  if (state.step === "collecting_location") {
    if (resolvedDistrict === null) {
      assistantReply(
        dialogGuide?.reply ||
          "Уточните район: центр, север, северо-запад, юго-запад, юг или юго-восток. Можно сказать «любой»."
      );
      renderSummary();
      return;
    }
    state.step = "collecting_time";
    assistantReply(
      dialogGuide?.reply || "Хорошо. Подскажите, когда удобно: сегодня или завтра, и по времени утро/день/вечер?"
    );
    renderSummary();
    return;
  }

  if (state.step === "collecting_patient_name") {
    if (!resolvedFullName) {
      assistantReply(dialogGuide?.reply || "Назовите, пожалуйста, имя и фамилию пациента.");
      renderSummary();
      return;
    }

    state.patientName = resolvedFullName;
    state.step = "collecting_time";
    assistantReply(
      dialogGuide?.reply || "Спасибо. Подскажите, когда удобно: сегодня или завтра, и по времени утро/день/вечер?"
    );
    renderSummary();
    return;
  }

  if (state.step === "collecting_time") {
    if (!resolvedDay && !resolvedWindow && !noPreference) {
      assistantReply(dialogGuide?.reply || "Не расслышала время. Скажите: сегодня или завтра, и утро/день/вечер.");
      renderSummary();
      return;
    }
    state.booking = pickBooking();
    if (!state.booking) {
      assistantReply("Не нашла свободного слота на это время. Назовите другой день/время или скажите «любой».");
      renderSummary();
      return;
    }

    assistantReply(
      `Могу предложить ${dayLabelForSpeech(state.booking.day)} в ${state.booking.time}, клиника ${state.booking.clinicName}. Вам удобно это время?`
    );
    state.step = "confirm_slot";
    renderSummary();
    return;
  }

  if (state.step === "confirm_slot") {
    if (isNegativeConfirmation(clean)) {
      state.booking = null;
      state.step = "collecting_time";
      assistantReply("Хорошо. Назовите другой день или время: сегодня или завтра, утро/день/вечер.");
      renderSummary();
      return;
    }

    if (!isPositiveConfirmation(clean)) {
      assistantReply("Подскажите, пожалуйста, это время подходит? Можно ответить: «да» или «нет, другое время».");
      renderSummary();
      return;
    }

    const contactPrompt = state.patientName
      ? `Нашла запись: ${state.booking.specialty}, клиника ${state.booking.clinicName} (${state.booking.address}), ${dayLabelForSpeech(state.booking.day)} в ${state.booking.time}. Продиктуйте номер телефона. После этого скажите «подтверждаю».`
      : `Нашла запись: ${state.booking.specialty}, клиника ${state.booking.clinicName} (${state.booking.address}), ${dayLabelForSpeech(state.booking.day)} в ${state.booking.time}. Назовите имя пациента и номер телефона. После этого скажите «подтверждаю».`;
    assistantReply(contactPrompt);
    state.step = "collecting_contact";
    renderSummary();
    return;
  }

  if (state.step === "collecting_contact") {
    if (possiblePhone) {
      state.pendingPhone = possiblePhone;
      state.step = "confirm_contact";
      assistantReply(
        `Проверяю номер: ${state.pendingPhone}. Если все верно, скажите «подтверждаю». Если нужно исправить, продиктуйте номер еще раз.`
      );
      renderSummary();
      return;
    }

    assistantReply("Продиктуйте номер телефона полностью, например: +7 999 123-45-67.");
    renderSummary();
    return;
  }

  if (state.step === "confirm_contact") {
    if (possiblePhone) {
      state.pendingPhone = possiblePhone;
      assistantReply(`Записала новый номер: ${state.pendingPhone}. Если верно, скажите «подтверждаю».`);
      renderSummary();
      return;
    }

    if (isContactCorrection(clean)) {
      state.pendingPhone = "";
      state.step = "collecting_contact";
      assistantReply("Хорошо, продиктуйте номер заново.");
      renderSummary();
      return;
    }

    if (!state.pendingPhone) {
      state.step = "collecting_contact";
      assistantReply("Я не вижу номер. Продиктуйте его еще раз.");
      renderSummary();
      return;
    }

    if (!isContactConfirmed(clean)) {
      assistantReply("Скажите «подтверждаю» или продиктуйте номер еще раз.");
      renderSummary();
      return;
    }

    state.phone = state.pendingPhone;
    state.pendingPhone = "";
    renderSummary();
    confirmBooking();
    renderSummary();
    return;
  }

  if (state.step === "done") {
    if (!state.symptoms && clean) {
      state.pendingSymptoms = clean;
      state.urgencyNotes = "";
      state.triageTurns = 0;

      const triage = await triageRouteAi(clean, "", 0);
      const safeDecision = applyProfileSafetyOverride(clean, triage.decision, 0);
      if (!safeDecision) {
        assistantReply("Не удалось определить профиль врача. Повторите жалобу, пожалуйста.");
        renderSummary();
        return;
      }
      if (safeDecision === "NOT_PROFILE") {
        state.pendingSymptoms = "";
        assistantReply(
          "Извините, это не профиль нашей клиники, мы специализируемся только на травматологии и ортопедии."
        );
        renderSummary();
        return;
      }

      if (shouldForceUrgencyClarification(clean, safeDecision, 0) || safeDecision === "NEED_INFO") {
        state.step = "clarifying_urgency";
        state.triageTurns = 1;
        assistantReply(triage.question || getUrgencyClarificationPrompt());
      } else {
        state.specialty = safeDecision;
        proceedAfterSpecialtyDecision();
      }
    } else {
      assistantReply("Чтобы создать новую заявку, нажмите «Новая запись».");
    }
    renderSummary();
  }
}

function setMicState(listening) {
  if (statusBadge) {
    statusBadge.classList.toggle("listening", listening);
    statusBadge.textContent = listening ? "Микрофон включен" : "Микрофон выключен";
  }
  if (micBtn) {
    micBtn.classList.toggle("active", listening);
  }
  if (micBtnState) {
    micBtnState.textContent = listening ? "РАЗГОВОР" : "ГОТОВ";
  }
  if (micBtnLabel) {
    micBtnLabel.innerHTML = listening ? "НАЖМИТЕ,<br>ЧТОБЫ ЗАВЕРШИТЬ" : "НАЖМИТЕ,<br>ЧТОБЫ ПОЗВОНИТЬ";
  }
}

function setupRecognition() {
  if (voiceSelect) {
    voiceSelect.addEventListener("change", () => {
      currentYandexVoice = voiceSelect.value || yandexVoices[0].id;
    });
  }

  if (micBtn) {
    micBtn.classList.remove("disabled");
  }

  syncVoiceSelectByProvider();
  checkYandexTtsHealth();
  recognition = null;

  if (!navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) {
    assistantReply("В этом браузере нет доступа к микрофону через Web Audio. Используйте ввод текстом.");
    micBtn.disabled = true;
    micBtn.classList.add("disabled");
    if (micBtnState) {
      micBtnState.textContent = "ОШИБКА";
    }
    if (micBtnLabel) {
      micBtnLabel.innerHTML = "МИКРОФОН<br>НЕДОСТУПЕН";
    }
    return;
  }
}

function toggleMic() {
  if (!micActive) {
    const hasActiveConversation =
      Boolean(dialogHistory.length || state.symptoms || state.pendingSymptoms || state.specialty || state.booking || state.phone);

    if (hasActiveConversation) {
      resetConversation(true, { speakGreeting: false });
    }

    micActive = true;
    setMicState(true);
    clearSpeech();
    ensureBargeInMonitor()
      .then((ok) => {
        if (ok && micActive) {
          startBargeInLoop();
        } else if (!ok) {
          micActive = false;
          setMicState(false);
          assistantReply("Микрофон недоступен. Проверьте разрешение браузера на доступ к микрофону.");
        }
      })
      .catch(() => {
        micActive = false;
        setMicState(false);
        assistantReply("Микрофон недоступен. Проверьте разрешение браузера на доступ к микрофону.");
      });
    assistantReply(getWelcomePrompt());
    return;
  }

  micActive = false;
  recognitionRunning = false;
  manualMicStopAt = Date.now();
  setMicState(false);
  clearSpeech();
  releaseBargeInResources();
}

function resetConversation(keepHistory = false, options = {}) {
  const { speakGreeting = true } = options;
  clearSpeech();
  if (!micActive) {
    releaseBargeInResources();
  }
  aiClassifierFallbackNotified = false;
  yandexSttFailureNotified = false;
  state.step = "collecting_symptoms";
  state.patientName = "";
  state.symptoms = "";
  state.pendingSymptoms = "";
  state.urgencyNotes = "";
  state.triageTurns = 0;
  state.specialty = "";
  state.district = "";
  state.preferredDay = "";
  state.preferredWindow = "";
  state.preferredExactTime = "";
  state.pendingPhone = "";
  state.phone = "";
  state.booking = null;
  lastUserTurnNorm = "";
  lastUserTurnAt = 0;
  lastUserTurnStep = "";
  if (!keepHistory) {
    state.history = [];
  }
  dialogHistory.length = 0;
  chatEl.innerHTML = "";
  if (speakGreeting) {
    assistantReply(getWelcomePrompt());
  }

  renderSummary();
  renderHistory();
}

sendBtn.addEventListener("click", () => {
  handleConversation(textInput.value);
  textInput.value = "";
  textInput.focus();
});

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

micBtn.addEventListener("click", toggleMic);
resetBtn.addEventListener("click", () => resetConversation(true));

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    handleConversation(chip.dataset.text || "");
  });
});

setupRecognition();
resetConversation(false, { speakGreeting: false });
