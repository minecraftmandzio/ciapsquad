# CIAPSQUAD – strona

Strona statyczna (HTML + CSS + JS) publikowana na GitHub Pages. Box „cwele sociale” uzupełnia sam bot Discorda przez GitHub Actions.

## Pliki

| Plik | Co to |
|---|---|
| `index.html`, `style.css`, `script.js` | strona |
| `logo.png`, `chomik.png` | grafiki (`ceo.jpg` wrzuć sam) |
| `dane/sociale.json` | lista osób w socialach (edytuje bot) |
| `dane/discord-stan.json` | ID ostatniej przeczytanej wiadomości (nie ruszać) |
| `.github/scripts/discord-sociale.mjs` | skrypt bota |
| `.github/workflows/strona.yml` | GitHub Actions: bot co 15 min + publikacja strony |

## Jak to działa

1. Co 15 minut GitHub Actions uruchamia skrypt.
2. Skrypt czyta nowe wiadomości z wybranego kanału na Discordzie.
3. Wiadomości w dobrym formacie dodają albo zmieniają osobę w `dane/sociale.json`. Bot daje ✅ albo ❌ z wyjaśnieniem.
4. Jeśli coś się zmieniło, Actions robi commit i publikuje stronę na nowo.

Bot nie musi być cały czas włączony, nie potrzeba żadnego serwera. Wada: zmiana pojawia się na stronie z opóźnieniem do ~15–20 minut (GitHub potrafi spóźniać zaplanowane zadania).

## Format wiadomości na Discordzie

Dodanie albo aktualizacja osoby:

```
!sociale
nazwa: PZH
x: @PZH
tiktok: @PZH
youtube: @PZH
```

- Platformy: `x`, `tiktok`, `youtube`, `twitch`, `instagram`, `chomikuj`, `discord`
- Skróty: `xitter`/`twitter` → x, `tt` → tiktok, `yt` → youtube, `ig` → instagram
- `@` przed nickiem jest opcjonalne
- Jeśli osoba o tej nazwie już jest, podane konta zostaną dopisane albo podmienione.

Usunięcie osoby:

```
!sociale-usun PZH
```

Pozostałe wiadomości na kanale bot ignoruje.

## Konfiguracja (jednorazowo)

### 1. Bot na Discordzie
1. Wejdź na https://discord.com/developers/applications → **New Application**.
2. Zakładka **Bot** → **Reset Token** → skopiuj token (to jest `DISCORD_TOKEN`, nikomu go nie pokazuj).
3. W tej samej zakładce włącz **Message Content Intent**. Bez tego bot widzi puste wiadomości.
4. Zakładka **OAuth2 → URL Generator**: zaznacz `bot`, a w uprawnieniach: *View Channels*, *Read Message History*, *Send Messages*, *Add Reactions*. Otwórz wygenerowany link i dodaj bota na serwer.
5. Utwórz kanał, np. `#sociale-strona`. W Discordzie włącz **Tryb dewelopera** (Ustawienia → Zaawansowane), kliknij kanał prawym → **Kopiuj ID kanału**.

### 2. Repozytorium na GitHubie
1. Wrzuć wszystkie pliki (razem z folderem `.github`) do repo, gałąź `main`.
2. **Settings → Pages → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions**:
   - zakładka *Secrets* → `DISCORD_TOKEN` = token bota
   - zakładka *Variables* → `DISCORD_KANAL` = ID kanału
   - *(opcjonalnie)* *Variables* → `DISCORD_DOZWOLENI` = ID użytkowników oddzielone przecinkami, którzy mogą dodawać osoby. Bez tego może każdy, kto pisze na kanale, więc najlepiej ustaw kanałowi uprawnienia.
4. Zakładka **Actions** → „Strona + sociale z Discorda” → **Run workflow**, żeby sprawdzić, czy działa.

Uwaga: GitHub wyłącza zaplanowane zadania w repo, w którym przez 60 dni nic się nie działo. Wtedy wystarczy je włączyć ponownie w zakładce Actions.

## Podgląd lokalnie

Otwórz folder w VS Code i uruchom **Live Server** (albo `python -m http.server`). Przy otwarciu `index.html` bezpośrednio z dysku sociale pokażą dane zapasowe, a filmik z YouTube może nie ruszyć.
