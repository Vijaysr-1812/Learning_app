# Commonplace — a personal learning workspace

A Notion-inspired learning tracker built entirely with **HTML, CSS, and vanilla JavaScript**. No React, Node.js, npm, build step, external JavaScript, fonts, accounts, analytics, or application backend.

## Open the app

Double-click **index.html** in this folder, or use **Open with → Chrome / Edge / Firefox**. Keep the HTML, CSS, and JavaScript files together.

The app works without an internet connection. Book references and LeetCode links need internet access when you open them. Examples are study snippets, not an embedded code runner.

An optional development preview is included in `tools/preview.ps1`. It serves only an explicit list of app files on `127.0.0.1:8765`. This is a convenience for browser testing, not a dependency of the delivered application. Run it with PowerShell if you prefer a local HTTP address. Stop that PowerShell process to stop the preview.

## What is inside

| Path | Modules | Topics | Concept checkpoints |
| --- | ---: | ---: | ---: |
| AI Engineering | 11 | 25 | 75 |
| DSA in Java | 14 | 29 | 87 |
| System Design | 11 | 23 | 69 |
| SQL & PL/SQL | 13 | 26 | 78 |
| **Total** | **49** | **103** | **309** |

- An original explanation, worked example, and three concept checkpoints for every topic.
- **206 knowledge checks** with explanations you can reveal after attempting the question.
- **84 LeetCode problems**, grouped by Java DSA topic and difficulty.
- Status for every question: **Not attempted**, **Completed**, **Having an issue**, or **Revisit later**.
- An independent attempt counter for every problem and knowledge check. Attempts are recorded manually; changing status does not invent attempts.
- Topic statuses: **Not started**, **Learning**, **Completed**, and **Revisit later**.
- Automatic topic completion when all its concept checkpoints are checked. Practice progress remains independent of reading progress.
- Notes attached to the workspace, learning path, module, topic, checkpoint, or individual question.
- Colored sticky notes with titles, bullet points, checklist notation, bold text, pinning, editing, and a central searchable notebook.
- A revisit queue, progress summaries, a real activity calendar, learning streak, and editable weekly intention.
- Search across topics, concept details, problems, and your notes. Keyboard shortcut: **Ctrl+K** or **Cmd+K**.
- Book and documentation links, with source mapping on each topic.
- Responsive layouts and keyboard-accessible controls.

## Save, back up, and move your work

Notes and progress save automatically to **localStorage in the current browser**. They are not uploaded anywhere. The save indicator and warning banner report storage failures.

Use **Export backup** in the sidebar regularly. It downloads a JSON file containing notes, topic statuses, checkpoints, question statuses, attempts, activity, and your weekly goal.

Use **Restore backup** to load that file on another browser or computer. The app validates the file and asks you to review it before replacing the current workspace. Invalid files leave the current workspace unchanged.

Browser storage is tied to a browser profile and origin. File-URL storage behavior varies by browser. Renaming or moving the folder, changing from a file URL to a localhost URL, using a different port, using private browsing, or clearing browser data may give you a separate or empty workspace. Export before making those changes, then restore your backup. There is no automatic cloud sync.

Simultaneous editing is best avoided. A tab receives saved changes from other tabs when it is not editing a dialog. If changes conflict with an open editor, saving pauses rather than silently replacing another version; export the open work before refreshing.

## Curriculum and sources

The app consolidates **public book outlines and documentation topics** from the earlier recommendations into an original study roadmap. It groups overlapping subject matter so you can study a concept once and consult multiple books. It does **not** copy full book chapters, illustrations, proprietary exercises, or LeetCode problem statements. It is not an exhaustive transcription of every book subheading or a substitute for those books.

Open **Books & resources** inside the app for all 20 source entries and edition notes. The two System Design Interview volumes share one source entry. Public source pages were reviewed in September 2026. Framework examples are deliberately conceptual where APIs change quickly. DSA examples use Java; database examples favor Oracle SQL/PLSQL and include JDBC where relevant.

The older PL/SQL reference covers Oracle 12c-era material, and Expert Oracle Database Architecture covers through Oracle 21c. Match current Oracle documentation to your installed database version.

LeetCode links open the actual problem pages. The tracker does not read submissions, execute code, grade solutions, or synchronize with LeetCode. Knowledge-check explanations are for self-assessment.

## Files

- `index.html`: application shell and local script/style references.
- `styles.css`: responsive interface, theme, and print styles.
- `curriculum.js`: source registry, track definitions, and curriculum helpers.
- `ai.js`, `dsa.js`, `system.js`, `sql.js`: original lessons, examples, and practice links.
- `app.js`: navigation, rendering, notes, progress, persistence, search, and backup validation.
- `tests.html`, `tests.js`: browser-native checks, isolated from real progress.
- `tools/preview.ps1`: optional loopback-only static preview for development.

## Browser checks

Open `tests.html` using the optional local preview and click **Run checks**. The checks use a separate key, `commonplace.learning.v1.test`, and never clear or replace your real `commonplace.learning.v1` workspace. They cover all topic pages, curriculum integrity, progress, safe note rendering, filters, persistence after reload, backup validation and restoration, and responsive layout widths.

The preview-size dropdown also lets you inspect the app in desktop, tablet, and phone-sized frames. It is a development convenience, not part of the main learning workflow.

## Extend the curriculum

Add a `lesson(...)` entry to the relevant module in a track file. The arguments are: title, explanation, checkpoint strings (`Title::Explanation`), example, example explanation, review question, review answer, and optional LeetCode problems. Every topic receives a second self-explanation question automatically.

Keep existing module IDs and topic order stable once you have recorded progress: topic IDs include the module ID and topic position. Append new lessons instead of moving existing ones. If reorganizing existing IDs, implement a matching migration for saved progress and backups.
