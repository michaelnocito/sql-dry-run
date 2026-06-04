// window-functions — 9 questions (easy ×3, medium ×3, hard ×3)

// ── EASY ────────────────────────────────────────────────────────────────────

const ATHLETES_SCHEMA = `CREATE TABLE athletes (
  name TEXT, country TEXT, medals INTEGER
);
INSERT INTO athletes VALUES
  ('Alice','USA',8),('Bob','UK',6),('Carol','USA',9),
  ('Dave','Canada',5),('Eve','UK',7),('Frank','Canada',4);`

export const WINDOW_EASY_1 = {
  questionId: 'window-functions-easy-1',
  skill: 'window-functions', difficulty: 'easy', mode: 'practice',

  schema: ATHLETES_SCHEMA,

  prompt: "Rank all athletes by medal count (highest first) using ROW_NUMBER. Return name, medals, and rank.",

  hints: [
    "ROW_NUMBER() OVER (ORDER BY medals DESC) assigns sequential ranks with no ties.",
    "The OVER clause defines the window — ORDER BY sets the ranking order.",
    "No PARTITION BY means the window spans all rows.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Carol', medals: 9, rank: 1 },
      { name: 'Alice', medals: 8, rank: 2 },
      { name: 'Eve',   medals: 7, rank: 3 },
      { name: 'Bob',   medals: 6, rank: 4 },
      { name: 'Dave',  medals: 5, rank: 5 },
      { name: 'Frank', medals: 4, rank: 6 },
    ],
    requireKeywords: ['ROW_NUMBER', 'OVER'],
    orderSensitive: true,
  },

  explanation: "ROW_NUMBER assigns unique sequential integers regardless of ties. ORDER BY medals DESC in the OVER clause sorts highest-medal athletes to rank 1. Unlike RANK(), ROW_NUMBER never produces duplicate rank values.",

  solutionQuery: `SELECT name, medals,
  ROW_NUMBER() OVER (ORDER BY medals DESC) AS rank
FROM athletes
ORDER BY rank`,
}

export const WINDOW_EASY_2 = {
  questionId: 'window-functions-easy-2',
  skill: 'window-functions', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE monthly_revenue (
  month_num INTEGER, month TEXT, revenue INTEGER
);
INSERT INTO monthly_revenue VALUES
  (1,'Jan',900),(2,'Feb',1200),(3,'Mar',900),(4,'Apr',1500),(5,'May',1200);`,

  prompt: "Show each month's revenue and the running total up to and including that month. Return month, revenue, and running_total.",

  hints: [
    "SUM(revenue) OVER (ORDER BY month_num) computes a cumulative sum.",
    "The default window frame for ORDER BY is ROWS UNBOUNDED PRECEDING TO CURRENT ROW — that's the running total.",
    "ORDER BY month_num in both OVER and the final ORDER BY ensures chronological output.",
  ],

  answerKey: {
    expectedRows: [
      { month: 'Jan', revenue: 900,  running_total: 900  },
      { month: 'Feb', revenue: 1200, running_total: 2100 },
      { month: 'Mar', revenue: 900,  running_total: 3000 },
      { month: 'Apr', revenue: 1500, running_total: 4500 },
      { month: 'May', revenue: 1200, running_total: 5700 },
    ],
    requireKeywords: ['SUM', 'OVER'],
    orderSensitive: true,
  },

  explanation: "SUM() OVER (ORDER BY ...) with no PARTITION BY accumulates across all rows in the order specified. Jan:900, Feb:900+1200=2100, Mar:2100+900=3000, Apr:3000+1500=4500, May:4500+1200=5700.",

  solutionQuery: `SELECT month, revenue,
  SUM(revenue) OVER (ORDER BY month_num) AS running_total
FROM monthly_revenue
ORDER BY month_num`,
}

export const WINDOW_EASY_3 = {
  questionId: 'window-functions-easy-3',
  skill: 'window-functions', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE scores (
  name TEXT, score INTEGER
);
INSERT INTO scores VALUES
  ('Alice',95),('Bob',88),('Carol',95),('Dave',72),('Eve',88);`,

  prompt: "Rank each student by score (highest first) using DENSE_RANK. Return name, score, and dense_rank.",

  hints: [
    "DENSE_RANK() assigns the same rank to tied values and does NOT skip the next rank.",
    "Alice and Carol both scored 95 — both get rank 1. Bob and Eve both scored 88 — both get rank 2.",
    "ORDER BY score DESC, name ASC in the final ORDER BY for consistent output.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', score: 95, dense_rank: 1 },
      { name: 'Carol', score: 95, dense_rank: 1 },
      { name: 'Bob',   score: 88, dense_rank: 2 },
      { name: 'Eve',   score: 88, dense_rank: 2 },
      { name: 'Dave',  score: 72, dense_rank: 3 },
    ],
    requireKeywords: ['DENSE_RANK', 'OVER'],
    orderSensitive: true,
  },

  explanation: "DENSE_RANK gives tied rows the same rank and then continues sequentially — no gap after the tie. Here ranks go 1,1,2,2,3. RANK() would give 1,1,3,3,5 (skipping after each tie). ROW_NUMBER would give 1,2,3,4,5 (always unique).",

  solutionQuery: `SELECT name, score,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM scores
ORDER BY score DESC, name ASC`,
}

// ── MEDIUM ───────────────────────────────────────────────────────────────────

export const WINDOW_MEDIUM_1 = {
  questionId: 'window-functions-medium-1',
  skill: 'window-functions', difficulty: 'medium', mode: 'practice',

  schema: ATHLETES_SCHEMA,

  prompt: "Rank each athlete within their country by medal count (highest first). Return name, country, medals, and country_rank.",

  hints: [
    "PARTITION BY country splits the window into separate groups per country.",
    "ROW_NUMBER() OVER (PARTITION BY country ORDER BY medals DESC) restarts ranks for each country.",
    "Order the final result by country, then medals DESC.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Dave',  country: 'Canada', medals: 5, country_rank: 1 },
      { name: 'Frank', country: 'Canada', medals: 4, country_rank: 2 },
      { name: 'Eve',   country: 'UK',     medals: 7, country_rank: 1 },
      { name: 'Bob',   country: 'UK',     medals: 6, country_rank: 2 },
      { name: 'Carol', country: 'USA',    medals: 9, country_rank: 1 },
      { name: 'Alice', country: 'USA',    medals: 8, country_rank: 2 },
    ],
    requireKeywords: ['ROW_NUMBER', 'OVER', 'PARTITION BY'],
    orderSensitive: true,
  },

  explanation: "PARTITION BY creates separate windows for each country — ranks reset to 1 for each new country group. Without PARTITION BY, you'd get a global rank instead of per-country. Each country has exactly 2 athletes here, so ranks are 1 and 2 per group.",

  solutionQuery: `SELECT name, country, medals,
  ROW_NUMBER() OVER (PARTITION BY country ORDER BY medals DESC) AS country_rank
FROM athletes
ORDER BY country, medals DESC`,
}

export const WINDOW_MEDIUM_2 = {
  questionId: 'window-functions-medium-2',
  skill: 'window-functions', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE monthly_revenue (
  month_num INTEGER, month TEXT, revenue INTEGER
);
INSERT INTO monthly_revenue VALUES
  (1,'Jan',900),(2,'Feb',1200),(3,'Mar',900),(4,'Apr',1500),(5,'May',1200);`,

  prompt: "For each month, show the revenue, the previous month's revenue, and the month-over-month change. Return month, revenue, prev_revenue, and change.",

  hints: [
    "LAG(revenue) OVER (ORDER BY month_num) returns the previous row's revenue.",
    "For the first row (Jan) there is no previous row — LAG returns NULL.",
    "Change = revenue - LAG(revenue): Jan's change is also NULL.",
  ],

  answerKey: {
    expectedRows: [
      { month: 'Jan', revenue: 900,  prev_revenue: null, change: null },
      { month: 'Feb', revenue: 1200, prev_revenue: 900,  change: 300  },
      { month: 'Mar', revenue: 900,  prev_revenue: 1200, change: -300 },
      { month: 'Apr', revenue: 1500, prev_revenue: 900,  change: 600  },
      { month: 'May', revenue: 1200, prev_revenue: 1500, change: -300 },
    ],
    requireKeywords: ['LAG', 'OVER'],
    orderSensitive: true,
  },

  explanation: "LAG(col) OVER (ORDER BY ...) accesses the previous row's value. LEAD(col) would access the next row. Both return NULL when there is no preceding (or following) row. Change = current - previous: Feb: 1200-900=+300, Mar: 900-1200=-300.",

  solutionQuery: `SELECT month, revenue,
  LAG(revenue) OVER (ORDER BY month_num) AS prev_revenue,
  revenue - LAG(revenue) OVER (ORDER BY month_num) AS change
FROM monthly_revenue
ORDER BY month_num`,
}

export const WINDOW_MEDIUM_3 = {
  questionId: 'window-functions-medium-3',
  skill: 'window-functions', difficulty: 'medium', mode: 'practice',

  schema: ATHLETES_SCHEMA,

  prompt: "Divide all athletes into 3 groups (terciles) by medal count, highest to lowest. Return name, medals, and tier (1=top third, 3=bottom third).",

  hints: [
    "NTILE(n) OVER (ORDER BY ...) divides rows into n roughly equal groups.",
    "NTILE(3) ORDER BY medals DESC puts the top medal earners in tier 1.",
    "With 6 athletes and 3 groups, each tier gets exactly 2 athletes.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Carol', medals: 9, tier: 1 },
      { name: 'Alice', medals: 8, tier: 1 },
      { name: 'Eve',   medals: 7, tier: 2 },
      { name: 'Bob',   medals: 6, tier: 2 },
      { name: 'Dave',  medals: 5, tier: 3 },
      { name: 'Frank', medals: 4, tier: 3 },
    ],
    requireKeywords: ['NTILE', 'OVER'],
    orderSensitive: true,
  },

  explanation: "NTILE(n) distributes rows as evenly as possible into n buckets. With 6 rows and n=3, each bucket gets exactly 2 rows. The bucket number (1,2,3) is assigned in the ORDER BY order. Useful for percentile-based segmentation.",

  solutionQuery: `SELECT name, medals,
  NTILE(3) OVER (ORDER BY medals DESC) AS tier
FROM athletes
ORDER BY medals DESC`,
}

// ── HARD ─────────────────────────────────────────────────────────────────────

export const WINDOW_HARD_1 = {
  questionId: 'window-functions-hard-1',
  skill: 'window-functions', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE monthly_revenue (
  month_num INTEGER, month TEXT, revenue INTEGER
);
INSERT INTO monthly_revenue VALUES
  (1,'Jan',900),(2,'Feb',1200),(3,'Mar',900),(4,'Apr',1500),(5,'May',1200);`,

  prompt: "Calculate a 3-month rolling average of revenue (current month plus the 2 preceding months). Return month, revenue, and rolling_avg.",

  hints: [
    "Use a window frame: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.",
    "AVG(revenue) OVER (ORDER BY month_num ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
    "For Jan and Feb, the window is smaller (1 or 2 rows) — SQLite averages what's available.",
  ],

  answerKey: {
    expectedRows: [
      { month: 'Jan', revenue: 900,  rolling_avg: 900  },
      { month: 'Feb', revenue: 1200, rolling_avg: 1050 },
      { month: 'Mar', revenue: 900,  rolling_avg: 1000 },
      { month: 'Apr', revenue: 1500, rolling_avg: 1200 },
      { month: 'May', revenue: 1200, rolling_avg: 1200 },
    ],
    requireKeywords: ['OVER', 'ROWS'],
    orderSensitive: true,
  },

  explanation: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW defines the frame explicitly. Jan: avg(900)=900. Feb: avg(900,1200)=1050. Mar: avg(900,1200,900)=1000. Apr: avg(1200,900,1500)=1200. May: avg(900,1500,1200)=1200.",

  solutionQuery: `SELECT month, revenue,
  AVG(revenue) OVER (
    ORDER BY month_num
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS rolling_avg
FROM monthly_revenue
ORDER BY month_num`,
}

export const WINDOW_HARD_2 = {
  questionId: 'window-functions-hard-2',
  skill: 'window-functions', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE sales_reps (
  name TEXT, region TEXT, revenue INTEGER
);
INSERT INTO sales_reps VALUES
  ('Alice','West',90000),('Bob','East',75000),('Carol','West',80000),
  ('Dave','East',60000),('Eve','West',80000),('Frank','East',75000);`,

  prompt: "For each rep, show their revenue, RANK (with gaps for ties), and DENSE_RANK (no gaps). Return name, revenue, rnk, and dense_rnk.",

  hints: [
    "RANK() skips after ties: two people tied for 1st means the next rank is 3rd.",
    "DENSE_RANK() does not skip: two people tied for 1st means the next rank is 2nd.",
    "Both take OVER (ORDER BY revenue DESC) — no PARTITION BY for global ranking.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', revenue: 90000, rnk: 1, dense_rnk: 1 },
      { name: 'Carol', revenue: 80000, rnk: 2, dense_rnk: 2 },
      { name: 'Eve',   revenue: 80000, rnk: 2, dense_rnk: 2 },
      { name: 'Bob',   revenue: 75000, rnk: 4, dense_rnk: 3 },
      { name: 'Frank', revenue: 75000, rnk: 4, dense_rnk: 3 },
      { name: 'Dave',  revenue: 60000, rnk: 6, dense_rnk: 4 },
    ],
    requireKeywords: ['RANK', 'DENSE_RANK', 'OVER'],
    orderSensitive: true,
  },

  explanation: "Carol and Eve both have 80000 — they share rank 2. With RANK, the next rank is 4 (skipping 3). With DENSE_RANK, the next rank is 3 (no skip). Bob and Frank tie at 75000: RANK gives 4, DENSE_RANK gives 3. Dave is last in both.",

  solutionQuery: `SELECT name, revenue,
  RANK()       OVER (ORDER BY revenue DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY revenue DESC) AS dense_rnk
FROM sales_reps
ORDER BY revenue DESC, name ASC`,
}

export const WINDOW_HARD_3 = {
  questionId: 'window-functions-hard-3',
  skill: 'window-functions', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE sales_reps (
  name TEXT, region TEXT, revenue INTEGER
);
INSERT INTO sales_reps VALUES
  ('Alice','West',90000),('Bob','East',75000),('Carol','West',80000),
  ('Dave','East',60000),('Eve','North',85000),('Frank','North',70000);`,

  prompt: "For each region, return the name and revenue of the top-earning rep. Return region, name, and revenue, ordered by region.",

  hints: [
    "You can't use WHERE rn = 1 directly on a window function — you need a CTE first.",
    "CTE: assign ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rn.",
    "Main query: SELECT from the CTE WHERE rn = 1.",
  ],

  answerKey: {
    expectedRows: [
      { region: 'East',  name: 'Bob',   revenue: 75000 },
      { region: 'North', name: 'Eve',   revenue: 85000 },
      { region: 'West',  name: 'Alice', revenue: 90000 },
    ],
    requireKeywords: ['WITH', 'ROW_NUMBER', 'PARTITION BY'],
    orderSensitive: true,
  },

  explanation: "Window functions can't appear in WHERE — the CTE materialises the window result first, then WHERE filters it. East top earner: Bob (75000 > Dave 60000). North: Eve (85000 > Frank 70000). West: Alice (90000 > Carol 80000).",

  solutionQuery: `WITH ranked AS (
  SELECT name, region, revenue,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rn
  FROM sales_reps
)
SELECT region, name, revenue
FROM ranked
WHERE rn = 1
ORDER BY region`,
}

export const WINDOW_FUNCTIONS_QUESTIONS = [
  WINDOW_EASY_1, WINDOW_EASY_2, WINDOW_EASY_3,
  WINDOW_MEDIUM_1, WINDOW_MEDIUM_2, WINDOW_MEDIUM_3,
  WINDOW_HARD_1, WINDOW_HARD_2, WINDOW_HARD_3,
]
