# Mind Reader

Mind Reader is a polished local-first web guessing game with two mirrored modes:

- `Read My Mind`: the player thinks of an entity, answers fixed prompts, and the chamber tries to guess it.
- `Guess My Mind`: the chamber picks a secret entity, answers from a shared question bank, and the player tries to uncover it.

The MVP ships with a shared knowledge base of 110 entities across:

- Fictional Characters
- Animals

It uses one typed inference engine for both modes, difficulty-specific limits, local persistence for stats/history, and a teach-the-game flow when the chamber fails.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Local data only, with `localStorage` persistence

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Gameplay notes

- `Read My Mind` uses weighted fuzzy scoring plus balanced-split question selection rather than random prompts.
- `Guess My Mind` uses the same question bank and entity attributes, but flips the loop so the player is interrogating the chamber instead.
- Difficulty changes both question budgets and guess budgets.
- If the chamber loses in `Read My Mind`, the result screen can store the missed entity and a note in local storage.

## Verification

The app has been verified with:

- `npm run lint`
- `npm run build`
- Manual browser smoke testing for the landing page, setup flow, `Read My Mind` question progression, and `Guess My Mind` question/guess interactions
