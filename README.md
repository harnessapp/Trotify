# Trotify Dashboard v1

Static starter homepage for the Trotify web hub.

## Files

- `index.html`
- `styles.css`
- `script.js`
- `trotify-logo.png` placeholder expected but optional

## Setup

Put these files in a GitHub Pages repo/folder.

If you have your real logo, place it in the same folder as:

`trotify-logo.png`

## Data

By default, `script.js` tries to load:

`upcoming_fields.csv`

from the same folder.

To use your GitHub-hosted CSV, update this line in `script.js`:

```js
const CSV_URL = "upcoming_fields.csv";
```

to something like:

```js
const CSV_URL = "https://raw.githubusercontent.com/harnessapp/harness-csv-data/main/upcoming_fields.csv";
```

## Next steps

1. Add real links to each nav item and tile.
2. Replace placeholder Stable Changes count.
3. Wire Daily Wrap tile to `daily_wraps.json`.
4. Replace Good Leader placeholder logic with your final rules.
