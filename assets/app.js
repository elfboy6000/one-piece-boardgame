// ---- Icon token replacement ----------------------------------------------
const ICON_MAP = [
  [/\[교환\]/g, "icon_swap.png", "Swap"],
  [/\[Swap\]/g, "icon_swap.png", "Swap"],
  [/\[이동\]/g, "icon_move.jpeg", "Move"],
  [/\[Move\]/g, "icon_move.jpeg", "Move"],
  [/\[파워업\]/g, "icon_powerup.png", "Power Up!"],
  [/\[Power Up!\]/g, "icon_powerup.png", "Power Up!"],
  [/\[영입\]/g, "icon_recruit.jpeg", "Recruit"],
  [/\[Recruit\]/g, "icon_recruit.jpeg", "Recruit"],
  [/\[저지\]/g, "icon_prevent.jpeg", "Prevent"],
  [/\[Prevent\]/g, "icon_prevent.jpeg", "Prevent"],
];

function escapeHTML(str) {
  return (str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

// Renders ability/effect text: escapes HTML, then swaps bracket tokens for inline icons,
// then swaps [Die]/[주사위] and [Flame]/[불꽃] for their emoji, leaving 🎲/🔥 already-inline emoji untouched.
function renderText(raw) {
  if (!raw) return "";
  let html = escapeHTML(raw);
  for (const [re, file, label] of ICON_MAP) {
    html = html.replace(
      re,
      `<img class="kw-icon" src="Icons/${file}" alt="${label}" title="${label}">`
    );
  }
  html = html.replace(/\[Die\]|\[주사위\]/g, '<span class="emoji" title="Die">🎲</span>');
  html = html.replace(/\[Flame\]|\[불꽃\]/g, '<span class="emoji" title="Flame">🔥</span>');
  return html;
}

function fmtBounty(n) {
  if (!n || isNaN(Number(n))) return n || "";
  return "₿" + Number(n).toLocaleString("en-US");
}

// ---- App state -------------------------------------------------------------
const state = {
  tab: "characters",
  query: "",
  episode: "all",
  kind: "all", // enemy/boss/all
  lang: "both", // both | ko | en
  data: { characters: [], enemies: [], crewmates: [] },
};

const els = {};

function $(sel) {
  return document.querySelector(sel);
}

async function boot() {
  els.app = $("#app");
  els.search = $("#search");
  els.tabs = document.querySelectorAll(".tab");
  els.episodeFilter = $("#episodeFilter");
  els.kindFilter = $("#kindFilter");
  els.langButtons = document.querySelectorAll(".lang-btn");
  els.results = $("#results");
  els.resultCount = $("#resultCount");
  els.modal = $("#modal");
  els.modalBody = $("#modalBody");
  els.modalClose = $("#modalClose");
  els.loadError = $("#loadError");

  try {
    const [characters, enemies, crewmates] = await Promise.all([
      loadCSV("Cards/Characters/characters.csv"),
      loadCSV("Cards/Enemies/enemies.csv"),
      loadCSV("Cards/Crewmates/crewmates.csv"),
    ]);
    state.data.characters = characters.filter((c) => c.name_english !== "Card Back");
    state.data.enemies = enemies.filter((e) => e.name_english !== "Card Back");
    state.data.crewmates = crewmates.filter((c) => c.name_english !== "Card Back");
  } catch (err) {
    els.loadError.hidden = false;
    els.loadError.textContent =
      "Couldn't load the CSV files (" + err.message + "). " +
      "If you opened this file directly (a file:// URL), browsers block that — " +
      "use the GitHub Pages URL instead, or run a local static server (e.g. `python3 -m http.server`) " +
      "from the project folder and open the printed localhost URL.";
    return;
  }

  populateEpisodeFilter();
  wireEvents();
  render();
}

function populateEpisodeFilter() {
  const seen = [];
  for (const row of state.data.crewmates) {
    const key = row.episode_english;
    if (key && !seen.includes(key)) seen.push(key);
  }
  for (const ep of seen) {
    const opt = document.createElement("option");
    opt.value = ep;
    opt.textContent = ep;
    els.episodeFilter.appendChild(opt);
  }
}

function wireEvents() {
  els.tabs.forEach((btn) =>
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      els.tabs.forEach((b) => b.classList.toggle("active", b === btn));
      $("#episodeFilterWrap").hidden = state.tab !== "crewmates";
      $("#kindFilterWrap").hidden = state.tab !== "enemies";
      render();
    })
  );

  els.search.addEventListener("input", () => {
    state.query = els.search.value.trim().toLowerCase();
    render();
  });

  els.episodeFilter.addEventListener("change", () => {
    state.episode = els.episodeFilter.value;
    render();
  });

  els.kindFilter.addEventListener("change", () => {
    state.kind = els.kindFilter.value;
    render();
  });

  els.langButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      els.langButtons.forEach((b) => b.classList.toggle("active", b === btn));
      render();
    })
  );

  els.modalClose.addEventListener("click", closeModal);
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function closeModal() {
  els.modal.classList.remove("open");
}

function openModal(html) {
  els.modalBody.innerHTML = html;
  els.modal.classList.add("open");
}

function matches(haystackFields, q) {
  if (!q) return true;
  return haystackFields.some((f) => (f || "").toLowerCase().includes(q));
}

function render() {
  const q = state.query;
  let html = "";
  let count = 0;

  if (state.tab === "characters") {
    const rows = state.data.characters.filter((r) =>
      matches([r.name_korean, r.name_english, r.ability_korean, r.ability_english], q)
    );
    count = rows.length;
    html = rows.map(cardCharacter).join("");
  } else if (state.tab === "enemies") {
    let rows = state.data.enemies;
    if (state.kind !== "all") rows = rows.filter((r) => r.type === state.kind);
    rows = rows.filter((r) =>
      matches(
        [
          r.name_korean,
          r.name_english,
          r.defeat_condition_korean,
          r.defeat_condition_english,
          r.on_reveal_korean,
          r.on_reveal_english,
        ],
        q
      )
    );
    count = rows.length;
    html = rows.map(cardEnemy).join("");
  } else if (state.tab === "crewmates") {
    let rows = state.data.crewmates;
    if (state.episode !== "all") rows = rows.filter((r) => r.episode_english === state.episode);
    rows = rows.filter((r) =>
      matches([r.name_korean, r.name_english, r.ability_korean, r.ability_english], q)
    );
    count = rows.length;
    html = rows.map(cardCrewmate).join("");
  }

  els.resultCount.textContent = `${count} card${count === 1 ? "" : "s"}`;
  els.results.innerHTML = html || `<p class="empty">No cards match your search.</p>`;
  wireCardClicks();
}

function wireCardClicks() {
  document.querySelectorAll(".card[data-detail]").forEach((el) => {
    el.addEventListener("click", () => {
      openModal(el.dataset.detail);
    });
  });
}

function nameBlock(ko, en) {
  if (state.lang === "ko") return `<div class="name">${escapeHTML(ko)}</div>`;
  if (state.lang === "en") return `<div class="name">${escapeHTML(en)}</div>`;
  return `<div class="name">${escapeHTML(en)}<span class="name-ko">${escapeHTML(ko)}</span></div>`;
}

function textBlock(ko, en, cls = "ability") {
  if (state.lang === "ko") return `<div class="${cls}">${renderText(ko)}</div>`;
  if (state.lang === "en") return `<div class="${cls}">${renderText(en)}</div>`;
  return `
    <div class="${cls}">${renderText(en)}</div>
    <div class="${cls} ${cls}-ko">${renderText(ko)}</div>
  `;
}

function cardCharacter(r) {
  const img = `Cards/Characters/${r.jpg_reference}`;
  const detail = `
    <img class="modal-img" src="${img}" loading="lazy">
    <div class="modal-info">
      ${nameBlock(r.name_korean, r.name_english)}
      <h4>Ability</h4>
      ${textBlock(r.ability_korean, r.ability_english)}
    </div>
  `;
  return `
    <div class="card" data-detail="${escapeHTML(detail)}">
      <img class="thumb" src="${img}" loading="lazy" alt="${escapeHTML(r.name_english)}">
      <div class="card-body">
        ${nameBlock(r.name_korean, r.name_english)}
        ${textBlock(r.ability_korean, r.ability_english)}
      </div>
    </div>
  `;
}

function cardEnemy(r) {
  const img = `Cards/Enemies/${r.jpg_reference}`;
  const kindBadge = r.type === "boss" ? `<span class="badge badge-boss">BOSS</span>` : `<span class="badge">ENEMY</span>`;
  const threat = r.threat_english ? `<span class="stat">🔥 ${escapeHTML(r.threat_english)}</span>` : "";
  const bounty = r.bounty ? `<span class="stat">${escapeHTML(fmtBounty(r.bounty))}</span>` : "";
  const onReveal =
    r.on_reveal_english || r.on_reveal_korean
      ? `<h4>On Reveal</h4>${textBlock(r.on_reveal_korean, r.on_reveal_english)}`
      : "";
  const detail = `
    <img class="modal-img" src="${img}" loading="lazy">
    <div class="modal-info">
      ${kindBadge}
      ${nameBlock(r.name_korean, r.name_english)}
      <div class="stats">${threat}${bounty}</div>
      ${onReveal}
      <h4>Defeat Condition</h4>
      ${textBlock(r.defeat_condition_korean, r.defeat_condition_english)}
    </div>
  `;
  return `
    <div class="card" data-detail="${escapeHTML(detail)}">
      ${kindBadge}
      <img class="thumb" src="${img}" loading="lazy" alt="${escapeHTML(r.name_english)}">
      <div class="card-body">
        ${nameBlock(r.name_korean, r.name_english)}
        <div class="stats">${threat}${bounty}</div>
        ${textBlock(r.defeat_condition_korean, r.defeat_condition_english, "ability small")}
      </div>
    </div>
  `;
}

function cardCrewmate(r) {
  const img = `Cards/Crewmates/${r.jpg_reference}`;
  const uncertain = r.name_english.startsWith("Unidentified") || (r.notes && r.notes.length > 0);
  const badge = uncertain ? `<span class="badge badge-warn">?</span>` : "";
  const episode = `<span class="badge badge-episode">${escapeHTML(r.episode_english)}</span>`;
  const power = r.power ? `<span class="stat">P${escapeHTML(r.power)}</span>` : "";
  const notes = r.notes ? `<div class="notes">⚠ ${escapeHTML(r.notes)}</div>` : "";
  const detail = `
    <img class="modal-img" src="${img}" loading="lazy">
    <div class="modal-info">
      ${episode} ${power}
      ${nameBlock(r.name_korean, r.name_english)}
      <h4>Ability</h4>
      ${textBlock(r.ability_korean, r.ability_english)}
      ${notes}
    </div>
  `;
  return `
    <div class="card" data-detail="${escapeHTML(detail)}">
      ${badge}
      <img class="thumb" src="${img}" loading="lazy" alt="${escapeHTML(r.name_english)}">
      <div class="card-body">
        <div class="stats">${episode}${power}</div>
        ${nameBlock(r.name_korean, r.name_english)}
        ${textBlock(r.ability_korean, r.ability_english)}
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", boot);
