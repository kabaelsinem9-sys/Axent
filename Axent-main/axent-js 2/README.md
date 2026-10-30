# Axent — JavaScript bookmarklets

An open-source MVP overlay for trading terminals. This repository contains JavaScript bookmarklets, shared source, build tools and documentation. It contains no website, HTML pages, server or external code loader.

## Terminal folders

```text
terminals/
  axiom/
  pump/
  fomo/
  trojan/
  padre/
  basedbot/
```

Each terminal folder includes:

- `bookmarklet.js` — complete, readable JavaScript for that terminal.
- `bookmarklet.txt` — the ready-to-save `javascript:` URL for a browser bookmark.

## Installation

1. Create a browser bookmark named `Axent · Axiom`, or use the name of your terminal.
2. Replace its address with the **entire** contents of the corresponding `bookmarklet.txt` file, including the `javascript:` prefix.
3. Open a token or pair in that terminal and click the saved bookmark.

The overlay detects the current token or pool from its URL or explicitly marked page attributes. It displays the pair, price, volume, liquidity and market capitalization when available. It follows navigation to another token automatically. Click the bookmark again or press Escape to close the panel.

To expose a draggable bookmark in an existing installation interface, use the contents of `bookmarklet.txt` as a link's `href`. A separate installation website is not included in this repository.

## Source and builds

- `src/detect.js` — current token and pair detection.
- `src/overlay.js` — overlay UI and public market-data requests.
- `platforms.mjs` — platform names, allowed domains and destination URLs.
- `scripts/build.mjs` — generates the standalone bookmarklets.
- `scripts/check.mjs` — checks generated code and core behavior.

The generated bookmarklets include all required code. Hosting is not required.

After editing the source, run these commands with Node.js 18 or later:

```sh
node scripts/build.mjs
node scripts/check.mjs
```

No npm dependencies are required. Checks cover generated JavaScript, domain guards, repeat-click closure, token and pool URL parsing, chain identification, automatic startup on the active pair, context transitions, market-data loading and error handling.

## Design

The monochrome interface follows the visual direction of the AXENT public website: a black background, white controls, thin gray borders, restrained typography and rounded buttons. This is an independent implementation; exact parity with the original closed-source overlay is not claimed.

## Data and limitations

The overlay uses the public [DEX Screener API](https://docs.dexscreener.com/api/reference). For a pool address, it requests that specific pair. For a token contract, it selects the most liquid indexed market. Market data refreshes every 15 seconds, and page context is checked every second. Provider data may be delayed.

When no unambiguous address is found, the panel waits for a token page. If the network of an EVM address is not specified, select it in the panel. The script does not guess the network. Manual entry and the watchlist are available under **Manual controls**. Watchlists are stored separately for each origin. Alerts and chart samples belong to the current session.

The overlay does not access wallets, read session credentials or execute trades. Original AXENT scripts are not loaded. A site's Content Security Policy may block bookmarklet execution or API requests.

Automatic detection has been checked against route fixtures for all six platforms and against a live market-data API. Full integration testing inside every authenticated terminal has not been completed. Changes to a terminal's routes or markup may require updates to `src/detect.js`.

## License

MIT. Platform names and trademarks belong to their respective owners.
