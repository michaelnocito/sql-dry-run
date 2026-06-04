// select-filter skill — 3 Phase 1 placeholder questions (easy/medium/hard)
// Phase 4 expands to full 9-question bank for this skill.

// ---------------------------------------------------------------------------
// Easy: SELECT + WHERE with two conditions, ORDER BY
// ---------------------------------------------------------------------------

export const SELECT_FILTER_EASY_1 = {
  questionId: 'select-filter-easy-1',
  skill:      'select-filter',
  difficulty: 'easy',
  mode:       'practice',

  schema: `CREATE TABLE products (
  id       INTEGER,
  name     TEXT,
  category TEXT,
  price    REAL,
  in_stock INTEGER
);
INSERT INTO products VALUES
  (1, 'Wireless Mouse',  'Electronics', 29.99, 1),
  (2, 'Desk Lamp',       'Office',      45.00, 1),
  (3, 'USB Hub',         'Electronics', 19.99, 0),
  (4, 'Notebook',        'Office',       8.99, 1),
  (5, 'Monitor Stand',   'Electronics', 79.99, 1),
  (6, 'Stapler',         'Office',      12.49, 0);`,

  prompt: "List the name and price of all in-stock Electronics products. Order by price ascending.",

  hints: [
    "You need two conditions: category = 'Electronics' AND in_stock = 1. Combine them with AND in a WHERE clause.",
    "Use ORDER BY price ASC (or just ORDER BY price — ASC is the default) to sort cheapest-first.",
    "SELECT name, price FROM products WHERE ... ORDER BY price",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Wireless Mouse', price: 29.99 },
      { name: 'Monitor Stand',  price: 79.99 },
    ],
    requireKeywords: ['WHERE'],
    orderSensitive: true,
  },

  explanation: "WHERE filters rows before any sorting. Combining conditions with AND means both must be true. ORDER BY price ASC sorts numerically ascending — you get the cheapest in-stock Electronics item first.",

  solutionQuery: `SELECT name, price
FROM products
WHERE category = 'Electronics'
  AND in_stock = 1
ORDER BY price ASC`,
}

// ---------------------------------------------------------------------------
// Medium: GROUP BY + HAVING to filter aggregated results
// ---------------------------------------------------------------------------

export const SELECT_FILTER_MEDIUM_1 = {
  questionId: 'select-filter-medium-1',
  skill:      'select-filter',
  difficulty: 'medium',
  mode:       'practice',

  schema: `CREATE TABLE orders (
  order_id INTEGER,
  rep_name TEXT,
  region   TEXT,
  amount   REAL,
  status   TEXT
);
INSERT INTO orders VALUES
  (1, 'Alice', 'West', 1200, 'closed'),
  (2, 'Bob',   'East',  850, 'closed'),
  (3, 'Alice', 'West', 3100, 'closed'),
  (4, 'Carol', 'East',  400, 'open'),
  (5, 'Bob',   'East', 2200, 'closed'),
  (6, 'Carol', 'West',  950, 'closed'),
  (7, 'Alice', 'East', 1800, 'closed'),
  (8, 'Bob',   'West',  600, 'open');`,

  prompt: "For each rep, calculate their total revenue from closed orders. Return only reps whose total exceeds $3,000. Return rep_name and total_revenue.",

  hints: [
    "Filter to status = 'closed' first with WHERE, then group by rep_name.",
    "Use SUM(amount) AS total_revenue to aggregate each rep's revenue.",
    "HAVING filters groups after aggregation — HAVING SUM(amount) > 3000 keeps only the high earners.",
  ],

  answerKey: {
    expectedRows: [
      { rep_name: 'Alice', total_revenue: 6100 },
      { rep_name: 'Bob',   total_revenue: 3050 },
    ],
    requireKeywords: ['GROUP BY', 'HAVING'],
    orderSensitive: false,
  },

  explanation: "WHERE filters individual rows before grouping; HAVING filters groups after aggregation. You can't use HAVING to refer to rows that were excluded by WHERE, so always put the row-level filter (status = 'closed') in WHERE, and put the aggregate condition (SUM > 3000) in HAVING.",

  solutionQuery: `SELECT rep_name, SUM(amount) AS total_revenue
FROM orders
WHERE status = 'closed'
GROUP BY rep_name
HAVING SUM(amount) > 3000`,
}

// ---------------------------------------------------------------------------
// Hard: Scalar subquery — filter against a computed aggregate
// ---------------------------------------------------------------------------

export const SELECT_FILTER_HARD_1 = {
  questionId: 'select-filter-hard-1',
  skill:      'select-filter',
  difficulty: 'hard',
  mode:       'practice',

  schema: `CREATE TABLE employees (
  id         INTEGER,
  name       TEXT,
  department TEXT,
  salary     REAL
);
INSERT INTO employees VALUES
  (1, 'Alice', 'Engineering', 90000),
  (2, 'Bob',   'Engineering', 80000),
  (3, 'Carol', 'Marketing',   65000),
  (4, 'Dave',  'Marketing',   72000),
  (5, 'Eve',   'Engineering', 95000),
  (6, 'Frank', 'Marketing',   58000);`,

  prompt: "List the name and salary of every employee who earns above the company-wide average salary. Return name and salary.",

  hints: [
    "You need the average salary for comparison — compute it with a subquery: (SELECT AVG(salary) FROM employees).",
    "Use that subquery inline inside a WHERE clause: WHERE salary > (SELECT AVG(salary) FROM employees).",
    "Don't hardcode the average — the grader checks that your query actually computes it.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', salary: 90000 },
      { name: 'Bob',   salary: 80000 },
      { name: 'Eve',   salary: 95000 },
    ],
    requireKeywords: ['WHERE', 'AVG'],
    orderSensitive: false,
  },

  explanation: "A scalar subquery returns a single value and can appear anywhere an expression is valid — including inside WHERE. SELECT AVG(salary) FROM employees computes the company average; placing it in WHERE salary > (...) filters to above-average earners. Hardcoding the number (e.g. WHERE salary > 76666) is flagged: if the data changes, your query breaks.",

  solutionQuery: `SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)`,
}

export const SELECT_FILTER_QUESTIONS = [
  SELECT_FILTER_EASY_1,
  SELECT_FILTER_MEDIUM_1,
  SELECT_FILTER_HARD_1,
]
