# GPS Antenna Pointer

Web app that helps a field engineer aim a Mikrotik SXTsq client antenna at a BTS when the BTS is not visible and the phone has no magnetometer (no compass).

## Problem

At MTN Cameroon, point-to-point radio links use two Mikrotik SXTsq radios (one at the BTS, one at the client). Both antennas must face each other. When line-of-sight to the BTS is blocked (buildings, hills, vegetation), and the installer's phone has no compass, there is no reliable way to aim by hand.

## Solution — landmark-based manual compass

We use a widely visible, well-known landmark as a **manual compass reference**. In Yaoundé, the chosen landmark is the **Palais de l'Unité in Étoudi** — the Presidential Palace — a prominent, universally known point in the city.

Workflow:

1. Open the app in a mobile browser → a **Setup modal** opens asking for the Reference point and the BTS point (latitude, longitude, optional name). Fields are empty by default; a **"Use defaults"** button fills in Palais Etoudi + Stade Omnisport. You may also tap **"Pick on map"** to drop a point by tapping. Tap **Start**.
2. The values are saved to `localStorage`, so on the next visit the map opens directly — no setup prompt.
3. The map fills the entire phone screen. Only the **angle pill** (top), **⚙ setup** (bottom-left) and **ℹ details** (bottom-right) are visible.
4. Accept geolocation permission → your position appears as a blue dot.
5. The map draws two lines: user → Reference (green), user → BTS (red). Signed rotation angle is shown in the top pill:
   - `+θ°` → rotate clockwise from the Reference direction by θ° to face the BTS
   - `-θ°` → rotate counter-clockwise
6. Tap **ℹ** to open the bottom sheet with bearings, distances, full coordinates, "Hide map background", "Fit all", and "Edit Ref / BTS".
7. Tap **⚙** anytime to change the Reference or BTS coordinates.
8. In the field: physically align your phone with the Reference landmark, then rotate by the displayed angle. That is the BTS direction — aim the SXTsq antenna there.

## Reference coordinates

| Landmark | Lat | Lon |
|---|---|---|
| Palais Etoudi / Palais de l'Unité (reference) | 3.9115189 | 11.5145381 |
| Stade Omnisport / Ahmadou Ahidjo, Mfandena (BTS test, default) | 3.8855294 | 11.5406743 |
| Hilton Yaoundé (BTS test, alternate) | 3.8645784 | 11.5156674 |

## Stack

- **Flask** — serves `templates/index.html` and `/sw.js` (at root scope for PWA).
- **Leaflet.js + OpenStreetMap tiles** — real map with streets as context; projection handles km↔pixel proportionality automatically.
- **leaflet-rotate plugin** — pinch-rotate the map with two fingers (like Google Maps). A small compass control appears at the top-right once the bearing is non-zero; the bottom-sheet **"North up"** button snaps back to 0°.
- **Browser Geolocation API** — user position.
- **Haversine + forward-azimuth formulas** on raw lat/lon — bearings and distances are independent of zoom level or map bearing.
- **PWA** — `static/manifest.json` + `static/sw.js` (service worker registered at root). App shell and Leaflet CDN assets are cached cache-first; OSM tiles are cached stale-while-revalidate, so previously visited areas work offline. Install prompt is wired via `beforeinstallprompt` (Android/Chrome); iPhone users add via Safari → Share → Add to Home Screen.

## Run

```bash
python3 app.py
# then open http://<host>:5000/
```

In a Codespace, use the forwarded port URL; accept geolocation permission in the browser. For best accuracy on the phone, open the forwarded URL on the phone itself (HTTPS is required by most browsers for geolocation — Codespaces-forwarded URLs are already HTTPS).

## Files

- `app.py` — Flask server (routes `/` and `/sw.js`).
- `templates/index.html` — single-page UI (map, setup modal, bearing math, angle display, bottom sheet, PWA registration).
- `static/manifest.json` — PWA manifest.
- `static/sw.js` — service worker (offline-cache shell + tiles).
- `static/icon.svg`, `static/icon-maskable.svg` — app icons.
- `README.md` — this file.

## For future Claude instances reading this directory

The bearing math is intentionally done in JS on raw coordinates (not pixel arithmetic). Don't "optimize" it by measuring pixel angles — accuracy must not depend on zoom. The Reference and BTS are user-configured through the setup modal and persisted in `localStorage` under key `gps-antenna-setup-v1`; defaults (Palais Etoudi + Stade Omnisport) live in the `DEFAULTS` constant for the "Use defaults" shortcut. The signed angle convention is: positive = clockwise rotation from reference→BTS.
