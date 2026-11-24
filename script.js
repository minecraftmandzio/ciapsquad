// ================== POMOCNICZE ==================
const losuj = arr => arr[Math.floor(Math.random() * arr.length)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const teraz = () => {
  const d = new Date();
  const z = n => String(n).padStart(2, "0");
  return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()}, ${z(d.getHours())}:${z(d.getMinutes())}`;
};

// ================== TREŚCI SEKCJI ==================
const wpis = (data, autor, tekst) =>
  `<div class="wpis"><div class="wpis-meta">${data} · napisał(a) <b>${autor}</b></div>${tekst}</div>`;
const wkrotce = nazwa =>
  `<h1>${nazwa}</h1><p>Ta podstrona jeszcze nie istnieje.</p><p><span class="budowa"><span>W BUDOWIE</span></span></p>`;

const sekcje = {
  aktualnosci: { tytul: "O aktualnościach", html: () => `
    <h1>Witamy na CIAPSQUAD!</h1>
    <p>Oficjalna strona ekipy CIAPSQUAD. Rozgość się i wbijaj na forum.</p>
    ${wpis("24.11.2026, 20:00", "admin", "Ruszyło FORUM! Kliknij „FORUM” po lewej.")}
    ${wpis("20.11.2026, 18:42", "admin", "Dodaliśmy sekcję śmieszne filmiki.")}
    ${wpis("15.11.2026, 21:13", "ciap sweeney", "Strona wystartowała.")}` },
  forum:   { tytul: "Forum", html: () => forumWidok() },

  // przyciski bez podstron (na razie tylko nazwy)
  ekipa:   { tytul: "Ekipa",        html: () => wkrotce("Ekipa") },
  memy:    { tytul: "Memy",         html: () => wkrotce("Memy") },
  vip:     { tytul: "VIP",          html: () => wkrotce("VIP") },
  klasa:   { tytul: "Nasza klasa",  html: () => wkrotce("Nasza klasa") },
  galeria: { tytul: "Galeria",      html: () => wkrotce("Galeria") },
  download:{ tytul: "Download",     html: () => wkrotce("Download") },
  ksiega:  { tytul: "Księga gości", html: () => wkrotce("Księga gości") },
  gry:     { tytul: "Gry",          html: () => wkrotce("Gry") }
};

const tresc = document.getElementById("tresc");
const trescTytul = document.getElementById("tresc-tytul");
let aktualnaSekcja = "aktualnosci";

function pokazSekcje(nazwa) {
  aktualnaSekcja = nazwa;
  const s = sekcje[nazwa];
  tresc.innerHTML = s ? s.html() : "<h1>404</h1><p>Nie ma takiego czegoś.</p>";
  trescTytul.textContent = "CIAPSQUAD › " + (s ? s.tytul : "404");
  document.querySelectorAll("[data-sekcja]").forEach(el =>
    el.classList.toggle("aktywny", el.dataset.sekcja === nazwa)
  );
  if (nazwa === "forum") podepnijForum();
}

document.querySelectorAll("[data-sekcja]").forEach(el =>
  el.addEventListener("click", () => { forumDzial = null; pokazSekcje(el.dataset.sekcja); })
);
document.getElementById("logo-link").addEventListener("click", e => {
  e.preventDefault();
  pokazSekcje("aktualnosci");
});

// ================== FORUM ==================
const dzialy = [
  { id: "ogloszenia", ikona: "📢", nazwa: "Ogłoszenia", opis: "Ważne info od administracji. Czytać!",
    tematy: [
      { tytul: "Regulamin forum – PRZECZYTAJ", autor: "admin", odp: 12, data: "01.11.2026, 12:00" },
      { tytul: "Ruszyło forum CIAPSQUAD!", autor: "admin", odp: 34, data: "24.11.2026, 20:00" }
    ] },
  { id: "hydepark", ikona: "💬", nazwa: "Hyde Park", opis: "Gadanie o wszystkim i o niczym.",
    tematy: [
      { tytul: "Najlepszy chomik na świecie", autor: "osoba 2", odp: 21, data: "23.11.2026, 16:05" },
      { tytul: "Co dziś jedliście?", autor: "ciap sweeney", odp: 88, data: "24.11.2026, 19:41" }
    ] },
  { id: "gry", ikona: "🎮", nazwa: "Gry", opis: "W co gramy, kto gra wieczorem, szukam ekipy.",
    tematy: [
      { tytul: "Kto dziś gra?", autor: "osoba 1", odp: 9, data: "24.11.2026, 18:30" }
    ] },
  { id: "szkola", ikona: "📚", nazwa: "Szkoła", opis: "Sprawdziany, zadania domowe, ściągi (żart).",
    tematy: [
      { tytul: "Kiedy sprawdzian z matmy??", autor: "osoba 3", odp: 15, data: "22.11.2026, 21:12" }
    ] },
  { id: "offtop", ikona: "🗑️", nazwa: "Off-topic / Śmietnik", opis: "Tu lądują tematy, które nigdzie nie pasują.",
    tematy: [] }
];

// tematy dodane przez użytkownika zapisują się w przeglądarce
try {
  const zapis = JSON.parse(localStorage.getItem("ciapsquad-forum") || "{}");
  dzialy.forEach(d => { if (zapis[d.id]) d.tematy.push(...zapis[d.id]); });
} catch (e) { /* brak localStorage */ }

function zapiszForum(dzialId, temat) {
  try {
    const zapis = JSON.parse(localStorage.getItem("ciapsquad-forum") || "{}");
    (zapis[dzialId] = zapis[dzialId] || []).push(temat);
    localStorage.setItem("ciapsquad-forum", JSON.stringify(zapis));
  } catch (e) { /* trudno */ }
}

let forumDzial = null;

function forumWidok() {
  const sumaTematow = dzialy.reduce((s, d) => s + d.tematy.length, 0);
  const sumaPostow = dzialy.reduce((s, d) => s + d.tematy.reduce((a, t) => a + t.odp + 1, 0), 0);

  if (!forumDzial) {
    const wiersze = dzialy.map(d => {
      const ost = d.tematy[d.tematy.length - 1];
      const posty = d.tematy.reduce((a, t) => a + t.odp + 1, 0);
      return `<tr>
        <td class="forum-ikona">${d.ikona}</td>
        <td><span class="forum-nazwa" data-dzial="${d.id}">${d.nazwa}</span><div class="forum-opis">${d.opis}</div></td>
        <td class="liczba">${d.tematy.length}</td>
        <td class="liczba">${posty}</td>
        <td class="ostatni">${ost ? `${esc(ost.data)}<br>przez <b>${esc(ost.autor)}</b>` : "brak postów"}</td>
      </tr>`;
    }).join("");
    return `
      <div class="forum-sciezka">Forum CIAPSQUAD › Strona główna forum</div>
      <table class="forum-tabela">
        <tr><th></th><th>Dział</th><th>Tematy</th><th>Posty</th><th>Ostatni post</th></tr>
        ${wiersze}
      </table>
      <div class="forum-stopka">
        Tematów: <b>${sumaTematow}</b> · Postów: <b>${sumaPostow}</b> · Użytkowników: <b>7</b><br>
        Kto jest online: <b>admin</b>, <b>ciap sweeney</b>, <b>osoba 1</b> i 2 gości
      </div>`;
  }

  const d = dzialy.find(x => x.id === forumDzial);
  const wiersze = d.tematy.length
    ? d.tematy.slice().reverse().map(t => `<tr>
        <td class="forum-ikona">📄</td>
        <td><span class="forum-nazwa">${esc(t.tytul)}</span><div class="forum-opis">autor: ${esc(t.autor)}</div></td>
        <td class="liczba">${t.odp}</td>
        <td class="ostatni">${esc(t.data)}</td>
      </tr>`).join("")
    : `<tr><td colspan="4">Brak tematów. Bądź pierwszy!</td></tr>`;
  return `
    <div class="forum-sciezka"><a data-wroc>Forum CIAPSQUAD</a> › ${d.nazwa}</div>
    <table class="forum-tabela">
      <tr><th></th><th>Temat</th><th>Odp.</th><th>Ostatni post</th></tr>
      ${wiersze}
    </table>
    <form class="forum-form" id="forum-form">
      <b>Nowy temat</b>
      <input id="forum-nick" placeholder="Twój nick" maxlength="30" required>
      <input id="forum-tytul" placeholder="Tytuł tematu" maxlength="80" required>
      <button class="btn" type="submit">Wyślij</button>
    </form>`;
}

function podepnijForum() {
  tresc.querySelectorAll("[data-dzial]").forEach(el =>
    el.addEventListener("click", () => { forumDzial = el.dataset.dzial; pokazSekcje("forum"); })
  );
  const wroc = tresc.querySelector("[data-wroc]");
  if (wroc) wroc.addEventListener("click", () => { forumDzial = null; pokazSekcje("forum"); });

  const form = document.getElementById("forum-form");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const temat = {
      tytul: document.getElementById("forum-tytul").value.trim(),
      autor: document.getElementById("forum-nick").value.trim(),
      odp: 0,
      data: teraz()
    };
    if (!temat.tytul || !temat.autor) return;
    dzialy.find(x => x.id === forumDzial).tematy.push(temat);
    zapiszForum(forumDzial, temat);
    pokazSekcje("forum");
  });
}

// ================== OBRAZEK DNIA ==================
const obrazki = [
  ["🐸", "Żaba pełna mądrości", "radial-gradient(circle, #9ccc5a, #1d2511)"],
  ["🗿", "Kamienna twarz na sprawdzianie", "radial-gradient(circle, #888, #222)"],
  ["🦆", "Kaczka o poranku", "radial-gradient(circle, #8fd3ff, #10304a)"],
  ["🍕", "Pizza – zawsze dobry pomysł", "radial-gradient(circle, #ffcf6b, #5a2d00)"],
  ["🐙", "Ośmiornica gra na 8 klawiaturach", "radial-gradient(circle, #ff9ac0, #4a0f2a)"],
  ["🏆", "Puchar za nic", "radial-gradient(circle, #f5c542, #3a2a00)"]
];
const dzienRoku = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
let nrObrazka = dzienRoku % obrazki.length;

function rysujObrazek() {
  const [art, podpis, tlo] = obrazki[nrObrazka];
  const ramka = document.getElementById("obrazek-dnia");
  ramka.textContent = art;
  ramka.style.background = tlo;
  document.getElementById("obrazek-podpis").textContent = podpis;
}
rysujObrazek();
document.getElementById("obrazek-dnia").addEventListener("click", () => {
  nrObrazka = (nrObrazka + 1) % obrazki.length;
  rysujObrazek();
});

// ================== NOWOŚĆ ==================
const nowosci = [
  { tytul: "Ruszyło FORUM", opis: "Kliknij „FORUM” po lewej." },
  { tytul: "Losowy chomik", opis: "Kliknij chomika w stopce." },
  { tytul: "Nowy filmik", opis: "Obok, w śmiesznych filmikach." }
];
let nrNowosci = 0;
function pokazNowosc() {
  const n = nowosci[nrNowosci];
  document.getElementById("nowosc").innerHTML = `<div class="tytul">${n.tytul}</div><div>${n.opis}</div>`;
  nrNowosci = (nrNowosci + 1) % nowosci.length;
}
pokazNowosc();
setInterval(pokazNowosc, 5000);

// ================== ŚMIESZNE FILMIKI (odtwarzacz YouTube) ==================
const film = document.getElementById("film");
document.getElementById("film-start").addEventListener("click", () => {
  const id = film.dataset.yt;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  iframe.title = "Śmieszny filmik";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  film.innerHTML = "";
  film.appendChild(iframe);
});
// YouTube nie odtwarza filmików na stronach otwartych bezpośrednio z pliku (file://)
if (location.protocol === "file:") {
  const info = document.createElement("p");
  info.className = "film-info";
  info.textContent = "Jeśli filmik nie rusza: otwórz stronę przez serwer (np. Live Server), a nie z pliku.";
  film.parentElement.appendChild(info);
}

// ================== LOSOWY CHOMIK ==================
const animacje = ["anim-skok", "anim-obrot", "anim-taniec", "anim-puls"];
const filtry = ["none", "hue-rotate(90deg)", "hue-rotate(200deg)", "sepia(1)", "saturate(3)", "invert(1)", "grayscale(1)"];
const chomikImg = document.getElementById("chomik-img");

function losujChomika() {
  chomikImg.className = losuj(animacje);
  chomikImg.style.filter = losuj(filtry);
  chomikImg.style.transform = Math.random() < 0.5 ? "scaleX(-1)" : "";
}
losujChomika();
document.getElementById("chomik").addEventListener("click", losujChomika);

// ================== SOCIALE (karuzela, dane z dane/sociale.json) ==================
// Plik dane/sociale.json uzupełnia automatycznie bot Discorda (GitHub Actions).
const PLATFORMY = {
  x:         { skrot: "X",  nazwa: "X (Twitter)", url: h => `https://x.com/${h}` },
  tiktok:    { skrot: "TT", nazwa: "TikTok",      url: h => `https://www.tiktok.com/@${h}` },
  youtube:   { skrot: "YT", nazwa: "YouTube",     url: h => `https://www.youtube.com/@${h}` },
  twitch:    { skrot: "TV", nazwa: "Twitch",      url: h => `https://www.twitch.tv/${h}` },
  instagram: { skrot: "IG", nazwa: "Instagram",   url: h => `https://www.instagram.com/${h}` },
  chomikuj:  { skrot: "CH", nazwa: "Chomikuj",    url: h => `https://chomikuj.pl/${h}` },
  discord:   { skrot: "DC", nazwa: "Discord",     url: h => `https://discord.gg/${h}` }
};

// zapasowe dane, gdy nie da się wczytać pliku (np. strona otwarta z dysku)
let osoby = [
  { nazwa: "PZH", konta: { x: "PZH", tiktok: "PZH", youtube: "PZH" } }
];
let nrOsoby = 0;

function pokazOsobe() {
  const lista = document.getElementById("soc-lista");
  const o = osoby[nrOsoby];
  document.getElementById("osoba-nazwa").textContent = o ? o.nazwa : "brak osób";
  lista.innerHTML = "";
  const konta = o ? Object.entries(o.konta || {}).filter(([p]) => PLATFORMY[p]) : [];
  if (!konta.length) {
    lista.innerHTML = `<li class="soc-pusto">brak kont</li>`;
  }
  konta.forEach(([platforma, nick], i) => {
    const pl = PLATFORMY[platforma];
    const li = document.createElement("li");
    li.innerHTML = `<a target="_blank" rel="noopener" title="${pl.nazwa}">
        <span class="soc-ikona soc-${platforma}">${pl.skrot}</span>
        <span class="soc-nick"></span>
      </a>`;
    li.querySelector("a").href = pl.url(encodeURIComponent(nick));
    li.querySelector(".soc-nick").textContent = "@" + nick;
    lista.appendChild(li);
  });
  document.getElementById("soc-licznik").textContent = osoby.length ? `${nrOsoby + 1} / ${osoby.length}` : "";
}
document.getElementById("soc-lewo").onclick = () => { if (!osoby.length) return; nrOsoby = (nrOsoby - 1 + osoby.length) % osoby.length; pokazOsobe(); };
document.getElementById("soc-prawo").onclick = () => { if (!osoby.length) return; nrOsoby = (nrOsoby + 1) % osoby.length; pokazOsobe(); };
pokazOsobe();

fetch("dane/sociale.json", { cache: "no-store" })
  .then(r => r.ok ? r.json() : Promise.reject(r.status))
  .then(dane => {
    if (Array.isArray(dane) && dane.length) { osoby = dane; nrOsoby = 0; pokazOsobe(); }
  })
  .catch(() => { /* zostają dane zapasowe */ });

// ================== CEO – miejsce na obrazek ==================
const ceoImg = document.getElementById("ceo-img");
const ceoRamka = ceoImg.parentElement;
ceoImg.addEventListener("error", () => ceoRamka.classList.add("pusta"));
if (ceoImg.complete && ceoImg.naturalWidth === 0) ceoRamka.classList.add("pusta");

// ================== EMOTKA I LICZNIK ODWIEDZIN ==================
const emotki = [":D", "xD", ";)", ":P", "8)", "^^", "o.O"];
document.getElementById("emotka").addEventListener("click", e => {
  e.target.textContent = losuj(emotki);
});

let odwiedziny = 1337;
try {
  odwiedziny = Number(localStorage.getItem("ciapsquad-licznik") || 1336) + 1;
  localStorage.setItem("ciapsquad-licznik", odwiedziny);
} catch (e) { /* brak localStorage */ }
document.getElementById("licznik").textContent = String(odwiedziny).padStart(6, "0");

// start
pokazSekcje("aktualnosci");
