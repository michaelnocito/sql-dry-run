// Healthcare Migration — industry track (6 questions)
// Same core SQL skills as the general bank, set in a real EHR data-migration
// scenario: reconcile → dedup → handle nulls → map codes → check FK integrity → grain.
// Tagged track:'healthcare' so they stay out of the general diagnostic/practice/mock.
//
// Convention: prompts describe the task in BUSINESS terms and never name the SQL
// tables — the learner opens the (collapsed) Tables panel to discover names/columns.
// Each question's LAST hint is a complete, runnable query. plainSummary powers the
// "Explain this query" panel (plain-English mechanics).

// Shared scenario: a legacy patient system being migrated into a new EHR.
const HC_SCHEMA = `CREATE TABLE legacy_patients (
  patient_id INTEGER, mrn TEXT, first_name TEXT, last_name TEXT,
  dob TEXT, email TEXT, phone TEXT, status_code TEXT
);
INSERT INTO legacy_patients VALUES
  (1,'MRN001','Maria','Santos','1985-03-12','maria@mail.com','555-0101','A'),
  (2,'MRN002','James','Okafor','1978-11-30',NULL,'555-0102','I'),
  (3,'MRN003','Wei','Zhang',NULL,'wei@mail.com',NULL,'A'),
  (4,'MRN001','Maria','Santos','1985-03-12','maria@mail.com','555-0101','A'),
  (5,'MRN004','Aisha','Bello','1990-07-22',NULL,NULL,'d'),
  (6,'MRN005','John','Smith','1965-01-05',NULL,'555-0105',NULL);

CREATE TABLE encounters (
  encounter_id INTEGER, patient_id INTEGER, visit_date TEXT, provider_id INTEGER
);
INSERT INTO encounters VALUES
  (101,1,'2025-02-10',10),(102,1,'2025-04-18',11),(103,2,'2025-03-01',10),
  (104,3,'2025-05-09',12),(105,99,'2025-06-01',10);`

// ── 1 · Reconciliation ────────────────────────────────────────────────────────
export const HC_RECONCILE = {
  questionId: 'hc-reconcile',
  skill: 'aggregation', difficulty: 'easy', mode: 'practice', track: 'healthcare',

  schema: HC_SCHEMA,

  prompt: "Before migrating, sanity-check the source. Return the total number of patient rows and the number of distinct MRNs, as total_rows and distinct_mrns. (If they differ, you have duplicates to resolve first.)",

  hints: [
    "Open the Tables panel to find the patient table and its columns.",
    "COUNT(*) counts every row; COUNT(DISTINCT mrn) counts unique medical record numbers. You can return both in one SELECT with two aliased aggregates.",
    "SELECT COUNT(*) AS total_rows, COUNT(DISTINCT mrn) AS distinct_mrns FROM legacy_patients",
  ],

  answerKey: {
    expectedRows: [{ total_rows: 6, distinct_mrns: 5 }],
    requireKeywords: ['COUNT', 'DISTINCT'],
    orderSensitive: false,
  },

  explanation: "The first query in any migration: COUNT(*) vs COUNT(DISTINCT key). Here 6 rows but only 5 distinct MRNs means one duplicate patient record is hiding in the source — you'd resolve it before loading into the new EHR.",

  plainSummary: "It uses COUNT(*) to tally every patient row and COUNT(DISTINCT mrn) to tally only the unique medical record numbers, returning both side by side. If the two numbers don't match, duplicates are hiding in the data.",

  solutionQuery: `SELECT COUNT(*) AS total_rows, COUNT(DISTINCT mrn) AS distinct_mrns
FROM legacy_patients`,
}

// ── 2 · Dedup ─────────────────────────────────────────────────────────────────
export const HC_DEDUP = {
  questionId: 'hc-dedup',
  skill: 'aggregation', difficulty: 'medium', mode: 'practice', track: 'healthcare',

  schema: HC_SCHEMA,

  prompt: "Find which MRNs appear more than once so they can be merged before load. Return mrn and the row count as n.",

  hints: [
    "GROUP BY mrn bundles rows that share a medical record number.",
    "HAVING filters groups after aggregation — use it to keep only groups with a count above 1.",
    "SELECT mrn, COUNT(*) AS n FROM legacy_patients GROUP BY mrn HAVING COUNT(*) > 1",
  ],

  answerKey: {
    expectedRows: [{ mrn: 'MRN001', n: 2 }],
    requireKeywords: ['GROUP BY', 'HAVING'],
    orderSensitive: false,
  },

  explanation: "GROUP BY <natural key> HAVING COUNT(*) > 1 is THE duplicate-detection pattern. In healthcare the natural key is the MRN — duplicate patient records are the #1 EHR-migration headache, so you surface them before they multiply downstream.",

  plainSummary: "It uses GROUP BY to pile rows together by MRN, COUNT(*) to measure how big each pile is, and HAVING to keep only the piles bigger than one — i.e. the MRNs that show up more than once.",

  solutionQuery: `SELECT mrn, COUNT(*) AS n
FROM legacy_patients
GROUP BY mrn
HAVING COUNT(*) > 1`,
}

// ── 3 · Null handling ─────────────────────────────────────────────────────────
export const HC_COALESCE = {
  questionId: 'hc-coalesce',
  skill: 'select-filter', difficulty: 'easy', mode: 'practice', track: 'healthcare',

  schema: HC_SCHEMA,

  prompt: "The new EHR requires a non-null contact for every patient. Return each patient's mrn and a contact value that falls back to email first, then phone, then the literal 'NO CONTACT ON FILE' when both are missing.",

  hints: [
    "COALESCE returns the first non-NULL value from a list, left to right.",
    "Give it three arguments: the email, the phone, and a literal fallback string.",
    "SELECT mrn, COALESCE(email, phone, 'NO CONTACT ON FILE') AS contact FROM legacy_patients",
  ],

  answerKey: {
    expectedRows: [
      { mrn: 'MRN001', contact: 'maria@mail.com' },
      { mrn: 'MRN002', contact: '555-0102' },
      { mrn: 'MRN003', contact: 'wei@mail.com' },
      { mrn: 'MRN001', contact: 'maria@mail.com' },
      { mrn: 'MRN004', contact: 'NO CONTACT ON FILE' },
      { mrn: 'MRN005', contact: '555-0105' },
    ],
    requireKeywords: ['COALESCE'],
    orderSensitive: false,
  },

  explanation: "Target systems with NOT NULL constraints reject blank fields. COALESCE(email, phone, 'NO CONTACT ON FILE') supplies a graceful fallback so the load doesn't fail — and so you don't silently drop patients whose contact info was incomplete.",

  plainSummary: "It uses COALESCE, which walks a list left to right and returns the first value that isn't empty (NULL). So it tries email, then phone, and if both are blank it falls back to the text 'NO CONTACT ON FILE'.",

  solutionQuery: `SELECT mrn, COALESCE(email, phone, 'NO CONTACT ON FILE') AS contact
FROM legacy_patients`,
}

// ── 4 · Code crosswalk ────────────────────────────────────────────────────────
export const HC_CASE_MAP = {
  questionId: 'hc-case-map',
  skill: 'select-filter', difficulty: 'medium', mode: 'practice', track: 'healthcare',

  schema: HC_SCHEMA,

  prompt: "Map the legacy status_code to the new system's labels: A → Active, I → Inactive, D → Deceased, and anything else (including NULL) → 'Needs Review'. Watch out: legacy codes are inconsistently cased. Return mrn and status_label.",

  hints: [
    "CASE is SQL's if/else. Normalize the case first so 'd' and 'D' both match — wrap the column in UPPER().",
    "Add an ELSE branch to catch NULLs and any unexpected code as 'Needs Review'. Remember CASE is just one column inside a full SELECT … FROM … statement.",
    "SELECT mrn, CASE UPPER(status_code) WHEN 'A' THEN 'Active' WHEN 'I' THEN 'Inactive' WHEN 'D' THEN 'Deceased' ELSE 'Needs Review' END AS status_label FROM legacy_patients",
  ],

  answerKey: {
    expectedRows: [
      { mrn: 'MRN001', status_label: 'Active' },
      { mrn: 'MRN002', status_label: 'Inactive' },
      { mrn: 'MRN003', status_label: 'Active' },
      { mrn: 'MRN001', status_label: 'Active' },
      { mrn: 'MRN004', status_label: 'Deceased' },
      { mrn: 'MRN005', status_label: 'Needs Review' },
    ],
    requireKeywords: ['CASE'],
    orderSensitive: false,
  },

  explanation: "Legacy data is dirty — mixed case ('d') and NULLs. UPPER() normalizes before matching, and the ELSE catch-all keeps unmapped or missing codes visible as 'Needs Review' instead of silently dropping them. That's the difference between a robust crosswalk and one that loses Aisha's record.",

  plainSummary: "It uses CASE — SQL's if/else — to check each patient's status_code and swap the short code for a full label. UPPER() forces the code to a capital letter first so 'd' and 'D' are treated the same, and the ELSE branch catches blanks or unknown codes as 'Needs Review'. The whole CASE is one column inside a normal SELECT … FROM statement.",

  solutionQuery: `SELECT mrn,
  CASE UPPER(status_code)
    WHEN 'A' THEN 'Active'
    WHEN 'I' THEN 'Inactive'
    WHEN 'D' THEN 'Deceased'
    ELSE 'Needs Review'
  END AS status_label
FROM legacy_patients`,
}

// ── 5 · FK integrity (anti-join) ──────────────────────────────────────────────
export const HC_ORPHANS = {
  questionId: 'hc-orphans',
  skill: 'joins', difficulty: 'hard', mode: 'practice', track: 'healthcare',

  schema: HC_SCHEMA,

  prompt: "The new system enforces a foreign key: every visit must point to a real patient. Find the visit records whose patient_id has no matching patient — these would fail the load. Return encounter_id and patient_id.",

  hints: [
    "Open the Tables panel: there's a visit table and a patient table linked by patient_id.",
    "Keep ALL visits with a LEFT JOIN to the patients, then look for the ones that found no match — unmatched rows have NULL on the patient side.",
    "SELECT e.encounter_id, e.patient_id FROM encounters e LEFT JOIN legacy_patients p ON e.patient_id = p.patient_id WHERE p.patient_id IS NULL",
  ],

  answerKey: {
    expectedRows: [{ encounter_id: 105, patient_id: 99 }],
    requireKeywords: ['LEFT JOIN', 'IS NULL'],
    orderSensitive: false,
  },

  explanation: "The anti-join: LEFT JOIN then WHERE the right-side key IS NULL. It finds orphan records that would violate a foreign-key constraint on load. Visit 105 points at patient 99, who doesn't exist — catch it before the migration fails, not after.",

  plainSummary: "It uses a LEFT JOIN to line up every visit against its patient, keeping the visit even when no patient matches. The WHERE … IS NULL then keeps only those unmatched visits — the orphans that would break a foreign key on load.",

  solutionQuery: `SELECT e.encounter_id, e.patient_id
FROM encounters e
LEFT JOIN legacy_patients p ON e.patient_id = p.patient_id
WHERE p.patient_id IS NULL`,
}

// ── 6 · Grain / fan-out ───────────────────────────────────────────────────────
export const HC_GRAIN = {
  questionId: 'hc-grain',
  skill: 'joins', difficulty: 'hard', mode: 'practice', track: 'healthcare',

  schema: HC_SCHEMA,

  prompt: "Verify how many visits each patient has. Return each patient's mrn and their visit total as encounter_count — patients with no visits must show 0, and the join must not inflate the counts.",

  hints: [
    "LEFT JOIN the visits onto the patients so patients with zero visits are kept.",
    "Count the visit key, not rows: COUNT(e.encounter_id) returns 0 for a no-visit patient (COUNT(*) would wrongly return 1). GROUP BY p.patient_id — not just mrn — so a duplicate patient stays a separate row.",
    "SELECT p.mrn, COUNT(e.encounter_id) AS encounter_count FROM legacy_patients p LEFT JOIN encounters e ON p.patient_id = e.patient_id GROUP BY p.patient_id, p.mrn",
  ],

  answerKey: {
    expectedRows: [
      { mrn: 'MRN001', encounter_count: 2 },
      { mrn: 'MRN002', encounter_count: 1 },
      { mrn: 'MRN003', encounter_count: 1 },
      { mrn: 'MRN001', encounter_count: 0 },
      { mrn: 'MRN004', encounter_count: 0 },
      { mrn: 'MRN005', encounter_count: 0 },
    ],
    requireKeywords: ['LEFT JOIN', 'GROUP BY'],
    orderSensitive: false,
  },

  explanation: "Two traps in one: use COUNT(e.encounter_id) (not COUNT(*)) so no-visit patients show 0, and LEFT JOIN to keep every patient. Grouping by patient_id keeps the duplicate MRN001 as two rows — one with 2 visits, one with 0 — proving WHY you dedup (question 2) before you trust per-patient totals. Joining at the wrong grain double-counts, the #1 silent error in SQL analytics.",

  plainSummary: "It uses a LEFT JOIN to attach visits to every patient (even those with none), GROUP BY to collapse to one row per patient, and COUNT(the visit id) to tally visits — counting the id instead of rows so a patient with no visits correctly shows 0 rather than 1.",

  solutionQuery: `SELECT p.mrn, COUNT(e.encounter_id) AS encounter_count
FROM legacy_patients p
LEFT JOIN encounters e ON p.patient_id = e.patient_id
GROUP BY p.patient_id, p.mrn`,
}

export const HEALTHCARE_QUESTIONS = [
  HC_RECONCILE,
  HC_DEDUP,
  HC_COALESCE,
  HC_CASE_MAP,
  HC_ORPHANS,
  HC_GRAIN,
]
