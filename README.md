# SQL Dry Run

### Practice real SQL and get graded on technique, not just the answer.

A browser-based SQL practice and exam-prep tool. You write real SQL against seeded SQLite databases (via [sql.js](https://github.com/sql-js/sql.js), running entirely in your browser) and get graded on **both** result correctness **and** whether you used the right technique — so a query that returns the right rows the wrong way is flagged, not rewarded.

**[▶ Try it live](https://michaelnocito.github.io/sql-dry-run/)**

> **Status: early development (v0.1).** The engine works and the grading is live, but the question bank is small. This is a work in progress — see the roadmap below.

---

## Why it exists

Most SQL practice sites only check your output. SQL Dry Run also checks *how* you got there: if a question is meant to teach `JOIN` or `GROUP BY`, a query that returns the right rows without using those keywords is marked **hardcoded**, not correct. Grading on technique is the point — it's what separates "got the answer" from "knows the skill."

## How grading works

Your query runs against a fresh SQLite database, then:

- **Correct** — rows match **and** required keywords were used
- **Hardcoded** — rows match but a required keyword is missing (right answer, wrong method)
- **Incorrect** — the rows don't match
- **Error** — the SQL didn't run

Results are compared order-insensitively unless the question is order-sensitive (e.g. `ORDER BY` questions).

## Skills covered

Six SQL skill areas, each linked to the matching [Analyst Prep Kit](https://michaelnocito.github.io/analyst-prep-kit/sql/) lessons:

`select-filter` · `aggregation` · `joins` · `subqueries` · `window-functions` · `string-date`

## Tech

- **100% client-side, no backend** — real SQLite via sql.js (WebAssembly), React + Vite, hosted on GitHub Pages.
- Attempt history stored locally in IndexedDB; mastery, streak, and level derived at read time.
- Questions are pure data — schema, prompt, hints, answer key (expected rows + required keywords), explanation, and a reference solution.

## Roadmap

- [x] Grading engine (result match + keyword check) and attempt log
- [x] First practice questions (select / filter)
- [ ] Full question bank — multiple questions per skill across all six areas
- [ ] Practice modes — diagnostic, mock exam, quick drill
- [ ] Polish — code editor with syntax highlighting, expected-vs-actual diff view

---

*Built by [Michael Nocito](https://www.linkedin.com/in/michaelnocito). Companion to the [Analyst Prep Kit](https://michaelnocito.github.io/analyst-prep-kit/).*
