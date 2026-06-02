let lifeData = { countries: [] };
let countries = [];
const els = {
  clockText: document.getElementById("clockText"),
  dateText: document.getElementById("dateText"),
  yearDay: document.getElementById("yearDay"),
  clockGrid: document.getElementById("clockGrid"),
  lifeToggle: document.getElementById("lifeToggle"),
  lifePanel: document.getElementById("lifePanel"),
  lifePercent: document.getElementById("lifePercent"),
  lifeSlider: document.getElementById("lifeSlider"),
  onboarding: document.getElementById("onboarding"),
  profileForm: document.getElementById("profileForm"),
  dobInput: document.getElementById("dobInput"),
  countryInput: document.getElementById("countryInput"),
  countryDataNote: document.getElementById("countryDataNote"),
  showLifeInput: document.getElementById("showLifeInput"),
  editProfile: document.getElementById("editProfile")
};

const clockDefs = [
  { key: "minute", label: "Minute", detail: "Current minute elapsed" },
  { key: "hour", label: "Hour", detail: "Current hour elapsed" },
  { key: "day", label: "Day", detail: "Local day elapsed" },
  { key: "week", label: "Week", detail: "Week starts Monday" },
  { key: "month", label: "Month", detail: "Current calendar month" },
  { key: "year", label: "Year", detail: "Current calendar year" }
];

let profile = null;

function tokeiInvoke(command) {
  if (!window.__TAURI__?.core?.invoke) {
    return Promise.reject(new Error("Tauri API is not available"));
  }

  return window.__TAURI__.core.invoke(command);
}

function readProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("tokei-profile")) || null;
    if (!saved) return null;
    const fallback = countries.find(c => c.code === "USA") || countries[0];
    if (!saved.countryCode || !countries.some(c => c.code === saved.countryCode)) {
      saved.countryCode = fallback.code;
      localStorage.setItem("tokei-profile", JSON.stringify(saved));
    }
    return saved;
  } catch {
    return null;
  }
}

function saveProfile(next) {
  profile = next;
  localStorage.setItem("tokei-profile", JSON.stringify(profile));
}

function populateCountries() {
  els.countryInput.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a country";
  placeholder.disabled = true;
  els.countryInput.appendChild(placeholder);
  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.name} (${country.expectancy}y)`;
    els.countryInput.appendChild(option);
  });
  els.countryDataNote.textContent = `${countries.length} countries loaded locally.`;
}

function countryFor(code) {
  return countries.find(c => c.code === code) || countries.find(c => c.code === "USA") || countries[0];
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function pct(value) {
  return `${clamp(value).toFixed(3)}%`;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d) {
  const day = (d.getDay() + 6) % 7;
  const start = startOfDay(d);
  start.setDate(start.getDate() - day);
  return start;
}

function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function yearLengthMs(year) {
  return new Date(year + 1, 0, 1) - new Date(year, 0, 1);
}

function calculate(now) {
  const minute = (now.getSeconds() * 1000 + now.getMilliseconds()) / 60000 * 100;
  const hour = (now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds()) / 3600000 * 100;
  const day = (now - startOfDay(now)) / 86400000 * 100;
  const week = (now - startOfWeek(now)) / (7 * 86400000) * 100;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const month = (now - monthStart) / (daysInMonth(now) * 86400000) * 100;
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const year = (now - yearStart) / yearLengthMs(now.getFullYear()) * 100;
  return { minute, hour, day, week, month, year };
}

function lifePercent(now) {
  if (!profile) return null;
  const country = countryFor(profile.countryCode);
  const born = new Date(profile.dob + "T00:00:00");
  const lifeMs = country.expectancy * 365.2425 * 86400000;
  const lived = now - born;
  return { value: lived / lifeMs * 100, born, country };
}

function renderCards(values) {
  els.clockGrid.innerHTML = clockDefs.map(def => `
    <article class="card">
      <h3>${def.label}</h3>
      <div class="percent">${pct(values[def.key])}</div>
      <small>${def.detail}</small>
      <div class="bar"><span style="width:${clamp(values[def.key])}%"></span></div>
      <div class="ring" style="--p:${clamp(values[def.key])}"></div>
    </article>
  `).join("");
}

function renderLife(now) {
  const life = lifePercent(now);
  const show = !!profile?.showLife;
  els.lifeToggle.checked = show;
  els.lifePanel.classList.toggle("hidden", !show);
  if (!life) return;
  const value = clamp(life.value);
  els.lifePercent.textContent = pct(value);
  els.lifeSlider.value = value;
}

function tick() {
  const now = new Date();
  els.clockText.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  els.dateText.textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const yearStart = new Date(now.getFullYear(), 0, 1);
  els.yearDay.textContent = `Day ${Math.floor((now - yearStart) / 86400000) + 1}`;
  const values = calculate(now);
  renderCards(values);
  renderLife(now);
}

function openProfile() {
  els.onboarding.classList.remove("hidden");
  const fallback = countryFor("USA");
  if (profile) {
    els.dobInput.value = profile.dob;
    els.countryInput.value = countryFor(profile.countryCode).code;
    els.showLifeInput.checked = !!profile.showLife;
  } else {
    els.countryInput.value = fallback.code;
  }
}

function closeProfile() {
  els.onboarding.classList.add("hidden");
}

function setTheme(theme) {
  if (theme === "ledger") theme = "gaia";
  if (theme === "pulse") theme = "cherry";
  if (theme === "nocturne") theme = "canopy";
  document.body.className = `theme-${theme}`;
  localStorage.setItem("tokei-theme", theme);
  document.querySelectorAll("[data-theme]").forEach(btn => btn.classList.toggle("active", btn.dataset.theme === theme));
}

async function boot() {
  try {
    lifeData = JSON.parse(await tokeiInvoke("load_life_data"));
  } catch (error) {
    try {
      const response = await fetch("../data/life-expectancy.json");
      lifeData = await response.json();
    } catch (syncError) {
      els.countryInput.replaceChildren();
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Could not load country data";
      els.countryInput.appendChild(option);
      els.countryDataNote.textContent = "Country data failed to load.";
      console.error("Failed to load life expectancy data", error, syncError);
      return;
    }
  }
  countries = Array.isArray(lifeData.countries) ? lifeData.countries : [];
  profile = readProfile();
  populateCountries();
  renderCards(calculate(new Date()));

  if (!profile) {
    openProfile();
  } else {
    closeProfile();
  }

  setTheme(localStorage.getItem("tokei-theme") || "aurora");
  tick();
  setInterval(tick, 250);
}

els.profileForm.addEventListener("submit", event => {
  event.preventDefault();
  const country = countryFor(els.countryInput.value);
  saveProfile({
    dob: els.dobInput.value,
    countryCode: country.code,
    showLife: els.showLifeInput.checked
  });
  closeProfile();
  tick();
});

els.editProfile.addEventListener("click", openProfile);
els.lifeToggle.addEventListener("change", () => {
  if (!profile) return openProfile();
  profile.showLife = els.lifeToggle.checked;
  saveProfile(profile);
  tick();
});

document.querySelectorAll("[data-theme]").forEach(btn => {
  btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

document.querySelectorAll("[data-window]").forEach(btn => {
  btn.addEventListener("click", () => tokeiInvoke(`window_${btn.dataset.window}`));
});

boot();
