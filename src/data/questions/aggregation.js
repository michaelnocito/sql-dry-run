// aggregation — 9 questions (easy ×3, medium ×3, hard ×3)

// Shared schema for most questions
const SALES_SCHEMA = `CREATE TABLE sales (
  id INTEGER, rep TEXT, region TEXT, product TEXT, amount INTEGER, quarter TEXT
);
INSERT INTO sales VALUES
  (1,'Alice','West','Widget',1000,'Q1'),
  (2,'Bob','East','Gadget',500,'Q1'),
  (3,'Alice','West','Gadget',2000,'Q1'),
  (4,'Carol','North','Widget',600,'Q2'),
  (5,'Bob','East','Widget',1000,'Q2'),
  (6,'Carol','North','Gadget',1400,'Q2'),
  (7,'Alice','West','Widget',1500,'Q3'),
  (8,'Bob','East','Gadget',2500,'Q3'),
  (9,'Carol','North','Widget',900,'Q3');`

// ── EASY ────────────────────────────────────────────────────────────────────

export const AGGREGATION_EASY_1 = {
  questionId: 'aggregation-easy-1',
  skill: 'aggregation', difficulty: 'easy', mode: 'practice',

  schema: SALES_SCHEMA,

  prompt: "Count the number of sales made by each rep. Return rep and sale_count.",

  hints: [
    "COUNT(*) counts every row in each group.",
    "GROUP BY rep splits the table into one group per rep.",
    "SELECT rep, COUNT(*) AS sale_count FROM sales GROUP BY rep",
  ],

  answerKey: {
    expectedRows: [
      { rep: 'Alice', sale_count: 3 },
      { rep: 'Bob',   sale_count: 3 },
      { rep: 'Carol', sale_count: 3 },
    ],
    requireKeywords: ['GROUP BY', 'COUNT'],
    orderSensitive: false,
  },

  explanation: "GROUP BY splits the table into groups by the specified column; COUNT(*) counts rows in each group. Each rep has 3 sales in this dataset. COUNT(*) counts all rows including NULLs — use COUNT(column) to count non-NULL values specifically.",
  plainSummary: "It uses GROUP BY to pile the rows together by rep, and COUNT(*) to count how many rows are in each pile.",

  solutionQuery: `SELECT rep, COUNT(*) AS sale_count
FROM sales
GROUP BY rep`,
}

export const AGGREGATION_EASY_2 = {
  questionId: 'aggregation-easy-2',
  skill: 'aggregation', difficulty: 'easy', mode: 'practice',

  schema: SALES_SCHEMA,

  prompt: "For each region, calculate the total amount sold. Return region and total.",

  hints: [
    "SUM(amount) adds up all values in the amount column per group.",
    "GROUP BY region creates one row per distinct region value.",
    "SELECT region, SUM(amount) AS total FROM sales GROUP BY region",
  ],

  answerKey: {
    expectedRows: [
      { region: 'East',  total: 4000 },
      { region: 'North', total: 2900 },
      { region: 'West',  total: 4500 },
    ],
    requireKeywords: ['GROUP BY', 'SUM'],
    orderSensitive: false,
  },

  explanation: "SUM aggregates all values in a column per group. West: 1000+2000+1500=4500. East: 500+1000+2500=4000. North: 600+1400+900=2900. The result has one row per distinct region value.",
  plainSummary: "It uses GROUP BY to pile the rows together by region, and SUM to add up the amounts within each pile.",

  solutionQuery: `SELECT region, SUM(amount) AS total
FROM sales
GROUP BY region`,
}

export const AGGREGATION_EASY_3 = {
  questionId: 'aggregation-easy-3',
  skill: 'aggregation', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE orders (
  id INTEGER, customer TEXT, product TEXT, amount INTEGER
);
INSERT INTO orders VALUES
  (1,'Acme','Widget',100),
  (2,'Acme','Gadget',200),
  (3,'Acme','Widget',150),
  (4,'Acme','Doohickey',80),
  (5,'Beta','Widget',300),
  (6,'Beta','Doohickey',250),
  (7,'Gamma','Gadget',180),
  (8,'Gamma','Gadget',220);`,

  prompt: "For each customer, count how many distinct products they have ordered. Return customer and unique_products.",

  hints: [
    "COUNT(DISTINCT column) counts unique values, ignoring duplicates.",
    "Acme ordered Widget twice — it should count as 1, not 2.",
    "SELECT customer, COUNT(DISTINCT product) AS unique_products FROM orders GROUP BY customer",
  ],

  answerKey: {
    expectedRows: [
      { customer: 'Acme',  unique_products: 3 },
      { customer: 'Beta',  unique_products: 2 },
      { customer: 'Gamma', unique_products: 1 },
    ],
    requireKeywords: ['GROUP BY', 'COUNT'],
    orderSensitive: false,
  },

  explanation: "COUNT(DISTINCT product) deduplicates before counting — Acme ordered Widget twice but it counts once. Acme: Widget+Gadget+Doohickey=3. Beta: Widget+Doohickey=2. Gamma: Gadget only=1.",
  plainSummary: "It uses GROUP BY to pile the rows together by customer, and COUNT(DISTINCT product) to count the different products in each pile while ignoring repeats.",

  solutionQuery: `SELECT customer, COUNT(DISTINCT product) AS unique_products
FROM orders
GROUP BY customer`,
}

// ── MEDIUM ───────────────────────────────────────────────────────────────────

export const AGGREGATION_MEDIUM_1 = {
  questionId: 'aggregation-medium-1',
  skill: 'aggregation', difficulty: 'medium', mode: 'practice',

  schema: SALES_SCHEMA,

  prompt: "Find reps whose total sales amount exceeds $3,500. Return rep and total, sorted by total descending.",

  hints: [
    "SUM and GROUP BY give totals per rep.",
    "HAVING filters groups after aggregation — unlike WHERE, which filters rows before grouping.",
    "SELECT rep, SUM(amount) AS total FROM sales GROUP BY rep HAVING SUM(amount) > 3500 ORDER BY total DESC",
  ],

  answerKey: {
    expectedRows: [
      { rep: 'Alice', total: 4500 },
      { rep: 'Bob',   total: 4000 },
    ],
    requireKeywords: ['GROUP BY', 'HAVING'],
    orderSensitive: true,
  },

  explanation: "HAVING is applied after aggregation, so it can reference aggregate functions like SUM. Alice: 4500, Bob: 4000 (both > 3500). Carol: 2900 is filtered out. Ordering by total DESC puts Alice first.",
  plainSummary: "It uses GROUP BY to pile the rows together by rep, SUM to total each pile, HAVING to keep only the piles totalling more than 3,500, and ORDER BY to sort them from highest to lowest.",

  solutionQuery: `SELECT rep, SUM(amount) AS total
FROM sales
GROUP BY rep
HAVING SUM(amount) > 3500
ORDER BY total DESC`,
}

export const AGGREGATION_MEDIUM_2 = {
  questionId: 'aggregation-medium-2',
  skill: 'aggregation', difficulty: 'medium', mode: 'practice',

  schema: SALES_SCHEMA,

  prompt: "Show total sales per rep per quarter. Return rep, quarter, and total, ordered by rep then quarter.",

  hints: [
    "GROUP BY can take multiple columns — GROUP BY rep, quarter creates one group per unique combination.",
    "Each (rep, quarter) pair that has data will appear as one row.",
    "SELECT rep, quarter, SUM(amount) AS total FROM sales GROUP BY rep, quarter ORDER BY rep, quarter",
  ],

  answerKey: {
    expectedRows: [
      { rep: 'Alice', quarter: 'Q1', total: 3000 },
      { rep: 'Alice', quarter: 'Q3', total: 1500 },
      { rep: 'Bob',   quarter: 'Q1', total: 500  },
      { rep: 'Bob',   quarter: 'Q2', total: 1000 },
      { rep: 'Bob',   quarter: 'Q3', total: 2500 },
      { rep: 'Carol', quarter: 'Q2', total: 2000 },
      { rep: 'Carol', quarter: 'Q3', total: 900  },
    ],
    requireKeywords: ['GROUP BY'],
    orderSensitive: true,
  },

  explanation: "Multi-column GROUP BY creates one row per unique combination of the specified columns. Alice has no Q2 sales, so that combination doesn't appear. Alice Q1: 1000+2000=3000. Carol Q2: 600+1400=2000.",
  plainSummary: "It uses GROUP BY on two columns to pile the rows together by each rep-and-quarter combination, SUM to total each pile, and ORDER BY to sort by rep then quarter.",

  solutionQuery: `SELECT rep, quarter, SUM(amount) AS total
FROM sales
GROUP BY rep, quarter
ORDER BY rep, quarter`,
}

export const AGGREGATION_MEDIUM_3 = {
  questionId: 'aggregation-medium-3',
  skill: 'aggregation', difficulty: 'medium', mode: 'practice',

  schema: SALES_SCHEMA,

  prompt: "Find the largest single sale amount for each rep. Return rep and top_sale.",

  hints: [
    "MAX(amount) returns the highest value in the group.",
    "GROUP BY rep creates one group per rep.",
    "SELECT rep, MAX(amount) AS top_sale FROM sales GROUP BY rep",
  ],

  answerKey: {
    expectedRows: [
      { rep: 'Alice', top_sale: 2000 },
      { rep: 'Bob',   top_sale: 2500 },
      { rep: 'Carol', top_sale: 1400 },
    ],
    requireKeywords: ['GROUP BY', 'MAX'],
    orderSensitive: false,
  },

  explanation: "MAX returns the largest value in each group. Alice's sales are 1000, 2000, 1500 — max is 2000. Bob's are 500, 1000, 2500 — max is 2500. MIN works the same way for smallest values.",
  plainSummary: "It uses GROUP BY to pile the rows together by rep, and MAX to pick out the single highest amount in each pile.",

  solutionQuery: `SELECT rep, MAX(amount) AS top_sale
FROM sales
GROUP BY rep`,
}

// ── HARD ─────────────────────────────────────────────────────────────────────

export const AGGREGATION_HARD_1 = {
  questionId: 'aggregation-hard-1',
  skill: 'aggregation', difficulty: 'hard', mode: 'practice',

  schema: SALES_SCHEMA,

  prompt: "For each rep, show their total Widget revenue and total Gadget revenue in separate columns. Return rep, widget_rev, and gadget_rev.",

  hints: [
    "Use SUM with a CASE inside: SUM(CASE WHEN product='Widget' THEN amount ELSE 0 END).",
    "The ELSE 0 ensures non-Widget rows contribute 0 instead of being ignored.",
    "SELECT rep, SUM(CASE WHEN product = 'Widget' THEN amount ELSE 0 END) AS widget_rev, SUM(CASE WHEN product = 'Gadget' THEN amount ELSE 0 END) AS gadget_rev FROM sales GROUP BY rep",
  ],

  answerKey: {
    expectedRows: [
      { rep: 'Alice', widget_rev: 2500, gadget_rev: 2000 },
      { rep: 'Bob',   widget_rev: 1000, gadget_rev: 3000 },
      { rep: 'Carol', widget_rev: 1500, gadget_rev: 1400 },
    ],
    requireKeywords: ['GROUP BY', 'CASE'],
    orderSensitive: false,
  },

  explanation: "Conditional aggregation uses CASE inside an aggregate function to selectively include values. Alice Widget: 1000+1500=2500, Gadget: 2000. Bob Widget: 1000, Gadget: 500+2500=3000. Carol Widget: 600+900=1500, Gadget: 1400.",
  plainSummary: "It uses GROUP BY to pile the rows together by rep, then SUM with a CASE inside to add up only the Widget amounts in one column and only the Gadget amounts in another.",

  solutionQuery: `SELECT rep,
  SUM(CASE WHEN product = 'Widget' THEN amount ELSE 0 END) AS widget_rev,
  SUM(CASE WHEN product = 'Gadget' THEN amount ELSE 0 END) AS gadget_rev
FROM sales
GROUP BY rep`,
}

export const AGGREGATION_HARD_2 = {
  questionId: 'aggregation-hard-2',
  skill: 'aggregation', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE quarterly_sales (
  rep TEXT, quarter TEXT, amount INTEGER
);
INSERT INTO quarterly_sales VALUES
  ('Alice','Q1',500),('Alice','Q2',1200),('Alice','Q3',1500),
  ('Bob','Q1',2000),('Bob','Q2',900),('Bob','Q3',800),
  ('Carol','Q1',600),('Carol','Q2',1100),('Carol','Q3',900),
  ('Dave','Q1',300),('Dave','Q2',400),('Dave','Q3',1800);`,

  prompt: "Find reps whose Q3 revenue exceeds their Q1 revenue. Return only rep.",

  hints: [
    "Use conditional aggregation inside HAVING: SUM(CASE WHEN quarter='Q3' THEN amount ELSE 0 END).",
    "Compare Q3 conditional sum > Q1 conditional sum inside HAVING.",
    "SELECT rep FROM quarterly_sales GROUP BY rep HAVING SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END) > SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END)",
  ],

  answerKey: {
    expectedRows: [
      { rep: 'Alice' },
      { rep: 'Carol' },
      { rep: 'Dave'  },
    ],
    requireKeywords: ['GROUP BY', 'HAVING', 'CASE'],
    orderSensitive: false,
  },

  explanation: "HAVING can contain complex expressions including conditional sums. Alice Q3=1500 > Q1=500 ✓. Bob Q3=800 < Q1=2000 ✗. Carol Q3=900 > Q1=600 ✓. Dave Q3=1800 > Q1=300 ✓.",
  plainSummary: "It uses GROUP BY to pile the rows together by rep, then HAVING with two SUM-of-CASE expressions to keep only the reps whose total Q3 amount is bigger than their total Q1 amount.",

  solutionQuery: `SELECT rep
FROM quarterly_sales
GROUP BY rep
HAVING SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END)
     > SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END)`,
}

export const AGGREGATION_HARD_3 = {
  questionId: 'aggregation-hard-3',
  skill: 'aggregation', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE transactions (
  id INTEGER, region TEXT, rep TEXT, amount INTEGER
);
INSERT INTO transactions VALUES
  (1,'West','Alice',1000),(2,'West','Bob',500),(3,'West','Alice',2000),
  (4,'East','Bob',800),(5,'East','Carol',1200),(6,'East','Alice',600),
  (7,'North','Carol',900),(8,'North','Bob',700),
  (9,'South','Carol',1500),(10,'South','Alice',2200);`,

  prompt: "For each region, show total amount, count of transactions, and count of distinct reps. Return region, total, sale_count, and rep_count, ordered by region.",

  hints: [
    "COUNT(*) counts all rows; COUNT(DISTINCT rep) counts unique reps.",
    "Both can appear in the same SELECT alongside SUM.",
    "SELECT region, SUM(amount) AS total, COUNT(*) AS sale_count, COUNT(DISTINCT rep) AS rep_count FROM transactions GROUP BY region ORDER BY region",
  ],

  answerKey: {
    expectedRows: [
      { region: 'East',  total: 2600, sale_count: 3, rep_count: 3 },
      { region: 'North', total: 1600, sale_count: 2, rep_count: 2 },
      { region: 'South', total: 3700, sale_count: 2, rep_count: 2 },
      { region: 'West',  total: 3500, sale_count: 3, rep_count: 2 },
    ],
    requireKeywords: ['GROUP BY', 'COUNT'],
    orderSensitive: true,
  },

  explanation: "COUNT(*) and COUNT(DISTINCT col) serve different purposes in the same query. East: 3 transactions by 3 different reps (Bob+Carol+Alice). West: 3 transactions but only 2 reps (Alice appears twice). East total: 800+1200+600=2600.",
  plainSummary: "It uses GROUP BY to pile the rows together by region, then SUM to total the amounts, COUNT(*) to count all the transactions, and COUNT(DISTINCT rep) to count the different reps in each pile.",

  solutionQuery: `SELECT region,
  SUM(amount)           AS total,
  COUNT(*)              AS sale_count,
  COUNT(DISTINCT rep)   AS rep_count
FROM transactions
GROUP BY region
ORDER BY region`,
}

export const AGGREGATION_QUESTIONS = [
  AGGREGATION_EASY_1, AGGREGATION_EASY_2, AGGREGATION_EASY_3,
  AGGREGATION_MEDIUM_1, AGGREGATION_MEDIUM_2, AGGREGATION_MEDIUM_3,
  AGGREGATION_HARD_1, AGGREGATION_HARD_2, AGGREGATION_HARD_3,
]
