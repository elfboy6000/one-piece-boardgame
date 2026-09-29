# 원피스 보드게임 — 동료들과 바다로 (One Piece: To the Sea with Your Crewmates)

Digitized card data for the One Piece cooperative board game "동료들과 바다로." This repo holds scanned card images and CSV extractions (Korean text + English translation) for each card type.

## Repo layout

```
Cards/
  Characters/   10 character cards (+ card back) — characters.csv
  Enemies/      26 enemy + 10 boss cards (+ card back) — enemies.csv
  Crewmates/    54 crewmate cards (+ card back) — crewmates.csv
```

Each `.jpg` is named after the English name of the character/card it depicts, and each folder's CSV cross-references the image via a `jpg_reference` column, alongside the Korean name/text, an English translation, and relevant stats (Power, Threat, Bounty, etc.).

Some `crewmates.csv` rows are minor/background characters whose names could not be confidently read off the card art (nameplates are stylized Korean text) — these are marked `미확인` (unidentified) with a `notes` column explaining why, and are named `Unidentified_*.jpg`. Feel free to correct these once you have the physical cards in hand.

## Game overview

A cooperative pirate-adventure game for multiple players. Everyone shares one goal: defeat enemies and gather crewmates together before the shared **Flame** (danger meter) fills up. Reach the end of the enemy deck and your combined bounty crowns you with a pirate title, from 평범한 나부랭이 (Ordinary Nobody) all the way up to 사황 (Yonko/Emperor).

## Components

- **캐릭터 카드 (Character cards, 10)** — each player picks one to represent them (Luffy, Zoro, Nami, Usopp, Sanji, Chopper, Robin, Franky, Brook, Jinbe). Each has a unique ability keyed off the [Die].
- **동료 카드 (Crewmate cards, 54)** — the cards you recruit into your hand/board. Each shows a **Power** number, and often an ability (a keyword like Move/Swap/Recruit/Power Up!, or custom text). Grouped into 6 "episodes" (story arcs) of 9 cards each: Alabasta, Marineford, Revolutionary Army, Dressrosa, Whole Cake Island, Wano Country.
- **적 카드 (Enemy cards, 26)** — each shows a **Threat** value (the Flame number needed to face it), a **defeat condition** (a combinatorial condition on your crewmates' Power/colour), and a **bounty** reward for defeating it.
- **보스 카드 (Boss cards, 10)** — harder enemies used in the Boss Rush variant; each has an extra "On Reveal" (등장) effect that triggers immediately when flipped, on top of its defeat condition.
- **Tokens**: 주사위 (die), 위협 토큰 (threat token), 파워업/파워다운 토큰 (Power Up!/Power Down token — also marks "ability used").

## Turn structure (clockwise)

1. **영입 Recruit** — draw the top crewmate card and place it face up in front of you (unless it has a Recruit-only ability, which resolves immediately instead).
2. **대결 Duel** — check the current enemy's defeat condition against your crewmates; if satisfied, defeat it (score its bounty, move it to the defeated pile).
3. **휴식 Rest** — if your enemy space is empty, refill/flip enemies; play passes to the next player's space.

## Ability keyword vocabulary

| Keyword | Effect |
|---|---|
| 교환 Swap | Trade a chosen crewmate card with another player's chosen crewmate. |
| 이동 Move | Choose a crewmate card, move it to any crewmate space. |
| 파워업! Power Up! | Place a Power Up token on a crewmate (+1 Power each, stackable). |
| 영입 Recruit | Immediately trigger a hand crewmate's ability. |
| 저지 Prevent/Block | Cancel an enemy (or boss) card's ability/condition from activating. |
| 🎲 [Die] | Roll once for the value; some effects let you pick any value 1–5 instead of rolling. |

## Setup

Each player picks 1 character (Luffy included by default) and gets 7 Power Up tokens. Shuffle the 26 enemy cards face down (mixing in boss cards for the Boss Rush variant) and reveal the leftmost 3 enemy spaces. Shuffle the full 54-card crewmate deck and deal to the board's crewmate spaces plus each player's starting hand. The Flame/threat token starts at 0.

## End conditions

1. **패배 Defeat** — if the "fallen crewmate" area ever reaches 5+ cards, everyone loses (no bounty counted).
2. **Deck depletion** — if the crewmate deck runs out when a draw is needed, the game ends.
3. **해적왕! Pirate King** — defeat every card in the enemy deck to win. Your final title is based on the combined bounty of every enemy you defeated:

   | Bounty | Title |
   |---|---|
   | 0 – 10,000,000 | 평범한 나부랭이 Ordinary Nobody |
   | 11,000,000 – 20,000,000 | 조무래기 해적 Petty Pirate |
   | 21,000,000 – 30,000,000 | 이스트 블루 해적 East Blue Pirate |
   | 31,000,000 – 40,000,000 | 위대한 항로 해적 Grand Line Pirate |
   | 41,000,000 – 50,000,000 | 대해적 Great Pirate |
   | 51,000,000 – 60,000,000 | 최악의 세대 Worst Generation |
   | 61,000,000 – 70,000,000 | 칠무해 Shichibukai |
   | 71,000,000+ | 사황 Yonko/Emperor |

## Variants

- **보스 러시 Boss Rush** — mix boss cards into the enemy deck before shuffling for a harder game; abilities that say "적" (enemy) only affect a boss if they explicitly say "보스."
- **솔로 모드 Solo mode** — single player uses a fixed 6-card hand instead of the normal draw; enemy effects target your own character; Swap/Move/Recruit abilities get reworded to target yourself.

## Terminology reference (for future extractions)

| Korean | English |
|---|---|
| 동료 | Crewmate |
| 적 | Enemy |
| 보스 | Boss |
| 현상금 | Bounty |
| 위협 | Threat |
| 격퇴 조건 | Defeat condition |
| 파워 | Power |
| 🔥 | Flame |
| 🎲 | Die |
