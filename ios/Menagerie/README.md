# Menagerie 🦎🍺

Point your phone at the taxidermy inside Invasive Species Brewing and the
critters tell you their story. Get close to a mount and its tale slides up;
leave a note next to it and everyone else in the bar can see it — for 24 hours,
then it fades like your memory of that fourth pour.

Phil's idea. Blame Phil.

## What it does

- **Only works at the bar.** A geofence around 726 NE 2nd Ave (60 m radius)
  gates the whole app. Outside it, you get a "come grab a stool" screen with
  your distance to the taps.
- **AR taxidermy stories.** ARKit image detection recognizes each mount from a
  reference photo. A glowing marker and name tag float next to it; walk within
  ~1.6 m and the story card slides up.
- **Ephemeral wall notes.** Anyone can pin a note to a specimen. Notes live in
  Supabase, are visible to everyone for 24 hours, then disappear (enforced by
  row-level security, not client code). The freshest few also float in AR next
  to the mount. Flag-to-hide moderation is built in (3 flags = gone).
- **Field Guide / demo mode.** A browsable list of all residents — used as a
  sheet in AR mode, and as the whole experience on the Simulator (no camera
  there) or when someone taps "Sneak past the bouncer" in a DEBUG build.

## Getting it running

Requirements: Xcode 15+, [XcodeGen](https://github.com/yonaskolb/XcodeGen)
(`brew install xcodegen`), an iPhone (AR needs a real device).

```bash
cd ios/Menagerie
xcodegen generate
open Menagerie.xcodeproj
```

Set your signing team on the Menagerie target, pick your iPhone, hit Run.
The `.xcodeproj` is gitignored — `project.yml` is the source of truth, so
re-run `xcodegen generate` after adding files.

## Wiring up notes (Supabase)

1. Run the migration against the same Supabase project the Beer Passport uses:
   `supabase/migrations/004_ar_notes.sql` (repo root). It creates the
   `ar_notes` table, 24-hour read policy, a 5-notes-per-hour-per-device rate
   limit, the `report_ar_note` flag RPC, and a purge helper.
2. Put the project URL and **anon** key (Settings → API) into
   `Menagerie/Resources/Supabase.plist`.
3. Optional: schedule the purge with pg_cron (snippet at the bottom of the
   migration).

Until that's done the app runs fine with notes disabled and says so on the card.

## Adding the real taxidermy

The specimens in `Menagerie/Resources/specimens.json` are six placeholder
Florida invaders with placeholder stories — swap in whatever's actually
mounted on the walls. For each mount:

1. **Photograph it** straight-on, in the bar's actual lighting, filling the
   frame. Flat, detailed, high-contrast subjects detect best (a mounted fish on
   a plaque is great; a fuzzy round head-on mount may need a nearby plaque or
   framed sign as the detection target instead).
2. **Measure** the real-world width of what's in the photo, in meters. ARKit
   needs this for scale and distance.
3. Drop the photo in `Menagerie/Resources/Detection/`, then set `imageName`
   (e.g. `"vlad.jpg"`) and `physicalWidthMeters` (e.g. `0.45`) in
   `specimens.json`, and rewrite `name`, `species`, `origin`, and `story`.
4. Re-run `xcodegen generate` and rebuild.

Specimens with `imageName: null` still show up in the Field Guide — they just
can't be detected by the camera yet.

## Tuning the geofence

The venue block at the top of `specimens.json` holds the pin
(26.13251, -80.14168 — OpenStreetMap's pin for the brewery) and the radius.
If regulars on the far patio get locked out, bump `radiusMeters`. There's
already 40 m of exit slack so the gate doesn't flap at the edge.

## Before the App Store

- Notes are user-generated content, so Apple wants moderation (guideline 1.2):
  flag-to-hide ships in this app, and notes self-destruct in 24 h. You should
  still add an EULA line about objectionable content.
- `ITSAppUsesNonExemptEncryption` is already set to skip the export questions.
- The camera/location permission copy lives in `Menagerie/Info.plist` — reword
  to taste.
