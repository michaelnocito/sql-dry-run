// string-date — 9 questions (easy ×3, medium ×3, hard ×3)

// ── EASY ────────────────────────────────────────────────────────────────────

export const STRING_DATE_EASY_1 = {
  questionId: 'string-date-easy-1',
  skill: 'string-date', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE products (
  id INTEGER, sku TEXT, name TEXT, category TEXT
);
INSERT INTO products VALUES
  (1,'WID-001','wireless mouse','electronics'),
  (2,'WID-002','USB Hub','ELECTRONICS'),
  (3,'FRN-001','desk lamp','Furniture'),
  (4,'OFF-001','  stapler  ','office');`,

  prompt: "Standardize the category column: trim whitespace and convert to uppercase. Return id and category_clean.",

  hints: [
    "TRIM(category) removes leading and trailing spaces.",
    "UPPER(...) converts a string to all uppercase.",
    "Nest them: UPPER(TRIM(category)).",
  ],

  answerKey: {
    expectedRows: [
      { id: 1, category_clean: 'ELECTRONICS' },
      { id: 2, category_clean: 'ELECTRONICS' },
      { id: 3, category_clean: 'FURNITURE'   },
      { id: 4, category_clean: 'OFFICE'      },
    ],
    requireKeywords: ['UPPER', 'TRIM'],
    orderSensitive: true,
  },

  explanation: "TRIM removes whitespace from both ends of a string. UPPER converts every character to uppercase. Product 4 has spaces on both sides of 'office' — TRIM removes them before UPPER converts the result.",

  solutionQuery: `SELECT id, UPPER(TRIM(category)) AS category_clean
FROM products
ORDER BY id`,
}

export const STRING_DATE_EASY_2 = {
  questionId: 'string-date-easy-2',
  skill: 'string-date', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE products (
  id INTEGER, sku TEXT, name TEXT, category TEXT
);
INSERT INTO products VALUES
  (1,'wid-001','wireless mouse','electronics'),
  (2,'wid-002','USB Hub','ELECTRONICS'),
  (3,'furn-001','desk lamp','Furniture'),
  (4,'off-001','  stapler  ','office');`,

  prompt: "Extract the category prefix from each SKU — the part before the hyphen. For 'wid-001' return 'wid'. Return id and prefix.",

  hints: [
    "INSTR(sku, '-') returns the position of the hyphen character.",
    "SUBSTR(str, start, length) extracts a substring. Start at 1, take (hyphen_pos - 1) characters.",
    "SUBSTR(sku, 1, INSTR(sku, '-') - 1)",
  ],

  answerKey: {
    expectedRows: [
      { id: 1, prefix: 'wid'  },
      { id: 2, prefix: 'wid'  },
      { id: 3, prefix: 'furn' },
      { id: 4, prefix: 'off'  },
    ],
    requireKeywords: ['SUBSTR'],
    orderSensitive: true,
  },

  explanation: "INSTR(sku, '-') returns the index of the first hyphen — for 'wid-001' that's position 4. SUBSTR(sku, 1, 4-1) = SUBSTR(sku, 1, 3) = 'wid'. SQLite string positions are 1-based.",

  solutionQuery: `SELECT id, SUBSTR(sku, 1, INSTR(sku, '-') - 1) AS prefix
FROM products
ORDER BY id`,
}

export const STRING_DATE_EASY_3 = {
  questionId: 'string-date-easy-3',
  skill: 'string-date', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE products (
  id INTEGER, sku TEXT, name TEXT, category TEXT
);
INSERT INTO products VALUES
  (1,'wid-001','wireless mouse','electronics'),
  (2,'wid-002','USB Hub','ELECTRONICS'),
  (3,'furn-001','desk lamp','Furniture'),
  (4,'off-001','  stapler  ','office');`,

  prompt: "Find all products whose name contains the word 'mouse' (case-insensitive). Return id and name.",

  hints: [
    "LIKE '%mouse%' matches any string containing 'mouse' anywhere.",
    "SQLite's LIKE is case-insensitive for ASCII letters by default.",
    "WHERE name LIKE '%mouse%'",
  ],

  answerKey: {
    expectedRows: [
      { id: 1, name: 'wireless mouse' },
    ],
    requireKeywords: ['LIKE'],
    orderSensitive: false,
  },

  explanation: "The % wildcard matches zero or more characters, so '%mouse%' matches any string with 'mouse' anywhere inside it. SQLite LIKE is case-insensitive for ASCII — 'Mouse', 'MOUSE', and 'mouse' all match. For Unicode case-insensitivity, combine with LOWER.",

  solutionQuery: `SELECT id, name
FROM products
WHERE name LIKE '%mouse%'`,
}

// ── MEDIUM ───────────────────────────────────────────────────────────────────

const EVENTS_SCHEMA = `CREATE TABLE events (
  id INTEGER, name TEXT, event_date TEXT
);
INSERT INTO events VALUES
  (1,'Launch','2024-03-15'),
  (2,'Conference','2024-07-22'),
  (3,'Review','2024-11-08'),
  (4,'Demo','2025-01-30');`

export const STRING_DATE_MEDIUM_1 = {
  questionId: 'string-date-medium-1',
  skill: 'string-date', difficulty: 'medium', mode: 'practice',

  schema: EVENTS_SCHEMA,

  prompt: "Extract the year and month from each event's date. Return name, year (as text like '2024'), and month (as text like '03'), ordered by event_date.",

  hints: [
    "strftime('%Y', date_col) extracts the 4-digit year as text.",
    "strftime('%m', date_col) extracts the 2-digit month with a leading zero.",
    "SELECT name, strftime('%Y', event_date) AS year, strftime('%m', event_date) AS month FROM events",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Launch',     year: '2024', month: '03' },
      { name: 'Conference', year: '2024', month: '07' },
      { name: 'Review',     year: '2024', month: '11' },
      { name: 'Demo',       year: '2025', month: '01' },
    ],
    requireKeywords: ['strftime'],
    orderSensitive: true,
  },

  explanation: "strftime is SQLite's Swiss Army knife for date formatting. '%Y' gives a 4-digit year; '%m' gives a zero-padded 2-digit month. Other useful formats: '%d' (day), '%H' (hour), '%Y-%m-%d' (full date). The date column must be in ISO 8601 format (YYYY-MM-DD) for strftime to work correctly.",

  solutionQuery: `SELECT name,
  strftime('%Y', event_date) AS year,
  strftime('%m', event_date) AS month
FROM events
ORDER BY event_date`,
}

export const STRING_DATE_MEDIUM_2 = {
  questionId: 'string-date-medium-2',
  skill: 'string-date', difficulty: 'medium', mode: 'practice',

  schema: EVENTS_SCHEMA,

  prompt: "For each event, calculate the date 30 days after it. Return name, event_date, and follow_up_date.",

  hints: [
    "date(event_date, '+30 days') adds 30 days to a date string.",
    "SQLite's date() function handles month and year rollovers automatically.",
    "SELECT name, event_date, date(event_date, '+30 days') AS follow_up_date FROM events",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Launch',     event_date: '2024-03-15', follow_up_date: '2024-04-14' },
      { name: 'Conference', event_date: '2024-07-22', follow_up_date: '2024-08-21' },
      { name: 'Review',     event_date: '2024-11-08', follow_up_date: '2024-12-08' },
      { name: 'Demo',       event_date: '2025-01-30', follow_up_date: '2025-03-01' },
    ],
    requireKeywords: ['date('],
    orderSensitive: false,
  },

  explanation: "date(date_string, modifier) performs date arithmetic. SQLite handles month boundaries: Jan 30 + 30 days = Mar 1 (crosses Feb 28 in non-leap 2025). Useful modifiers: '+N days', '-N months', 'start of month', 'start of year'.",

  solutionQuery: `SELECT name, event_date, date(event_date, '+30 days') AS follow_up_date
FROM events`,
}

export const STRING_DATE_MEDIUM_3 = {
  questionId: 'string-date-medium-3',
  skill: 'string-date', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE contacts (
  id INTEGER, name TEXT, email TEXT
);
INSERT INTO contacts VALUES
  (1,'Alice','alice@acme.com'),
  (2,'Bob','bob@beta.io'),
  (3,'Carol','carol@gamma.org'),
  (4,'Dave','dave@delta.com');`,

  prompt: "Extract the domain from each email address (the part after '@'). Return name and domain.",

  hints: [
    "INSTR(email, '@') returns the position of the '@' symbol.",
    "SUBSTR(email, pos + 1) returns everything after position pos.",
    "Combine: SUBSTR(email, INSTR(email, '@') + 1)",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', domain: 'acme.com'  },
      { name: 'Bob',   domain: 'beta.io'   },
      { name: 'Carol', domain: 'gamma.org' },
      { name: 'Dave',  domain: 'delta.com' },
    ],
    requireKeywords: ['SUBSTR', 'INSTR'],
    orderSensitive: false,
  },

  explanation: "INSTR(email, '@') returns the position of '@'. For 'alice@acme.com' that's position 6. SUBSTR(email, 6+1) = SUBSTR(email, 7) returns 'acme.com'. When SUBSTR has no length argument, it returns everything from the start position to the end of the string.",

  solutionQuery: `SELECT name, SUBSTR(email, INSTR(email, '@') + 1) AS domain
FROM contacts
ORDER BY id`,
}

// ── HARD ─────────────────────────────────────────────────────────────────────

export const STRING_DATE_HARD_1 = {
  questionId: 'string-date-hard-1',
  skill: 'string-date', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE projects (
  id INTEGER, name TEXT, start_date TEXT, end_date TEXT
);
INSERT INTO projects VALUES
  (1,'Alpha','2024-01-15','2024-03-20'),
  (2,'Beta','2024-04-01','2024-04-30'),
  (3,'Gamma','2024-06-15','2024-09-10'),
  (4,'Delta','2024-10-01','2024-12-31');`,

  prompt: "Calculate the duration of each project in days. Return name and duration_days, ordered by start_date.",

  hints: [
    "julianday(date) converts a date to a Julian day number (a real number).",
    "Subtracting two Julian day numbers gives the difference in days.",
    "CAST(julianday(end_date) - julianday(start_date) AS INTEGER)",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alpha', duration_days: 65 },
      { name: 'Beta',  duration_days: 29 },
      { name: 'Gamma', duration_days: 87 },
      { name: 'Delta', duration_days: 91 },
    ],
    requireKeywords: ['julianday'],
    orderSensitive: true,
  },

  explanation: "julianday() is SQLite's way to compute date differences — subtract two Julian day numbers to get days between them. Alpha: Jan 15 → Mar 20 = 65 days (2024 is a leap year). Beta: Apr 1 → Apr 30 = 29 days. Gamma: Jun 15 → Sep 10 = 87 days. Delta: Oct 1 → Dec 31 = 91 days.",

  solutionQuery: `SELECT name,
  CAST(julianday(end_date) - julianday(start_date) AS INTEGER) AS duration_days
FROM projects
ORDER BY start_date`,
}

export const STRING_DATE_HARD_2 = {
  questionId: 'string-date-hard-2',
  skill: 'string-date', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE orders (
  id INTEGER, order_date TEXT, amount INTEGER
);
INSERT INTO orders VALUES
  (1,'2024-01-15',500),(2,'2024-01-28',800),(3,'2024-02-10',1200),
  (4,'2024-02-20',600),(5,'2024-03-05',900),(6,'2024-03-18',1500),
  (7,'2024-03-25',700);`,

  prompt: "Calculate total order revenue per month. Return month (as 'YYYY-MM') and total, ordered by month.",

  hints: [
    "strftime('%Y-%m', order_date) extracts the year-month string.",
    "Use that expression in both SELECT and GROUP BY.",
    "SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS total FROM orders GROUP BY month ORDER BY month",
  ],

  answerKey: {
    expectedRows: [
      { month: '2024-01', total: 1300 },
      { month: '2024-02', total: 1800 },
      { month: '2024-03', total: 3100 },
    ],
    requireKeywords: ['strftime', 'GROUP BY'],
    orderSensitive: true,
  },

  explanation: "strftime('%Y-%m', date) truncates to month-level, letting GROUP BY aggregate rows that fall in the same month. Jan: 500+800=1300. Feb: 1200+600=1800. Mar: 900+1500+700=3100. This pattern (extract then group) is the standard way to do time-series aggregation in SQLite.",

  solutionQuery: `SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS total
FROM orders
GROUP BY strftime('%Y-%m', order_date)
ORDER BY month`,
}

export const STRING_DATE_HARD_3 = {
  questionId: 'string-date-hard-3',
  skill: 'string-date', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE phone_numbers (
  id INTEGER, person TEXT, phone TEXT
);
INSERT INTO phone_numbers VALUES
  (1,'Alice','(555) 123-4567'),
  (2,'Bob','555.987.6543'),
  (3,'Carol','555-456-7890'),
  (4,'Dave','(555) 321-0987'),
  (5,'Eve','555.111.2222');`,

  prompt: "Standardize all phone numbers to digits only — remove spaces, dashes, dots, and parentheses. Return person and digits_only.",

  hints: [
    "REPLACE(str, old, new) replaces all occurrences of old with new.",
    "Chain multiple REPLACEs to remove each character: REPLACE(REPLACE(...), '.', '')",
    "Remove: '(', ')', ' ', '-', '.' — five nested REPLACEs.",
  ],

  answerKey: {
    expectedRows: [
      { person: 'Alice', digits_only: '5551234567' },
      { person: 'Bob',   digits_only: '5559876543' },
      { person: 'Carol', digits_only: '5554567890' },
      { person: 'Dave',  digits_only: '5553210987' },
      { person: 'Eve',   digits_only: '5551112222' },
    ],
    requireKeywords: ['REPLACE'],
    orderSensitive: true,
  },

  explanation: "SQLite has no regex replace, so we chain REPLACE calls. Each call processes the result of the previous one. Order doesn't matter here since the characters don't overlap. This pattern appears often when normalising phone numbers, codes, or identifiers from external sources.",

  solutionQuery: `SELECT person,
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    phone, '(', ''), ')', ''), ' ', ''), '-', ''), '.', ''
  ) AS digits_only
FROM phone_numbers
ORDER BY id`,
}

export const STRING_DATE_QUESTIONS = [
  STRING_DATE_EASY_1, STRING_DATE_EASY_2, STRING_DATE_EASY_3,
  STRING_DATE_MEDIUM_1, STRING_DATE_MEDIUM_2, STRING_DATE_MEDIUM_3,
  STRING_DATE_HARD_1, STRING_DATE_HARD_2, STRING_DATE_HARD_3,
]
