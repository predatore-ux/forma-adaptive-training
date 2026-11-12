# Forma Â· accounts and training sync

Run from the repository root with Node 24 or newer: `node server.mjs`. Open http://127.0.0.1:4173. Select the athlete initials in the header or **Account & backup** in Activity. Guests can keep logging offline. New accounts can copy the current guest profile; existing accounts always load their own training. Keep the one-time recovery code in a password manager. Recovery rotates the code and signs out all other devices.

For multiple devices, serve the Node app at one HTTPS origin behind a reverse proxy. Configure HOST, PORT, NODE_ENV=production (secure cookies), and FORMA_DATA_DIR pointing to a private persistent volume. Use one Node instance with that SQLite volume. Static-only hosting serves the guest app but does not run the account API. Do not place the database or backups under dist/. No external provider, SMTP service or paid subscription is required.

Each set is appended once; individual settings have server revisions, and the active workout is a single versioned field. After concurrent offline edits to the same field, the first accepted edit wins. Logged sets from both devices are retained. Active session and rest deadline resume on another device after sync. The client syncs after saves, on reconnect, on focus and every 30 seconds. Sign-out requires connectivity and clears the account cache; guest history remains separate. Accounts do not automatically claim legacy pairing keys. Existing paired users should sync in guest mode before creating an account and choosing to copy their history.

Use Download training backup for a readable JSON export of the current profile and set history. For full service backups, run `node backup.mjs /private/path/to/new-backup.sqlite` with the same FORMA_DATA_DIR as the server. The consistent SQLite snapshot contains all accounts and training. Encrypt and protect it, schedule off-host copies, and test restores. To restore, stop the service and start it with FORMA_DATA_DIR set to a **new empty directory** containing the backup renamed training.sqlite. Never copy a live WAL database by copying its main file alone.

Run `node --test accounts.test.mjs` for the multi-device integration test.

## Activity analytics

Activity offers 8, 12, 26 and 52 calendar-week views for working sets, lifted load (kg × reps), cardio minutes, logged sessions, and new personal records. Weeks start Monday in the device's local timezone. Sessions with any logged sets count, even if unfinished. Future-dated sets are excluded. The first recorded performance is a baseline, not an improvement. PR comparisons use all available history, including records outside the selected date range.

Strength curves show the daily best e1RM for one selected exercise within a movement pattern; different variations are never combined into one curve. Epley estimates apply only to conventional externally loaded strength lifts with 2–10 reps; single reps use actual logged load. Timed, ballistic, unloaded, rotation and carry movements are excluded. Estimates describe recorded performance, not a prescription to attempt that load.

Volume landmarks are observed weekly set ranges over the previous four weeks, including zero-log weeks, rather than invented minimum/maximum recovery thresholds. Recovery trends begin with saved check-ins; past sample values are not fabricated as history. When recovery data is still sample, the displayed readiness score uses only the subjective check-in. Once real measurements are saved, its existing HRV/sleep contributions apply. Use the signal selector to inspect HRV, resting heart rate, sleep, energy, stress or soreness separately.

Optional weight, waist, hip and chest entries share an append-only observation store with readiness. Every entry has a unique ID so concurrent devices keep both entries; the latest dated measurement per day is charted. Records persist offline, sync to accounts, and are included in JSON and database backups. Photos are not stored. Existing set history requires no migration.

Validation: `node --test progress.test.mjs accounts.test.mjs`; `node ui-smoke.mjs` (Chrome path can be overridden with CHROME_PATH).

## Adaptive programs

The Program tab builds four-week blocks for strength, muscle development, conditioning or return to training. Choose 2–4 sessions per week; return-to-training uses two. Week 4 is a planned deload. Frequency determines sessions per block phase, not a calendar deadline: missed days never advance or compress training. Current experience, equipment, seated track and joint restrictions resolve the movement slots.

Each session saves its program ID, sequence position and deload status. Only a finished review with every movement's working sets logged advances the block. Skipping a movement or finishing early retains the position. Independent devices completing the same position advance it only once; all set logs and reviews remain. Switching away from an active program session opens its review first. The final set opens a resumable review screen.

Loads start at zero until an exposure to that exact variation has been logged in this block. The engine can suggest 2.5% more load (rounded to 0.5 kg) when the last completed exposure met every rep target within target effort and the phase isn't also increasing reps. Unweighted work progresses by one rep or minute with caps. Incomplete exposures and missed targets do not earn overload. High effort, more than 20% logged velocity loss, drained feeling or joint feedback reduce demand. New variations never inherit another exercise's load.

Two consecutive demanding reviews, suppressed current readiness, or the most recent non-deload review reporting discomfort of 4/10 or above trigger an early recovery workload. Deloads reduce sets, cap effort at 6, reduce established loads and avoid axial/high-demand movements. A completed early deload occupies one block position. Sample wearable values do not drive readiness flags. These are transparent deterministic coaching heuristics; they are not individualized clinical rehabilitation prescriptions. Free-text notes are retained and displayed, not interpreted as biometric inputs.

Program settings use account field revisions; reviews use the append-only observations store. Both are included in backups. Existing standalone sessions remain available. A completed block can be replaced from Program, with previous logs and reviews retained.

Tests: `node --test programming.test.mjs progress.test.mjs accounts.test.mjs`; browser coverage includes program creation, actual set submission, completion review, progressive load, partial-session handling, joint deload, persistence and mobile layout.
