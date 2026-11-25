// MeteoNow Client Controller — Zero-Lag GPU Engine & Clean About/Social Sections
const state = {
  lat: 36.7538,
  lon: 3.0588,
  name: "Algiers, Algeria",
  lang: localStorage.getItem("mn_lang") || "en",
  themeMode: localStorage.getItem("mn_theme") || "dynamic", // 'dynamic' | 'light' | 'dark'
  tempUnit: localStorage.getItem("mn_temp") || "celsius",
  windUnit: localStorage.getItem("mn_wind") || "kmh",
  timeFormat: localStorage.getItem("mn_time") || "24",
  alertsEnabled: localStorage.getItem("mn_alerts") !== "false",
  forecastDays: 5,
  chartMode: "temp",
  activeHourIdx: null,
  activePage: "weather", // 'weather' | 'about'
  favorites: JSON.parse(localStorage.getItem("mn_favs") || '[{"name":"Algiers, Algeria","lat":36.7538,"lon":3.0588},{"name":"Paris, France","lat":48.8566,"lon":2.3522}]'),
  weatherData: null,
  airData: null
};

const I18N = {
  en: {
    tagline: "Global Weather & Forecast",
    searchPlaceholder: "Search any city, town, or GPS coordinates...",
    gps: "GPS",
    aboutNav: "About & Contact",
    settings: "Settings",
    refresh: "Refresh",
    feelsLike: "Feels like",
    wind: "Wind",
    humidity: "Humidity",
    pressure: "Pressure",
    uvIndex: "UV Index",
    hourlyTitle: "24-Hour Forecast",
    hourlySub: "Hover or tap chart points to inspect hourly metrics",
    modeTemp: "Temp",
    modeRain: "Rain %",
    modeWind: "Wind",
    extendedTitle: "Extended Forecast",
    extendedSub: "Multi-day temperature range, precipitation & outlook",
    days3: "3 Days",
    days5: "5 Days",
    days7: "7 Days",
    today: "Today",
    insightsTitle: "Daily Comfort & Air Quality",
    insightsSub: "Live atmospheric & air index",
    aqiLabel: "Air Quality Index (EU AQI)",
    clothingTitle: "Clothing & Comfort",
    precipTitle: "Precipitation Outlook",
    uvTitle: "UV & Sun Protection",
    coordsLabel: "Location Coordinates:",
    copy: "Copy",
    copied: "Copied!",
    poweredBy: "Powered by Open-Meteo & OpenStreetMap",
    themeMode: "Appearance & Sky Theme",
    themeDynamic: "Auto Sky",
    themeLight: "Light",
    themeDark: "Dark",
    language: "Language",
    tempUnit: "Temperature Unit",
    windUnit: "Wind Speed",
    timeFormat: "Time Format",
    alertsLabel: "Severe Weather Alerts",
    alertsSub: "Notify on storms, heavy rain, or extreme heat",
    previewAlert: "Preview Alert Banner",
    savedCities: "Saved Cities",
    searching: "Searching places...",
    noResults: "No matching locations found. Try another spelling.",
    backToWeather: "Back to Weather",
    creatorRole: "Developer & Creator of MeteoNow",
    aboutBio: "Building fast, modern web applications with real-time telemetry, clean interfaces, and global accessibility. Reach out directly via email or explore my work and social channels below.",
    businessMailLabel: "Direct Business Email",
    sendEmailDirect: "Email Directly",
    aboutLinksSection: "About Me & Work",
    aboutLinksSub: "Portfolio, source code repositories & professional profile",
    socialSection: "Social Channels",
    socialSub: "Follow or message me directly on social platforms",
    gpsPromptTitle: "Detect Your Local Weather?",
    gpsPromptSub: "Allow location access to automatically load live weather for where you are.",
    gpsPromptAllow: "Use My Location",
    gpsPromptDeny: "Not Now"
  },
  fr: {
    tagline: "Météo & Prévisions Mondiales",
    searchPlaceholder: "Rechercher une ville, un village ou des coordonnées GPS...",
    gps: "GPS",
    aboutNav: "À propos & Contact",
    settings: "Paramètres",
    refresh: "Actualiser",
    feelsLike: "Ressenti",
    wind: "Vent",
    humidity: "Humidité",
    pressure: "Pression",
    uvIndex: "Indice UV",
    hourlyTitle: "Prévisions sur 24h",
    hourlySub: "Survolez ou touchez le graphique pour les détails",
    modeTemp: "Temp",
    modeRain: "Pluie %",
    modeWind: "Vent",
    extendedTitle: "Prévisions Étendues",
    extendedSub: "Températures sur plusieurs jours et précipitations",
    days3: "3 Jours",
    days5: "5 Jours",
    days7: "7 Jours",
    today: "Aujourd'hui",
    insightsTitle: "Confort & Qualité de l'Air",
    insightsSub: "Indice atmosphérique en direct",
    aqiLabel: "Indice Qualité de l'Air (IQA)",
    clothingTitle: "Tenue & Confort",
    precipTitle: "Risque de Précipitations",
    uvTitle: "Indice UV & Soleil",
    coordsLabel: "Coordonnées GPS :",
    copy: "Copier",
    copied: "Copié !",
    poweredBy: "Propulsé par Open-Meteo & OpenStreetMap",
    themeMode: "Apparence & Thème Ciel",
    themeDynamic: "Ciel Auto",
    themeLight: "Clair",
    themeDark: "Sombre",
    language: "Langue",
    tempUnit: "Unité de Température",
    windUnit: "Vitesse du Vent",
    timeFormat: "Format de l'Heure",
    alertsLabel: "Alertes Météo Sévères",
    alertsSub: "Notifier en cas d'orage, forte pluie ou chaleur",
    previewAlert: "Tester la Bannière d'Alerte",
    savedCities: "Villes Enregistrées",
    searching: "Recherche en cours...",
    noResults: "Aucun lieu trouvé. Essayez une autre orthographe.",
    backToWeather: "Retour à la Météo",
    creatorRole: "Développeur & Créateur de MeteoNow",
    aboutBio: "Création d'applications web modernes et rapides avec télémétrie en direct et interfaces épurées. Contactez-moi directement par email ou découvrez mes projets et réseaux ci-dessous.",
    businessMailLabel: "Email Professionnel Direct",
    sendEmailDirect: "Envoyer un Email",
    aboutLinksSection: "À Propos & Projets",
    aboutLinksSub: "Portfolio, code source et profil professionnel",
    socialSection: "Réseaux Sociaux",
    socialSub: "Suivez-moi ou écrivez-moi directement sur les réseaux",
    gpsPromptTitle: "Détecter votre météo locale ?",
    gpsPromptSub: "Autorisez la localisation pour afficher automatiquement la météo de votre position.",
    gpsPromptAllow: "Utiliser ma position",
    gpsPromptDeny: "Plus tard"
  },
  ar: {
    tagline: "الطقس والتوقعات العالمية",
    searchPlaceholder: "ابحث عن أي مدينة أو بلدة أو إحداثيات GPS...",
    gps: "موقعي",
    aboutNav: "حول وتواصل",
    settings: "الإعدادات",
    refresh: "تحديث",
    feelsLike: "الإحساس",
    wind: "الرياح",
    humidity: "الرطوبة",
    pressure: "الضغط",
    uvIndex: "مؤشر UV",
    hourlyTitle: "توقعات 24 ساعة",
    hourlySub: "مرر أو اضغط على الرسم البياني لعرض التفاصيل",
    modeTemp: "الحرارة",
    modeRain: "الأمطار %",
    modeWind: "الرياح",
    extendedTitle: "التوقعات الممتدة",
    extendedSub: "نطاق درجات الحرارة والأمطار لعدة أيام",
    days3: "3 أيام",
    days5: "5 أيام",
    days7: "7 أيام",
    today: "اليوم",
    insightsTitle: "الراحة وجودة الهواء",
    insightsSub: "مؤشر الغلاف الجوي المباشر",
    aqiLabel: "مؤشر جودة الهواء (EU AQI)",
    clothingTitle: "الملابس والراحة",
    precipTitle: "توقعات الأمطار",
    uvTitle: "الحماية من الشمس",
    coordsLabel: "إحداثيات الموقع:",
    copy: "نسخ",
    copied: "تم النسخ!",
    poweredBy: "مدعوم من Open-Meteo و OpenStreetMap",
    themeMode: "المظهر وثيم السماء",
    themeDynamic: "تلقائي",
    themeLight: "فاتح",
    themeDark: "داكن",
    language: "اللغة",
    tempUnit: "وحدة الحرارة",
    windUnit: "سرعة الرياح",
    timeFormat: "تنسيق الوقت",
    alertsLabel: "تنبيهات الطقس القاسي",
    alertsSub: "إشعار عند العواصف أو الأمطار الغزيرة أو الحر الشديد",
    previewAlert: "معاينة شريط التنبيه",
    savedCities: "المدن المحفوظة",
    searching: "جاري البحث...",
    noResults: "لم يتم العثور على نتائج مطابقة.",
    backToWeather: "العودة إلى الطقس",
    creatorRole: "مطور ومبتكر MeteoNow",
    aboutBio: "تطوير تطبيقات ويب حديثة وسريعة ببيانات مباشرة وواجهات نظيفة. تواصل معي مباشرة عبر البريد الإلكتروني أو تصفح أعمالي وحساباتي أدناه.",
    businessMailLabel: "البريد المهني المباشر",
    sendEmailDirect: "مراسلة مباشرة",
    aboutLinksSection: "نبذة عني وأعمالي",
    aboutLinksSub: "معرض الأعمال، المستودعات البرمجية والملف المهني",
    socialSection: "حسابات التواصل الاجتماعي",
    socialSub: "تابعني أو راسلني مباشرة عبر منصات التواصل",
    gpsPromptTitle: "هل تريد تحديد طقس موقعك الحالي؟",
    gpsPromptSub: "اسمح بالوصول إلى الموقع لتحميل حالة الطقس المباشرة لمنطقتك تلقائياً.",
    gpsPromptAllow: "استخدام موقعي",
    gpsPromptDeny: "ليس الآن"
  }
};

const $ = (id) => document.getElementById(id);

// ============================================================================
// Lightweight 3-Mode Sky & Time Theme Engine (Zero DOM Lag)
// ============================================================================
function resolveAdaptiveTheme() {
  const html = document.documentElement;
  const ambient = $("weatherAmbient");
  const skyPill = $("skyStatePill");
  const themeNote = $("themeStatusNote");

  html.setAttribute("data-theme-mode", state.themeMode);

  const d = state.weatherData;
  const code = d?.current?.weather_code ?? 0;
  const isDayApi = d?.current?.is_day;
  let hour = 12;
  if (d?.current?.time && d.current.time.includes("T")) {
    hour = parseInt(d.current.time.split("T")[1].slice(0, 2), 10);
  } else {
    hour = new Date().getHours();
  }

  const isDaytime = isDayApi != null ? isDayApi === 1 : (hour >= 6 && hour < 19);
  const isGoldenHour = (hour >= 17 && hour <= 19) || (hour >= 5 && hour <= 6);
  const isCloudy = [2, 3, 45, 48].includes(code);
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
  const isSnow = [71, 73, 75].includes(code);
  const isStorm = code >= 95;

  let resolvedDarkOrLight = "dark";
  let skyClass = "sky-night-clear";
  let skyAttr = "night-clear";
  let skyBadgeText = "Night Sky";

  if (state.themeMode === "light") {
    resolvedDarkOrLight = "light";
    skyClass = isCloudy ? "sky-day-cloudy" : isRain ? "sky-day-rain" : "sky-day-clear";
    skyAttr = "manual-light";
    skyBadgeText = "Light Mode";
  } else if (state.themeMode === "dark") {
    resolvedDarkOrLight = "dark";
    skyClass = isStorm ? "sky-storm" : isRain ? "sky-night-rain" : isCloudy ? "sky-night-cloudy" : "sky-night-clear";
    skyAttr = "manual-dark";
    skyBadgeText = "Dark Mode";
  } else {
    if (isStorm) {
      resolvedDarkOrLight = "dark";
      skyClass = "sky-storm";
      skyAttr = "night-rain";
      skyBadgeText = isDaytime ? "Stormy Day" : "Stormy Night";
    } else if (isGoldenHour && !isRain && !isCloudy) {
      resolvedDarkOrLight = "dark";
      skyClass = "sky-golden";
      skyAttr = "golden";
      skyBadgeText = "Golden Hour";
    } else if (isDaytime) {
      resolvedDarkOrLight = "light";
      if (isRain || isSnow) {
        skyClass = "sky-day-rain";
        skyAttr = "day-rain";
        skyBadgeText = isSnow ? "Snowy Day" : "Rainy Day";
      } else if (isCloudy) {
        skyClass = "sky-day-cloudy";
        skyAttr = "day-cloudy";
        skyBadgeText = "Cloudy Day";
      } else {
        skyClass = "sky-day-clear";
        skyAttr = "day-clear";
        skyBadgeText = "Sunny Day";
      }
    } else {
      resolvedDarkOrLight = "dark";
      if (isRain || isSnow) {
        skyClass = "sky-night-rain";
        skyAttr = "night-rain";
        skyBadgeText = isSnow ? "Snowy Night" : "Rainy Night";
      } else if (isCloudy) {
        skyClass = "sky-night-cloudy";
        skyAttr = "night-cloudy";
        skyBadgeText = "Cloudy Night";
      } else {
        skyClass = "sky-night-clear";
        skyAttr = "night-clear";
        skyBadgeText = "Clear Night";
      }
    }
  }

  html.setAttribute("data-resolved-theme", resolvedDarkOrLight);
  html.setAttribute("data-sky", skyAttr);
  if (skyPill) skyPill.textContent = skyBadgeText;
  if (themeNote) {
    themeNote.textContent =
      state.themeMode === "dynamic"
        ? `Active: ${skyBadgeText} (${resolvedDarkOrLight === "light" ? "Light UI" : "Dark UI"})`
        : state.themeMode === "light"
        ? "Fixed bright daylight interface"
        : "Fixed low-glare dark interface";
  }

  if (!ambient) return;
  ambient.className = `weather-ambient ${skyClass}`;

  // Only 2 lightweight GPU-composited cloud layers on cloudy weather (no blur filter, zero lag)
  if (isCloudy) {
    ambient.innerHTML = `
      <div class="ambient-cloud" style="top:8%;width:320px;height:110px;animation-duration:46s"></div>
      <div class="ambient-cloud" style="top:24%;width:380px;height:130px;animation-duration:62s;animation-delay:-22s"></div>
    `;
  } else {
    ambient.innerHTML = "";
  }
}

// ============================================================================
// Animated Custom SVG Weather Icons (Zero Emojis)
// ============================================================================
function getAnimatedWeatherSVG(code, size = 32) {
  if (code === 0) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <g class="wx-sun-spin" stroke="#fbbf24" stroke-width="3.2" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/>
          <line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/>
          <line x1="13.6" y1="13.6" x2="17.9" y2="17.9"/><line x1="46.1" y1="46.1" x2="50.4" y2="50.4"/>
          <line x1="13.6" y1="50.4" x2="17.9" y2="46.1"/><line x1="46.1" y1="17.9" x2="50.4" y2="13.6"/>
        </g>
        <circle cx="32" cy="32" r="13" fill="#f59e0b"/>
      </svg>`;
  }

  if (code === 1 || code === 2) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <g stroke="#fbbf24" stroke-width="3" stroke-linecap="round">
          <line x1="22" y1="8" x2="22" y2="13"/><line x1="8" y1="22" x2="13" y2="22"/>
          <line x1="12" y1="12" x2="15.5" y2="15.5"/><line x1="32" y1="12" x2="28.5" y2="15.5"/>
          <line x1="12" y1="32" x2="15.5" y2="28.5"/>
        </g>
        <circle cx="22" cy="22" r="9.5" fill="#f59e0b"/>
        <path class="wx-cloud-float" d="M22 48h23a10 10 0 0 0 1.4-19.9A13 13 0 0 0 21.5 24 11 11 0 0 0 22 48Z" fill="#cbd5e1"/>
      </svg>`;
  }

  if (code === 3) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <path d="M25 36h22a8 8 0 0 0 1-15.9A10.5 10.5 0 0 0 28 17a9 9 0 0 0-3 19Z" fill="#94a3b8"/>
        <path class="wx-cloud-float" d="M17 48h27a10 10 0 0 0 1.2-19.9A13 13 0 0 0 20 24.5 11 11 0 0 0 17 48Z" fill="#cbd5e1"/>
      </svg>`;
  }

  if (code === 45 || code === 48) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <path d="M18 36h27a9 9 0 0 0 1-17.9A12 12 0 0 0 22 15a10 10 0 0 0-4 21Z" fill="#94a3b8"/>
        <g stroke="#0ea5e9" stroke-width="3" stroke-linecap="round">
          <line class="wx-fog-line" x1="14" y1="43" x2="50" y2="43"/>
          <line class="wx-fog-line" x1="20" y1="50" x2="46" y2="50"/>
        </g>
      </svg>`;
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <path d="M18 39h27a9.5 9.5 0 0 0 1.2-18.9A12.5 12.5 0 0 0 21 17a10.5 10.5 0 0 0-3 22Z" fill="#94a3b8"/>
        <g stroke="#0ea5e9" stroke-width="3" stroke-linecap="round">
          <line class="wx-rain-1" x1="23" y1="43" x2="20" y2="51"/>
          <line class="wx-rain-2" x1="32" y1="43" x2="29" y2="51"/>
          <line class="wx-rain-3" x1="41" y1="43" x2="38" y2="51"/>
        </g>
      </svg>`;
  }

  if ([71, 73, 75].includes(code)) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <path d="M18 39h27a9.5 9.5 0 0 0 1.2-18.9A12.5 12.5 0 0 0 21 17a10.5 10.5 0 0 0-3 22Z" fill="#cbd5e1"/>
        <g fill="#38bdf8">
          <circle class="wx-snow-1" cx="23" cy="46" r="2.6"/>
          <circle class="wx-snow-2" cx="32" cy="48" r="2.6"/>
          <circle class="wx-snow-3" cx="41" cy="46" r="2.6"/>
        </g>
      </svg>`;
  }

  if (code >= 95) {
    return `
      <svg class="wx-svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <path d="M18 38h27a9.5 9.5 0 0 0 1.2-18.9A12.5 12.5 0 0 0 21 16a10.5 10.5 0 0 0-3 22Z" fill="#64748b"/>
        <polygon class="wx-bolt" points="33,36 25,48 32,48 29,59 41,45 34,45" fill="#f59e0b"/>
      </svg>`;
  }

  return getAnimatedWeatherSVG(2, size);
}

const WEATHER_LABELS = {
  0: { en: "Clear Sky", fr: "Ciel Dégagé", ar: "سماء صافية" },
  1: { en: "Mainly Clear", fr: "Plutôt Dégagé", ar: "صافية غالباً" },
  2: { en: "Partly Cloudy", fr: "Partiellement Nuageux", ar: "غائم جزئياً" },
  3: { en: "Overcast", fr: "Couvert", ar: "غائم كلياً" },
  45: { en: "Fog", fr: "Brouillard", ar: "ضباب" },
  48: { en: "Rime Fog", fr: "Brouillard Givrant", ar: "ضباب متجمد" },
  51: { en: "Light Drizzle", fr: "Bruine Légère", ar: "رذاذ خفيف" },
  53: { en: "Moderate Drizzle", fr: "Bruine Modérée", ar: "رذاذ معتدل" },
  55: { en: "Dense Drizzle", fr: "Bruine Dense", ar: "رذاذ كثيف" },
  61: { en: "Slight Rain", fr: "Pluie Légère", ar: "مطر خفيف" },
  63: { en: "Moderate Rain", fr: "Pluie Modérée", ar: "مطر معتدل" },
  65: { en: "Heavy Rain", fr: "Forte Pluie", ar: "مطر غزير" },
  71: { en: "Slight Snow", fr: "Neige Légère", ar: "ثلوج خفيفة" },
  73: { en: "Moderate Snow", fr: "Neige Modérée", ar: "ثلوج معتدلة" },
  75: { en: "Heavy Snow", fr: "Fortes Chutes de Neige", ar: "ثلوج كثيفة" },
  80: { en: "Slight Showers", fr: "Averses Légères", ar: "زخات خفيفة" },
  81: { en: "Moderate Showers", fr: "Averses Modérées", ar: "زخات معتدلة" },
  82: { en: "Violent Showers", fr: "Averses Violentes", ar: "زخات عنيفة" },
  95: { en: "Thunderstorm", fr: "Orage", ar: "عاصفة رعدية" },
  96: { en: "Thunderstorm & Hail", fr: "Orage et Grêle", ar: "عاصفة وبرد" },
  99: { en: "Severe Thunderstorm", fr: "Orage Violent", ar: "عاصفة شديدة" }
};

function getWeatherInfo(code, size = 32) {
  const dict = WEATHER_LABELS[code] || { en: "Variable", fr: "Variable", ar: "متقلب" };
  return {
    svg: getAnimatedWeatherSVG(code, size),
    label: dict[state.lang] || dict.en
  };
}

function getWindDirection(deg) {
  if (deg == null) return "N";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function formatTimeStr(isoTime) {
  if (!isoTime) return "--:--";
  const raw = isoTime.includes("T") ? isoTime.split("T")[1].slice(0, 5) : isoTime.slice(0, 5);
  if (state.timeFormat === "24") return raw;
  const [hStr, mStr] = raw.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

function applyLanguage() {
  document.documentElement.setAttribute("dir", "ltr");
  document.documentElement.setAttribute("lang", state.lang);

  const dict = I18N[state.lang] || I18N.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  $("searchInput").placeholder = dict.searchPlaceholder;
  $("navBadge").textContent = `${state.tempUnit === "fahrenheit" ? "°F" : "°C"} • ${state.lang.toUpperCase()}`;
  syncSettingsUI();
}

function syncSettingsUI() {
  document.querySelectorAll("[data-theme]").forEach((b) => b.classList.toggle("active", b.dataset.theme === state.themeMode));
  document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));
  document.querySelectorAll("[data-temp]").forEach((b) => b.classList.toggle("active", b.dataset.temp === state.tempUnit));
  document.querySelectorAll("[data-wind]").forEach((b) => b.classList.toggle("active", b.dataset.wind === state.windUnit));
  document.querySelectorAll("[data-time]").forEach((b) => b.classList.toggle("active", b.dataset.time === state.timeFormat));
  $("alertsToggle").checked = state.alertsEnabled;
  renderSavedCities();
}

// ============================================================================
// View Switcher (Weather Dashboard vs Redesigned About & Social Page)
// ============================================================================
function switchPage(page) {
  state.activePage = page;
  const isAbout = page === "about";
  $("weatherView").classList.toggle("hidden", isAbout);
  $("aboutContactView").classList.toggle("hidden", !isAbout);
  $("navAboutBtn").classList.toggle("active", isAbout);
  window.scrollTo({ top: 0 });
}

$("navAboutBtn").addEventListener("click", () => {
  switchPage(state.activePage === "about" ? "weather" : "about");
});
$("footerAboutLink").addEventListener("click", () => switchPage("about"));
$("backToWeatherBtn").addEventListener("click", () => switchPage("weather"));
$("brandReset").addEventListener("click", (e) => {
  e.preventDefault();
  switchPage("weather");
});

// Copy Business Email
$("copyEmailBtn").addEventListener("click", () => {
  const dict = I18N[state.lang] || I18N.en;
  navigator.clipboard?.writeText("kacemlabs.store@gmail.com");
  $("copyEmailBtn").textContent = dict.copied;
  setTimeout(() => { $("copyEmailBtn").textContent = dict.copy; }, 1400);
});

// ============================================================================
// Weather & Air Quality Data Fetching
// ============================================================================
async function loadWeather() {
  const wxUrl = new URL("https://api.open-meteo.com/v1/forecast");
  wxUrl.searchParams.set("latitude", state.lat);
  wxUrl.searchParams.set("longitude", state.lon);
  wxUrl.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m,surface_pressure");
  wxUrl.searchParams.set("hourly", "temperature_2m,weather_code,precipitation_probability,wind_speed_10m");
  wxUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max");
  wxUrl.searchParams.set("temperature_unit", state.tempUnit);
  wxUrl.searchParams.set("wind_speed_unit", state.windUnit);
  wxUrl.searchParams.set("timezone", "auto");
  wxUrl.searchParams.set("forecast_days", "7");

  const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airUrl.searchParams.set("latitude", state.lat);
  airUrl.searchParams.set("longitude", state.lon);
  airUrl.searchParams.set("current", "european_aqi,pm2_5,pm10,dust");

  try {
    const [wxRes, airRes] = await Promise.allSettled([fetch(wxUrl), fetch(airUrl)]);
    if (wxRes.status === "fulfilled" && wxRes.value.ok) {
      state.weatherData = await wxRes.value.json();
    }
    if (airRes.status === "fulfilled" && airRes.value.ok) {
      state.airData = await airRes.value.json();
    }
    if (state.weatherData) renderAll();
  } catch (err) {
    console.error(err);
  }
}

function renderAll() {
  const d = state.weatherData;
  if (!d) return;
  const cur = d.current;
  const daily = d.daily;
  const info = getWeatherInfo(cur.weather_code, 68);
  const windLabel = state.windUnit === "mph" ? "mph" : state.windUnit === "ms" ? "m/s" : "km/h";

  resolveAdaptiveTheme();

  $("cityName").textContent = state.name;
  $("localTime").textContent = `${d.timezone.replace("_", " ")} • ${formatTimeStr(cur.time)}`;
  $("weatherIconHero").innerHTML = info.svg;
  $("currentTemp").textContent = `${Math.round(cur.temperature_2m)}°`;
  $("weatherCondition").textContent = info.label;
  $("feelsLike").textContent = `${Math.round(cur.apparent_temperature)}°`;
  $("highLowTemp").textContent = `H: ${Math.round(daily.temperature_2m_max[0])}°  L: ${Math.round(daily.temperature_2m_min[0])}°`;

  $("windValue").textContent = `${Math.round(cur.wind_speed_10m)} ${windLabel}`;
  $("windDirText").textContent = getWindDirection(cur.wind_direction_10m);
  if ($("windArrowSvg") && cur.wind_direction_10m != null) {
    $("windArrowSvg").style.transform = `rotate(${cur.wind_direction_10m}deg)`;
  }

  $("humidityValue").textContent = `${cur.relative_humidity_2m}%`;
  $("pressureValue").textContent = `${Math.round(cur.surface_pressure)} hPa`;
  $("uvValue").textContent = daily.uv_index_max?.[0]?.toFixed(1) ?? "--";

  $("sunriseVal").textContent = formatTimeStr(daily.sunrise[0]);
  $("sunsetVal").textContent = formatTimeStr(daily.sunset[0]);
  $("coordsDisplay").textContent = `${state.lat.toFixed(4)}, ${state.lon.toFixed(4)}`;

  updateFavStar();
  renderHourly(d);
  renderExtendedForecast(d);
  renderAirQuality();
  renderInsights(d);
  checkSevereAlerts(d);
}

// ============================================================================
// Interactive 24-Hour Plot (requestAnimationFrame throttled for smooth hover)
// ============================================================================
let hourlySliceCache = [];
let cachedChartPts = [];

function renderHourly(d) {
  const hourly = d.hourly;
  const curHourPrefix = d.current.time.slice(0, 13);
  let startIdx = hourly.time.findIndex((t) => t.startsWith(curHourPrefix));
  if (startIdx < 0) startIdx = 0;

  const sliceCount = 8;
  hourlySliceCache = [];
  for (let i = 0; i < sliceCount; i++) {
    const idx = startIdx + i;
    if (!hourly.time[idx]) break;
    hourlySliceCache.push({
      time: formatTimeStr(hourly.time[idx]),
      temp: hourly.temperature_2m[idx],
      code: hourly.weather_code[idx],
      rain: hourly.precipitation_probability[idx] ?? 0,
      wind: hourly.wind_speed_10m?.[idx] ?? 0
    });
  }

  const windLabel = state.windUnit === "mph" ? "mph" : state.windUnit === "ms" ? "m/s" : "km/h";

  $("hourlyStrip").innerHTML = hourlySliceCache.map((item, i) => {
    const w = getWeatherInfo(item.code, 26);
    const activeCls = state.activeHourIdx === i ? "active" : "";
    return `
      <div class="hour-pill ${activeCls}" data-hour-idx="${i}">
        <span class="h-time">${item.time}</span>
        <div>${w.svg}</div>
        <strong>${Math.round(item.temp)}°</strong>
        <span class="h-rain">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          ${item.rain}%
        </span>
      </div>
    `;
  }).join("");

  const svg = $("hourlyChart");
  const W = 640, H = 175, padX = 32, padY = 30;
  const values = hourlySliceCache.map((item) =>
    state.chartMode === "rain" ? item.rain : state.chartMode === "wind" ? item.wind : item.temp
  );

  let minV = Math.min(...values);
  let maxV = Math.max(...values);
  if (state.chartMode === "rain") {
    minV = 0;
    maxV = Math.max(100, maxV);
  } else {
    minV -= 2;
    maxV += 2;
  }
  const span = Math.max(maxV - minV, 1);

  const lineColor = state.chartMode === "rain" ? "#2563eb" : state.chartMode === "wind" ? "#10b981" : "#0ea5e9";
  const labelTextColor = document.documentElement.getAttribute("data-resolved-theme") === "light" ? "#334155" : "#cbd5e1";

  cachedChartPts = hourlySliceCache.map((item, idx) => {
    const val = values[idx];
    const x = padX + (idx / Math.max(hourlySliceCache.length - 1, 1)) * (W - padX * 2);
    const y = H - padY - ((val - minV) / span) * (H - padY * 2);
    const label = state.chartMode === "rain"
      ? `${Math.round(val)}%`
      : state.chartMode === "wind"
      ? `${Math.round(val)} ${windLabel}`
      : `${Math.round(val)}°`;
    return { x, y, label, idx };
  });

  const pathD = cachedChartPts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  const areaD = `${pathD} L ${cachedChartPts[cachedChartPts.length - 1].x.toFixed(1)} ${H - 12} L ${cachedChartPts[0].x.toFixed(1)} ${H - 12} Z`;
  const activePt = state.activeHourIdx != null ? cachedChartPts[state.activeHourIdx] : null;

  svg.innerHTML = `
    <defs>
      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="${padX}" y1="${padY}" x2="${W - padX}" y2="${padY}" stroke="rgba(128,128,128,0.14)" stroke-dasharray="4 4"/>
    <line x1="${padX}" y1="${H / 2}" x2="${W - padX}" y2="${H / 2}" stroke="rgba(128,128,128,0.14)" stroke-dasharray="4 4"/>
    <line x1="${padX}" y1="${H - padY}" x2="${W - padX}" y2="${H - padY}" stroke="rgba(128,128,128,0.14)" stroke-dasharray="4 4"/>

    <path d="${areaD}" fill="url(#tempGrad)"/>
    <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

    ${activePt ? `
      <line x1="${activePt.x.toFixed(1)}" y1="14" x2="${activePt.x.toFixed(1)}" y2="${H - 12}" stroke="${lineColor}" stroke-opacity="0.45" stroke-width="1.5" stroke-dasharray="3 3"/>
    ` : ""}

    ${cachedChartPts.map((p) => {
      const isSelected = state.activeHourIdx === p.idx;
      return `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isSelected ? 6.5 : 4}" fill="${lineColor}" stroke="#fff" stroke-width="${isSelected ? 2.2 : 1.5}"/>
        <text x="${p.x.toFixed(1)}" y="${(p.y - 11).toFixed(1)}" text-anchor="middle" fill="${isSelected ? lineColor : labelTextColor}" font-size="${isSelected ? 13 : 11.5}" font-weight="700">${p.label}</text>
      `;
    }).join("")}
  `;

  updateChartTooltip();
}

function updateChartTooltip() {
  const tt = $("chartTooltip");
  if (!tt || state.activeHourIdx == null || !hourlySliceCache[state.activeHourIdx] || !cachedChartPts[state.activeHourIdx]) {
    tt?.classList.add("hidden");
    return;
  }
  const item = hourlySliceCache[state.activeHourIdx];
  const pt = cachedChartPts[state.activeHourIdx];
  const info = getWeatherInfo(item.code, 18);
  const windLabel = state.windUnit === "mph" ? "mph" : state.windUnit === "ms" ? "m/s" : "km/h";

  const pctLeft = Math.min(86, Math.max(14, (pt.x / 640) * 100));
  tt.style.left = `${pctLeft}%`;
  tt.innerHTML = `
    <div class="tt-head">
      <span>${item.time}</span>
      <span>${Math.round(item.temp)}°</span>
    </div>
    <div class="tt-cond">${info.label}</div>
    <div class="tt-stats">
      <span class="tt-stat-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        ${item.rain}%
      </span>
      <span class="tt-stat-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/></svg>
        ${Math.round(item.wind)} ${windLabel}
      </span>
    </div>
  `;
  tt.classList.remove("hidden");
}

function setInteractiveHour(idx) {
  if (state.activeHourIdx === idx) return;
  state.activeHourIdx = idx;
  if (state.weatherData) renderHourly(state.weatherData);
}

const chartWrap = $("chartWrap");
if (chartWrap) {
  let rafPending = false;
  const handlePointer = (clientX) => {
    if (rafPending || !hourlySliceCache.length) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const rect = chartWrap.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const idx = Math.round(ratio * (hourlySliceCache.length - 1));
      setInteractiveHour(idx);
      rafPending = false;
    });
  };

  chartWrap.addEventListener("mousemove", (e) => handlePointer(e.clientX));
  chartWrap.addEventListener("touchmove", (e) => {
    if (e.touches[0]) handlePointer(e.touches[0].clientX);
  }, { passive: true });
  chartWrap.addEventListener("mouseleave", () => {
    state.activeHourIdx = null;
    if (state.weatherData) renderHourly(state.weatherData);
  });
}

$("hourlyStrip")?.addEventListener("click", (e) => {
  const pill = e.target.closest("[data-hour-idx]");
  if (!pill) return;
  const idx = Number(pill.dataset.hourIdx);
  state.activeHourIdx = state.activeHourIdx === idx ? null : idx;
  if (state.weatherData) renderHourly(state.weatherData);
});

document.querySelectorAll("[data-chart-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-chart-mode]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.chartMode = btn.dataset.chartMode;
    if (state.weatherData) renderHourly(state.weatherData);
  });
});

// ============================================================================
// Extended Forecast & Air Quality
// ============================================================================
function renderExtendedForecast(d) {
  const daily = d.daily;
  const count = state.forecastDays;
  const dict = I18N[state.lang] || I18N.en;
  const locale = state.lang === "fr" ? "fr-FR" : state.lang === "ar" ? "ar-DZ" : "en-US";

  const mins = daily.temperature_2m_min.slice(0, count);
  const maxs = daily.temperature_2m_max.slice(0, count);
  const weekMin = Math.min(...mins);
  const weekMax = Math.max(...maxs);
  const totalRange = Math.max(weekMax - weekMin, 1);

  const rowsHtml = [];
  for (let i = 0; i < count; i++) {
    const dateObj = new Date(daily.time[i] + "T12:00:00");
    const dayLabel = i === 0
      ? dict.today
      : dateObj.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });

    const info = getWeatherInfo(daily.weather_code[i], 32);
    const precip = daily.precipitation_sum[i] || 0;
    const tMin = Math.round(mins[i]);
    const tMax = Math.round(maxs[i]);

    const leftPct = ((mins[i] - weekMin) / totalRange) * 100;
    const widthPct = Math.max(((maxs[i] - mins[i]) / totalRange) * 100, 12);

    rowsHtml.push(`
      <div class="forecast-row">
        <div class="fc-day-col">
          <div class="fc-day">${dayLabel}</div>
          <div class="fc-cond">${info.label}</div>
        </div>
        <div class="fc-icon-col">
          <div class="fc-icon-box">${info.svg}</div>
        </div>
        <div class="fc-rain-col">
          ${precip > 0 ? `
            <span class="precip-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              ${precip.toFixed(1)}mm
            </span>` : ""}
        </div>
        <div class="fc-temp-col">
          <span class="temp-min">${tMin}°</span>
          <div class="temp-bar-track">
            <div class="temp-bar-fill" style="left:${leftPct.toFixed(1)}%;width:${widthPct.toFixed(1)}%"></div>
          </div>
          <span class="temp-max">${tMax}°</span>
        </div>
      </div>
    `);
  }
  $("forecastList").innerHTML = rowsHtml.join("");
}

function renderAirQuality() {
  const air = state.airData?.current;
  if (!air) return;
  const aqi = Math.round(air.european_aqi ?? 20);
  const badge = $("aqiBadge");
  const fill = $("aqiBarFill");

  const labels = {
    en: aqi <= 25 ? "Good" : aqi <= 50 ? "Fair" : aqi <= 75 ? "Moderate" : "Poor",
    fr: aqi <= 25 ? "Bon" : aqi <= 50 ? "Correct" : aqi <= 75 ? "Modéré" : "Médiocre",
    ar: aqi <= 25 ? "جيد" : aqi <= 50 ? "مقبول" : aqi <= 75 ? "متوسط" : "سيئ"
  };

  badge.textContent = `${aqi} • ${labels[state.lang] || labels.en}`;
  badge.className = `aqi-badge ${aqi <= 35 ? "good" : aqi <= 65 ? "fair" : "poor"}`;
  fill.style.width = `${Math.min(100, Math.max(8, aqi))}%`;

  $("pm25Val").textContent = air.pm2_5?.toFixed(1) ?? "--";
  $("pm10Val").textContent = air.pm10?.toFixed(1) ?? "--";
  $("dustVal").textContent = air.dust?.toFixed(0) ?? "0";
}

function renderInsights(d) {
  const cur = d.current;
  const daily = d.daily;
  const tempC = state.tempUnit === "fahrenheit" ? (cur.temperature_2m - 32) * (5 / 9) : cur.temperature_2m;
  const rainToday = daily.precipitation_sum[0] || 0;
  const uv = daily.uv_index_max[0] || 0;

  const sr = new Date(daily.sunrise[0]);
  const ss = new Date(daily.sunset[0]);
  const diffMins = Math.max(0, Math.round((ss - sr) / 60000));
  $("daylightDuration").textContent = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;

  const texts = {
    en: {
      cold: "Chilly conditions — wear a warm coat and layered clothing.",
      crisp: "Crisp air — a light jacket or sweater is recommended.",
      warm: "Comfortable & mild — breathable cotton layers are ideal.",
      hot: "Hot weather — wear light fabrics and stay hydrated.",
      rainYes: `Rain expected (${rainToday.toFixed(1)} mm) — carry an umbrella.`,
      rainNo: "Dry skies ahead — no umbrella needed for outdoor plans.",
      uvHigh: `High UV (${uv.toFixed(1)}) — apply SPF 30+ sunscreen and sunglasses.`,
      uvLow: "Low UV exposure — safe for extended outdoor activities."
    },
    fr: {
      cold: "Temps froid — portez un manteau chaud et plusieurs couches.",
      crisp: "Air frais — une veste légère ou un pull est recommandé.",
      warm: "Temps doux et agréable — des vêtements légers suffisent.",
      hot: "Forte chaleur — portez des tissus légers et hydratez-vous.",
      rainYes: `Pluie prévue (${rainToday.toFixed(1)} mm) — prenez un parapluie.`,
      rainNo: "Temps sec — aucun parapluie nécessaire aujourd'hui.",
      uvHigh: `Indice UV élevé (${uv.toFixed(1)}) — crème solaire SPF 30+ conseillée.`,
      uvLow: "Exposition UV faible — idéal pour les activités en extérieur."
    },
    ar: {
      cold: "أجواء باردة — يُنصح بارتداء معطف دافئ وملابس شتوية.",
      crisp: "أجواء منعشة — يُنصح بسترة خفيفة أو كنزة.",
      warm: "طقس معتدل ومريح — ملابس قطنية خفيفة مناسبة.",
      hot: "طقس حار — ارتدِ ملابس خفيفة واشرب كمية كافية من الماء.",
      rainYes: `أمطار متوقعة (${rainToday.toFixed(1)} مم) — احمل مظلة معك.`,
      rainNo: "أجواء جافة — لا حاجة للمظلة اليوم.",
      uvHigh: `أشعة شمس قوية (${uv.toFixed(1)}) — استخدم واقي الشمس والنظارات.`,
      uvLow: "أشعة فوق بنفسجية منخفضة — آمن للأنشطة الخارجية."
    }
  }[state.lang];

  $("clothingAdvice").textContent = tempC < 10 ? texts.cold : tempC < 19 ? texts.crisp : tempC < 29 ? texts.warm : texts.hot;
  $("precipAdvice").textContent = rainToday > 0.2 ? texts.rainYes : texts.rainNo;
  $("uvAdvice").textContent = uv >= 6 ? texts.uvHigh : texts.uvLow;
}

function checkSevereAlerts(d) {
  if (!state.alertsEnabled) {
    $("alertBanner").classList.add("hidden");
    return;
  }
  const code = d.current.weather_code;
  const wind = d.current.wind_speed_10m;
  const windKmh = state.windUnit === "mph" ? wind * 1.609 : state.windUnit === "ms" ? wind * 3.6 : wind;

  if (code >= 95 || code === 65 || code === 82 || windKmh >= 55) {
    $("alertTitle").textContent = getWeatherInfo(code).label;
    $("alertMessage").textContent = `${state.name} — ${$("windValue").textContent}`;
    $("alertBanner").classList.remove("hidden");
  } else {
    $("alertBanner").classList.add("hidden");
  }
}

// ============================================================================
// Multi-Engine Fuzzy Geocoding (Photon OpenStreetMap + Open-Meteo + Nominatim)
// ============================================================================
const searchCache = new Map();
let activeSearchController = null;
let selectedIndex = -1;
let currentSearchResults = [];

function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function scorePlace(placeName, query) {
  const nPlace = normalizeText(placeName);
  const nQuery = normalizeText(query);
  if (!nPlace || !nQuery) return 999;
  if (nPlace === nQuery) return 0;
  if (nPlace.startsWith(nQuery)) return 1;
  if (nPlace.includes(nQuery)) return 2;

  const words = nPlace.split(" ");
  let best = editDistance(nPlace, nQuery);
  for (const w of words) {
    if (w.startsWith(nQuery)) best = Math.min(best, 1.5);
    best = Math.min(best, editDistance(w, nQuery));
  }
  return best + 3;
}

async function queryPhoton(q, signal) {
  const photonLang = ["en", "fr", "de"].includes(state.lang) ? state.lang : "default";
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lang=${photonLang}&lat=${state.lat}&lon=${state.lon}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || []).map((f) => {
    const p = f.properties || {};
    const [lon, lat] = f.geometry.coordinates;
    const primary = p.name || p.city || p.town || p.village || p.county || "Unknown";
    const subParts = [p.city !== primary ? p.city : null, p.county, p.state, p.country].filter(Boolean);
    const display = p.country && !primary.includes(p.country) ? `${primary}, ${p.country}` : primary;
    return {
      primary,
      subtitle: subParts.join(", "),
      display,
      lat,
      lon,
      type: p.osm_value || p.type || "place"
    };
  });
}

async function queryOpenMeteoGeo(q, signal) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=${state.lang}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((r) => {
    const subParts = [r.admin2, r.admin1, r.country].filter(Boolean);
    const display = r.country ? `${r.name}, ${r.country}` : r.name;
    return {
      primary: r.name,
      subtitle: subParts.join(", "),
      display,
      lat: r.latitude,
      lon: r.longitude,
      type: r.feature_code || "city"
    };
  });
}

async function queryNominatimFallback(q, signal) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&addressdetails=1&limit=6&accept-language=${state.lang}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item) => {
    const addr = item.address || {};
    const primary = item.name || addr.village || addr.town || addr.city || item.display_name.split(",")[0];
    const subParts = [addr.county, addr.state, addr.country].filter(Boolean);
    const display = addr.country ? `${primary}, ${addr.country}` : primary;
    return {
      primary,
      subtitle: subParts.join(", ") || item.display_name,
      display,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type || "place"
    };
  });
}

async function performFuzzySearch(rawQuery) {
  const cacheKey = `${state.lang}:${normalizeText(rawQuery)}`;
  if (searchCache.has(cacheKey)) {
    renderSearchResults(searchCache.get(cacheKey));
    return;
  }

  if (activeSearchController) activeSearchController.abort();
  activeSearchController = new AbortController();
  const { signal } = activeSearchController;

  const dict = I18N[state.lang] || I18N.en;
  $("searchDropdown").innerHTML = `<div class="search-status">${dict.searching}</div>`;
  $("searchDropdown").classList.remove("hidden");

  try {
    const [photonRes, omRes] = await Promise.allSettled([
      queryPhoton(rawQuery, signal),
      queryOpenMeteoGeo(rawQuery, signal)
    ]);

    let combined = [
      ...(photonRes.status === "fulfilled" ? photonRes.value : []),
      ...(omRes.status === "fulfilled" ? omRes.value : [])
    ];

    if (combined.length < 2) {
      try {
        const nomRes = await queryNominatimFallback(rawQuery, signal);
        combined = combined.concat(nomRes);
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }

    const unique = [];
    for (const item of combined) {
      const isDup = unique.some(
        (u) => Math.abs(u.lat - item.lat) < 0.03 && Math.abs(u.lon - item.lon) < 0.03
      );
      if (!isDup) unique.push(item);
    }

    unique.sort((a, b) => scorePlace(a.primary, rawQuery) - scorePlace(b.primary, rawQuery));
    const topResults = unique.slice(0, 7);

    searchCache.set(cacheKey, topResults);
    renderSearchResults(topResults);
  } catch (err) {
    if (err.name !== "AbortError") console.error("Search error:", err);
  }
}

function renderSearchResults(results) {
  const dict = I18N[state.lang] || I18N.en;
  currentSearchResults = results;
  selectedIndex = -1;

  if (!results.length) {
    $("searchDropdown").innerHTML = `<div class="search-status">${dict.noResults}</div>`;
    $("searchDropdown").classList.remove("hidden");
    return;
  }

  $("searchDropdown").innerHTML = results.map((r, idx) => `
    <button type="button" class="search-item" data-result-idx="${idx}">
      <div class="search-item-main">
        <span class="search-item-title">${r.primary}</span>
        <span class="search-item-sub">${r.subtitle || `${r.lat.toFixed(3)}, ${r.lon.toFixed(3)}`}</span>
      </div>
      <div class="search-item-meta">
        <span class="place-type-tag">${r.type}</span>
        <small>${r.lat.toFixed(2)}, ${r.lon.toFixed(2)}</small>
      </div>
    </button>
  `).join("");
  $("searchDropdown").classList.remove("hidden");
}

function selectSearchResult(item) {
  if (!item) return;
  state.lat = item.lat;
  state.lon = item.lon;
  state.name = item.display.replace(/,\s*$/, "");
  $("searchInput").value = "";
  $("clearSearchBtn").classList.add("hidden");
  $("searchDropdown").classList.add("hidden");
  currentSearchResults = [];
  selectedIndex = -1;
  switchPage("weather");
  loadWeather();
}

let searchTimer = null;
$("searchInput").addEventListener("input", (e) => {
  const q = e.target.value.trim();
  $("clearSearchBtn").classList.toggle("hidden", !q);
  clearTimeout(searchTimer);

  if (!q) {
    $("searchDropdown").classList.add("hidden");
    return;
  }

  const coordMatch = q.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      renderSearchResults([{
        primary: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        subtitle: "Direct GPS Coordinates",
        display: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        lat,
        lon,
        type: "GPS"
      }]);
      return;
    }
  }

  if (q.length < 2) return;
  searchTimer = setTimeout(() => performFuzzySearch(q), 220);
});

$("searchInput").addEventListener("keydown", (e) => {
  const items = $("searchDropdown").querySelectorAll(".search-item");
  if (!items.length) {
    if (e.key === "Enter" && $("searchInput").value.trim().length >= 2) {
      e.preventDefault();
      clearTimeout(searchTimer);
      performFuzzySearch($("searchInput").value.trim());
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % items.length;
    items.forEach((el, i) => el.classList.toggle("active", i === selectedIndex));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle("active", i === selectedIndex));
  } else if (e.key === "Enter") {
    e.preventDefault();
    const pick = selectedIndex >= 0 ? currentSearchResults[selectedIndex] : currentSearchResults[0];
    selectSearchResult(pick);
  } else if (e.key === "Escape") {
    $("searchDropdown").classList.add("hidden");
  }
});

$("searchDropdown").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-result-idx]");
  if (!btn) return;
  selectSearchResult(currentSearchResults[Number(btn.dataset.resultIdx)]);
});

$("clearSearchBtn").addEventListener("click", () => {
  $("searchInput").value = "";
  $("clearSearchBtn").classList.add("hidden");
  $("searchDropdown").classList.add("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    $("searchDropdown").classList.add("hidden");
  }
});

// Reusable GPS Location Detector
function detectUserLocation() {
  if (!navigator.geolocation) return;
  localStorage.setItem("mn_gps_prompted", "true");
  $("gpsPromptBanner")?.classList.add("hidden");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      state.lat = pos.coords.latitude;
      state.lon = pos.coords.longitude;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${state.lat}&lon=${state.lon}&format=json&accept-language=${state.lang}`);
        const j = await r.json();
        const city = j.address?.village || j.address?.town || j.address?.city || "Current Location";
        const country = j.address?.country || "";
        state.name = country ? `${city}, ${country}` : city;
      } catch {
        state.name = `${state.lat.toFixed(3)}, ${state.lon.toFixed(3)}`;
      }
      switchPage("weather");
      loadWeather();
    },
    () => {
      // User denied or location unavailable — stay smoothly on default/saved city
      localStorage.setItem("mn_gps_prompted", "true");
      $("gpsPromptBanner")?.classList.add("hidden");
    },
    { timeout: 10000 }
  );
}

// GPS Button & First-Visit Prompt Handlers
$("gpsBtn").addEventListener("click", detectUserLocation);

$("allowGpsPromptBtn")?.addEventListener("click", detectUserLocation);

$("denyGpsPromptBtn")?.addEventListener("click", () => {
  localStorage.setItem("mn_gps_prompted", "true");
  $("gpsPromptBanner")?.classList.add("hidden");
});

function checkFirstVisitGpsPrompt() {
  if (!navigator.geolocation) return;
  if (!localStorage.getItem("mn_gps_prompted")) {
    $("gpsPromptBanner")?.classList.remove("hidden");
  }
}

// ============================================================================
// Favorites & Quick-Switch Saved Cities Tab Strip
// ============================================================================
function updateFavStar() {
  const exists = state.favorites.some((f) => Math.abs(f.lat - state.lat) < 0.02 && Math.abs(f.lon - state.lon) < 0.02);
  $("favToggleBtn").innerHTML = exists
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  renderSavedCities();
}

$("favToggleBtn").addEventListener("click", () => {
  const idx = state.favorites.findIndex((f) => Math.abs(f.lat - state.lat) < 0.02 && Math.abs(f.lon - state.lon) < 0.02);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.push({ name: state.name, lat: state.lat, lon: state.lon });
  }
  localStorage.setItem("mn_favs", JSON.stringify(state.favorites));
  updateFavStar();
});

function renderSavedCities() {
  $("savedCitiesList").innerHTML = state.favorites.map((c, idx) => `
    <div class="saved-city-row">
      <button type="button" class="city-link" data-idx="${idx}">${c.name}</button>
      <button type="button" class="icon-btn" data-del="${idx}" aria-label="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `).join("");

  const tabsEl = $("savedCitiesTabs");
  if (!tabsEl) return;

  const isCurrentSaved = state.favorites.some(
    (f) => Math.abs(f.lat - state.lat) < 0.02 && Math.abs(f.lon - state.lon) < 0.02
  );

  let tabsHtml = state.favorites.map((c, idx) => {
    const isActive = Math.abs(c.lat - state.lat) < 0.02 && Math.abs(c.lon - state.lon) < 0.02;
    return `
      <div class="city-tab ${isActive ? "active" : ""}" data-tab-idx="${idx}">
        <span>${c.name}</span>
        <span class="city-tab-del" data-tab-del="${idx}" title="Remove">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </span>
      </div>
    `;
  }).join("");

  if (!isCurrentSaved && state.name) {
    tabsHtml += `
      <button type="button" class="city-tab city-tab-add" id="quickSaveCityTab">
        + ${state.name.split(",")[0]}
      </button>
    `;
  }

  tabsEl.innerHTML = tabsHtml;
}

$("savedCitiesTabs")?.addEventListener("click", (e) => {
  const addBtn = e.target.closest("#quickSaveCityTab");
  if (addBtn) {
    state.favorites.push({ name: state.name, lat: state.lat, lon: state.lon });
    localStorage.setItem("mn_favs", JSON.stringify(state.favorites));
    updateFavStar();
    return;
  }

  const delBtn = e.target.closest("[data-tab-del]");
  if (delBtn) {
    e.stopPropagation();
    state.favorites.splice(Number(delBtn.dataset.tabDel), 1);
    localStorage.setItem("mn_favs", JSON.stringify(state.favorites));
    updateFavStar();
    return;
  }

  const tab = e.target.closest("[data-tab-idx]");
  if (tab) {
    const city = state.favorites[Number(tab.dataset.tabIdx)];
    if (city) {
      state.lat = city.lat;
      state.lon = city.lon;
      state.name = city.name;
      switchPage("weather");
      loadWeather();
    }
  }
});

$("savedCitiesList").addEventListener("click", (e) => {
  const link = e.target.closest("[data-idx]");
  const del = e.target.closest("[data-del]");
  if (link) {
    const city = state.favorites[Number(link.dataset.idx)];
    if (city) {
      state.lat = city.lat;
      state.lon = city.lon;
      state.name = city.name;
      closeDrawer();
      switchPage("weather");
      loadWeather();
    }
  } else if (del) {
    state.favorites.splice(Number(del.dataset.del), 1);
    localStorage.setItem("mn_favs", JSON.stringify(state.favorites));
    updateFavStar();
  }
});

// Forecast Segmented Control
document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.forecastDays = Number(btn.dataset.days);
    if (state.weatherData) renderExtendedForecast(state.weatherData);
  });
});

// Copy Coordinates
$("copyCoordsBtn").addEventListener("click", () => {
  const dict = I18N[state.lang] || I18N.en;
  navigator.clipboard?.writeText(`${state.lat.toFixed(4)}, ${state.lon.toFixed(4)}`);
  $("copyCoordsBtn").textContent = dict.copied;
  setTimeout(() => { $("copyCoordsBtn").textContent = dict.copy; }, 1400);
});

// Drawer Controls
function openDrawer() {
  $("drawerBackdrop").classList.remove("hidden");
  $("settingsDrawer").classList.add("open");
  $("settingsDrawer").setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  $("drawerBackdrop").classList.add("hidden");
  $("settingsDrawer").classList.remove("open");
  $("settingsDrawer").setAttribute("aria-hidden", "true");
}

$("openSettingsBtn").addEventListener("click", openDrawer);
$("closeSettingsBtn").addEventListener("click", closeDrawer);
$("drawerBackdrop").addEventListener("click", closeDrawer);

document.querySelectorAll("[data-theme]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.themeMode = btn.dataset.theme;
    localStorage.setItem("mn_theme", state.themeMode);
    syncSettingsUI();
    resolveAdaptiveTheme();
    if (state.weatherData) renderHourly(state.weatherData);
  });
});

document.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.lang = btn.dataset.lang;
    localStorage.setItem("mn_lang", state.lang);
    applyLanguage();
    if (state.weatherData) renderAll();
  });
});

document.querySelectorAll("[data-temp]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.tempUnit = btn.dataset.temp;
    localStorage.setItem("mn_temp", state.tempUnit);
    applyLanguage();
    loadWeather();
  });
});

document.querySelectorAll("[data-wind]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.windUnit = btn.dataset.wind;
    localStorage.setItem("mn_wind", state.windUnit);
    applyLanguage();
    loadWeather();
  });
});

document.querySelectorAll("[data-time]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.timeFormat = btn.dataset.time;
    localStorage.setItem("mn_time", state.timeFormat);
    applyLanguage();
    if (state.weatherData) renderAll();
  });
});

$("alertsToggle").addEventListener("change", (e) => {
  state.alertsEnabled = e.target.checked;
  localStorage.setItem("mn_alerts", String(state.alertsEnabled));
  if (state.weatherData) checkSevereAlerts(state.weatherData);
});

$("previewAlertBtn").addEventListener("click", () => {
  $("alertTitle").textContent = "Thunderstorm & Strong Wind Warning";
  $("alertMessage").textContent = `${state.name} — Gusts up to 65 km/h expected this evening.`;
  $("alertBanner").classList.remove("hidden");
  closeDrawer();
});

$("dismissAlertBtn").addEventListener("click", () => $("alertBanner").classList.add("hidden"));
$("refreshBtn").addEventListener("click", loadWeather);

// Init
applyLanguage();
resolveAdaptiveTheme();
checkFirstVisitGpsPrompt();
loadWeather();
