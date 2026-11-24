// Czyta wiadomości z kanału Discorda i aktualizuje dane/sociale.json.
// Uruchamiany przez GitHub Actions (.github/workflows/strona.yml), bez stałego serwera.
//
// Format wiadomości (dodanie albo aktualizacja osoby):
//   !sociale
//   nazwa: PZH
//   x: @PZH
//   tiktok: @PZH
//   youtube: @PZH
//
// Usunięcie osoby:
//   !sociale-usun PZH
//
// Bot daje reakcję ✅ (zrobione) albo ❌ i odpowiada, co jest nie tak.

import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const API = "https://discord.com/api/v10";
const PLIK_SOCIALE = "dane/sociale.json";
const PLIK_STAN = "dane/discord-stan.json";

export const PLATFORMY = ["x", "tiktok", "youtube", "twitch", "instagram", "chomikuj", "discord"];
const ALIASY = {
  twitter: "x", xitter: "x",
  tt: "tiktok",
  yt: "youtube",
  ig: "instagram", insta: "instagram",
  ch: "chomikuj",
  dc: "discord"
};
const MAX_OSOB = 100;

// ---------- parsowanie wiadomości ----------
export function parsujWiadomosc(tresc) {
  const linie = tresc.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!linie.length) return null;
  const pierwsza = linie[0].toLowerCase();

  if (pierwsza.startsWith("!sociale-usun")) {
    const nazwa = linie[0].slice("!sociale-usun".length).trim();
    if (!nazwa) return { blad: "Podaj nazwę osoby, np. `!sociale-usun PZH`." };
    return { typ: "usun", nazwa };
  }
  if (pierwsza !== "!sociale") return null; // zwykła wiadomość – ignorujemy

  let nazwa = null;
  const konta = {};
  for (const linia of linie.slice(1)) {
    const m = linia.match(/^([a-ząćęłńóśźż]+)\s*:\s*(.+)$/i);
    if (!m) return { blad: `Nie rozumiem linii: \`${linia}\` (ma być \`klucz: wartość\`).` };
    let klucz = m[1].toLowerCase();
    const wartosc = m[2].trim();
    if (klucz === "nazwa") {
      if (wartosc.length > 30) return { blad: "Nazwa może mieć maks. 30 znaków." };
      nazwa = wartosc;
      continue;
    }
    klucz = ALIASY[klucz] || klucz;
    if (!PLATFORMY.includes(klucz)) {
      return { blad: `Nieznana platforma \`${m[1]}\`. Dostępne: ${PLATFORMY.join(", ")}.` };
    }
    const nick = wartosc.replace(/^@/, "");
    if (!/^[A-Za-z0-9._-]{1,40}$/.test(nick)) {
      return { blad: `Zły nick \`${wartosc}\` – tylko litery, cyfry, kropka, _ i -.` };
    }
    konta[klucz] = nick;
  }
  if (!nazwa) return { blad: "Brakuje linii `nazwa: ...`." };
  if (!Object.keys(konta).length) return { blad: "Dodaj przynajmniej jedno konto, np. `x: @nick`." };
  return { typ: "dodaj", nazwa, konta };
}

export function zastosuj(osoby, polecenie) {
  const idx = osoby.findIndex(o => o.nazwa.toLowerCase() === polecenie.nazwa.toLowerCase());
  if (polecenie.typ === "usun") {
    if (idx === -1) return { blad: `Nie ma osoby „${polecenie.nazwa}”.` };
    osoby.splice(idx, 1);
    return { info: `Usunięto „${polecenie.nazwa}”.` };
  }
  if (idx === -1) {
    if (osoby.length >= MAX_OSOB) return { blad: "Za dużo osób na liście." };
    osoby.push({ nazwa: polecenie.nazwa, konta: polecenie.konta });
    return { info: `Dodano „${polecenie.nazwa}”.` };
  }
  osoby[idx].konta = { ...osoby[idx].konta, ...polecenie.konta };
  return { info: `Zaktualizowano „${osoby[idx].nazwa}”.` };
}

// ---------- Discord API ----------
async function discord(sciezka, opcje = {}) {
  for (let proba = 0; proba < 5; proba++) {
    const r = await fetch(API + sciezka, {
      ...opcje,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "CIAPSQUAD-sociale (github actions, 1.0)",
        ...(opcje.headers || {})
      }
    });
    if (r.status === 429) {
      const dane = await r.json().catch(() => ({}));
      await new Promise(res => setTimeout(res, ((dane.retry_after ?? 1) + 0.2) * 1000));
      continue;
    }
    if (!r.ok) throw new Error(`Discord ${opcje.method || "GET"} ${sciezka}: ${r.status} ${await r.text()}`);
    return r.status === 204 ? null : r.json();
  }
  throw new Error("Discord: za dużo prób (rate limit).");
}

async function pobierzNoweWiadomosci(kanal, poId) {
  const wszystkie = [];
  let po = poId;
  while (true) {
    const q = po ? `after=${po}&limit=100` : "limit=100";
    const paczka = await discord(`/channels/${kanal}/messages?${q}`);
    if (!paczka.length) break;
    wszystkie.push(...paczka);
    po = paczka.map(m => BigInt(m.id)).reduce((a, b) => (a > b ? a : b)).toString();
    if (paczka.length < 100 || !poId) break; // przy pierwszym uruchomieniu tylko ostatnie 100
  }
  return wszystkie.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

const reakcja = (kanal, id, emoji) =>
  discord(`/channels/${kanal}/messages/${id}/reactions/${encodeURIComponent(emoji)}/@me`, { method: "PUT" })
    .catch(e => console.warn("Nie udało się dodać reakcji:", e.message));

const odpowiedz = (kanal, id, tekst) =>
  discord(`/channels/${kanal}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: tekst,
      message_reference: { message_id: id },
      allowed_mentions: { parse: [] }
    })
  }).catch(e => console.warn("Nie udało się odpowiedzieć:", e.message));

// ---------- główna funkcja ----------
async function main() {
  const { DISCORD_TOKEN, DISCORD_KANAL, DISCORD_DOZWOLENI } = process.env;
  if (!DISCORD_TOKEN || !DISCORD_KANAL) {
    console.log("Brak DISCORD_TOKEN lub DISCORD_KANAL – pomijam.");
    return;
  }
  const dozwoleni = (DISCORD_DOZWOLENI || "").split(",").map(s => s.trim()).filter(Boolean);

  const osoby = JSON.parse(await readFile(PLIK_SOCIALE, "utf8"));
  const stan = JSON.parse(await readFile(PLIK_STAN, "utf8").catch(() => "{}"));

  const wiadomosci = await pobierzNoweWiadomosci(DISCORD_KANAL, stan.ostatniaWiadomosc);
  console.log(`Nowych wiadomości: ${wiadomosci.length}`);

  for (const w of wiadomosci) {
    stan.ostatniaWiadomosc = w.id;
    if (w.author?.bot) continue;

    const polecenie = parsujWiadomosc(w.content || "");
    if (!polecenie) continue;

    if (dozwoleni.length && !dozwoleni.includes(w.author.id)) {
      await reakcja(DISCORD_KANAL, w.id, "⛔");
      continue;
    }
    if (polecenie.blad) {
      await reakcja(DISCORD_KANAL, w.id, "❌");
      await odpowiedz(DISCORD_KANAL, w.id, polecenie.blad);
      continue;
    }
    const wynik = zastosuj(osoby, polecenie);
    if (wynik.blad) {
      await reakcja(DISCORD_KANAL, w.id, "❌");
      await odpowiedz(DISCORD_KANAL, w.id, wynik.blad);
    } else {
      console.log(wynik.info);
      await reakcja(DISCORD_KANAL, w.id, "✅");
    }
  }

  await writeFile(PLIK_SOCIALE, JSON.stringify(osoby, null, 2) + "\n");
  await writeFile(PLIK_STAN, JSON.stringify(stan, null, 2) + "\n");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
