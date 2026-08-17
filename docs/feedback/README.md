# User onboarding & feedback

This folder holds everything for the Level 5 user-growth requirement: the feedback
form spec, the response export, and the plan for turning feedback into product changes.

## 1. The Google Form (collection)

Create a Google Form with exactly these fields, then paste its share link into
`VITE_FEEDBACK_URL` (the in-app **Feedback** button embeds it) and into the main
[README](../../README.md#user-onboarding--feedback-google-form--excel).

| # | Question | Type |
|---|---|---|
| 1 | Your name | Short answer |
| 2 | Email | Short answer (response validation: email) |
| 3 | Your Stellar wallet address (the `G…` address you connected) | Short answer |
| 4 | How did you use Sentinel? | Checkboxes: *Set a threshold · Checked my risk · Funded / ran protection · Tried demo mode · Just explored* |
| 5 | Rate the product | Linear scale 1–5 |
| 6 | What worked, and what would you improve? | Paragraph |

The wallet address in Q3 is what ties a form response back to real on-chain
activity — cross-check it against the **Network Activity** dashboard (unique
wallets read live from the deployed contracts' events).

## 2. Export to Excel

Google Form → **Responses** → link to Sheets → **File → Download → Microsoft Excel (.xlsx)**.
Save the file here as `responses.xlsx` and commit it. The header schema is in
[`responses-template.csv`](responses-template.csv).

## 3. Feedback → product iteration

Summarise the ratings and themes, then turn them into commits. The mapping of
each shipped improvement to the gap it closed (with commit links) lives in the
main README's [Growth & product iteration](../../README.md#growth--product-iteration)
section — keep adding rows there as new feedback lands.

---

## How to onboard your 50+ testnet users

Real, signed on-chain activity is what counts (Demo Mode is read-only, so it
does **not** create a wallet interaction). The cheapest real interaction is
setting a threshold — one signed transaction.

**Share this (Discord / Telegram / X):**

> 🛡️ I built **Sentinel** — a non-custodial liquidation-protection layer for Blend on Stellar. Takes 2 min on testnet:
> 1. Install [Freighter](https://www.freighter.app/) → switch to **Testnet**
> 2. Fund your account at [Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
> 3. Open **https://son-fawn.vercel.app**, connect, and **set a warning threshold** (one signed tx)
> 4. (Optional) explore the Guardian and Risk Monitor, then fill the 30-sec feedback form
>
> No custody, all testnet, verifiable on-chain. Feedback form: `<GOOGLE_FORM_LINK>`

**Proof:** each person who sets a threshold (or runs any signed action) increments
the **Unique wallets** counter in the in-app Network Activity dashboard, read
directly from the contracts' events. Screenshot it once you pass 50 for the
submission — it's on-chain proof, not self-reported.
