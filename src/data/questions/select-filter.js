// select-filter — 9 questions (easy ×3, medium ×3, hard ×3)

// ── EASY ────────────────────────────────────────────────────────────────────

export const SELECT_FILTER_EASY_1 = {
  questionId: 'select-filter-easy-1',
  skill: 'select-filter', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE products (
  id INTEGER, name TEXT, category TEXT, price INTEGER, in_stock INTEGER
);
INSERT INTO products VALUES
  (1,'Wireless Mouse','Electronics',29,1),
  (2,'Desk Lamp','Office',45,1),
  (3,'USB Hub','Electronics',19,0),
  (4,'Notebook','Office',8,1),
  (5,'Monitor Stand','Electronics',79,1),
  (6,'Stapler','Office',12,0);`,

  prompt: "List the name and price of all in-stock Electronics products. Order by price ascending.",

  hints: [
    "Two conditions go in WHERE joined by AND: category = 'Electronics' AND in_stock = 1.",
    "ORDER BY price ASC (or just ORDER BY price — ASC is the default).",
    "SELECT name, price FROM products WHERE category = 'Electronics' AND in_stock = 1 ORDER BY price ASC",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Wireless Mouse', price: 29 },
      { name: 'Monitor Stand',  price: 79 },
    ],
    requireKeywords: ['WHERE'],
    orderSensitive: true,
  },

  explanation: "WHERE filters rows before sorting. AND requires both conditions to be true simultaneously. ORDER BY price ASC returns the cheapest qualifying item first.",
  plainSummary: "It uses WHERE with AND to keep only rows that are both Electronics and in stock, then ORDER BY to line them up from cheapest to priciest.",

  solutionQuery: `SELECT name, price
FROM products
WHERE category = 'Electronics'
  AND in_stock = 1
ORDER BY price ASC`,
}

export const SELECT_FILTER_EASY_2 = {
  questionId: 'select-filter-easy-2',
  skill: 'select-filter', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE customers (
  id INTEGER, name TEXT, city TEXT, tier TEXT
);
INSERT INTO customers VALUES
  (1,'Acme','New York','Gold'),
  (2,'Beta','Chicago','Silver'),
  (3,'Gamma','New York','Bronze'),
  (4,'Delta','Chicago','Gold'),
  (5,'Echo','Boston','Silver'),
  (6,'Foxtrot','Boston','Bronze');`,

  prompt: "List the distinct cities where customers are located, sorted alphabetically.",

  hints: [
    "SELECT DISTINCT removes duplicate values from a column.",
    "ORDER BY city puts the results in alphabetical order.",
    "SELECT DISTINCT city FROM customers ORDER BY city",
  ],

  answerKey: {
    expectedRows: [
      { city: 'Boston' },
      { city: 'Chicago' },
      { city: 'New York' },
    ],
    requireKeywords: ['DISTINCT'],
    orderSensitive: true,
  },

  explanation: "DISTINCT deduplanes the result set — even though 6 customers exist across 3 cities, only 3 unique city values are returned. It operates on the selected columns after the SELECT keyword.",
  plainSummary: "It uses SELECT DISTINCT to collapse repeated city values down to one of each, then ORDER BY to sort those names alphabetically.",

  solutionQuery: `SELECT DISTINCT city
FROM customers
ORDER BY city`,
}

export const SELECT_FILTER_EASY_3 = {
  questionId: 'select-filter-easy-3',
  skill: 'select-filter', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE items (
  id INTEGER, name TEXT, category TEXT, price INTEGER
);
INSERT INTO items VALUES
  (1,'Laptop','Electronics',999),
  (2,'Phone','Electronics',699),
  (3,'Desk','Furniture',350),
  (4,'Chair','Furniture',250),
  (5,'Monitor','Electronics',499),
  (6,'Bookshelf','Furniture',180),
  (7,'Tablet','Electronics',449);`,

  prompt: "List the name and price of all items priced between $300 and $500 inclusive, sorted by price ascending.",

  hints: [
    "BETWEEN a AND b is shorthand for >= a AND <= b — both endpoints are included.",
    "ORDER BY price puts them cheapest first.",
    "SELECT name, price FROM items WHERE price BETWEEN 300 AND 500 ORDER BY price",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Desk',    price: 350 },
      { name: 'Tablet',  price: 449 },
      { name: 'Monitor', price: 499 },
    ],
    requireKeywords: ['BETWEEN'],
    orderSensitive: true,
  },

  explanation: "BETWEEN is inclusive on both ends — it is exactly equivalent to price >= 300 AND price <= 500. Chair (250) falls below the range; Phone (699) and Laptop (999) fall above it.",
  plainSummary: "It uses BETWEEN to keep only rows whose price lands inside the 300-to-500 range (both ends counted), then ORDER BY to sort them cheapest first.",

  solutionQuery: `SELECT name, price
FROM items
WHERE price BETWEEN 300 AND 500
ORDER BY price ASC`,
}

// ── MEDIUM ───────────────────────────────────────────────────────────────────

export const SELECT_FILTER_MEDIUM_1 = {
  questionId: 'select-filter-medium-1',
  skill: 'select-filter', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE orders (
  order_id INTEGER, rep_name TEXT, region TEXT, amount INTEGER, status TEXT
);
INSERT INTO orders VALUES
  (1,'Alice','West',1200,'closed'),
  (2,'Bob','East',850,'closed'),
  (3,'Alice','West',3100,'closed'),
  (4,'Carol','East',400,'open'),
  (5,'Bob','East',2200,'closed'),
  (6,'Carol','West',950,'closed'),
  (7,'Alice','East',1800,'closed'),
  (8,'Bob','West',600,'open');`,

  prompt: "For each rep, calculate their total revenue from closed orders. Return only reps whose total exceeds $3,000. Return rep_name and total_revenue.",

  hints: [
    "Filter to status = 'closed' first with WHERE, then group by rep_name.",
    "HAVING filters groups after aggregation — HAVING SUM(amount) > 3000.",
    "SELECT rep_name, SUM(amount) AS total_revenue FROM orders WHERE status = 'closed' GROUP BY rep_name HAVING SUM(amount) > 3000",
  ],

  answerKey: {
    expectedRows: [
      { rep_name: 'Alice', total_revenue: 6100 },
      { rep_name: 'Bob',   total_revenue: 3050 },
    ],
    requireKeywords: ['GROUP BY', 'HAVING'],
    orderSensitive: false,
  },

  explanation: "WHERE filters individual rows before grouping; HAVING filters groups after aggregation. Alice's closed orders: 1200+3100+1800=6100. Bob's: 850+2200=3050. Carol's closed order (950) is below 3000.",
  plainSummary: "It uses WHERE to keep only closed orders, GROUP BY to pile those rows together per rep, SUM to add up each rep's amounts, and HAVING to keep only reps whose total tops 3,000.",

  solutionQuery: `SELECT rep_name, SUM(amount) AS total_revenue
FROM orders
WHERE status = 'closed'
GROUP BY rep_name
HAVING SUM(amount) > 3000`,
}

export const SELECT_FILTER_MEDIUM_2 = {
  questionId: 'select-filter-medium-2',
  skill: 'select-filter', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE employees (
  id INTEGER, name TEXT, dept TEXT, score INTEGER
);
INSERT INTO employees VALUES
  (1,'Alice','Engineering',92),
  (2,'Bob','Marketing',78),
  (3,'Carol','Engineering',85),
  (4,'Dave','Marketing',64),
  (5,'Eve','Engineering',71),
  (6,'Frank','Marketing',88);`,

  prompt: "Add a rating column: 'High' for score >= 85, 'Mid' for score >= 70, 'Low' otherwise. Return name and rating for all employees.",

  hints: [
    "CASE WHEN condition THEN value ... ELSE fallback END — SQLite evaluates conditions in order and returns the first match.",
    "Order matters: check >= 85 first, then >= 70 — otherwise 92 would match the Mid clause before reaching High.",
    "SELECT name, CASE WHEN score >= 85 THEN 'High' WHEN score >= 70 THEN 'Mid' ELSE 'Low' END AS rating FROM employees",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', rating: 'High' },
      { name: 'Bob',   rating: 'Mid'  },
      { name: 'Carol', rating: 'High' },
      { name: 'Dave',  rating: 'Low'  },
      { name: 'Eve',   rating: 'Mid'  },
      { name: 'Frank', rating: 'High' },
    ],
    requireKeywords: ['CASE'],
    orderSensitive: false,
  },

  explanation: "CASE WHEN works like a series of if/else-if checks. SQLite stops at the first true condition, so placing >= 85 first ensures scores like 92 get 'High', not 'Mid'. Dave (64) falls through all conditions to ELSE 'Low'.",
  plainSummary: "It uses CASE WHEN, which checks each rule top to bottom and stops at the first one that fits, to label each score 'High', 'Mid', or 'Low'.",

  solutionQuery: `SELECT name,
  CASE
    WHEN score >= 85 THEN 'High'
    WHEN score >= 70 THEN 'Mid'
    ELSE 'Low'
  END AS rating
FROM employees`,
}

export const SELECT_FILTER_MEDIUM_3 = {
  questionId: 'select-filter-medium-3',
  skill: 'select-filter', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE employees (
  id INTEGER, name TEXT, dept TEXT, score INTEGER
);
INSERT INTO employees VALUES
  (1,'Alice','Engineering',92),
  (2,'Bob','Marketing',78),
  (3,'Carol','Engineering',85),
  (4,'Dave','Marketing',64),
  (5,'Eve','Engineering',71),
  (6,'Frank','Marketing',88);`,

  prompt: "List the top 3 highest-scoring employees. Return name and score, highest first.",

  hints: [
    "ORDER BY score DESC sorts highest score first.",
    "LIMIT 3 keeps only the first 3 rows of the sorted result.",
    "SELECT name, score FROM employees ORDER BY score DESC LIMIT 3",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', score: 92 },
      { name: 'Frank', score: 88 },
      { name: 'Carol', score: 85 },
    ],
    requireKeywords: ['LIMIT', 'ORDER BY'],
    orderSensitive: true,
  },

  explanation: "ORDER BY score DESC puts the highest scores first, then LIMIT 3 cuts the result to just 3 rows. ORDER BY must come before LIMIT — LIMIT only makes sense after sorting.",
  plainSummary: "It uses ORDER BY ... DESC to sort everyone from highest score to lowest, then LIMIT 3 to keep just the top three rows.",

  solutionQuery: `SELECT name, score
FROM employees
ORDER BY score DESC
LIMIT 3`,
}

// ── HARD ─────────────────────────────────────────────────────────────────────

export const SELECT_FILTER_HARD_1 = {
  questionId: 'select-filter-hard-1',
  skill: 'select-filter', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE employees (
  id INTEGER, name TEXT, department TEXT, salary INTEGER
);
INSERT INTO employees VALUES
  (1,'Alice','Engineering',90000),
  (2,'Bob','Engineering',80000),
  (3,'Carol','Marketing',65000),
  (4,'Dave','Marketing',72000),
  (5,'Eve','Engineering',95000),
  (6,'Frank','Marketing',58000);`,

  prompt: "List the name and salary of every employee who earns above the company-wide average salary. Return name and salary.",

  hints: [
    "You need the average salary computed dynamically — use a scalar subquery: (SELECT AVG(salary) FROM employees).",
    "Place that subquery inside a WHERE clause: WHERE salary > (SELECT AVG(salary) FROM employees).",
    "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)",
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

  explanation: "A scalar subquery returns a single value and can appear wherever an expression is valid — including in WHERE. SELECT AVG(salary) FROM employees computes the average; placing it in WHERE salary > (...) filters to above-average earners. Average = (90000+80000+65000+72000+95000+58000)/6 = 76666.67. Hardcoding that number means your query breaks if the data changes.",
  plainSummary: "It uses a small inner query with AVG to figure out the average salary on the fly, then WHERE to keep only people who earn more than that figure.",

  solutionQuery: `SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)`,
}

export const SELECT_FILTER_HARD_2 = {
  questionId: 'select-filter-hard-2',
  skill: 'select-filter', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE customers (
  id INTEGER, name TEXT, tier TEXT
);
INSERT INTO customers VALUES
  (1,'Acme','Gold'),(2,'Beta','Silver'),(3,'Gamma','Bronze'),
  (4,'Delta','Silver'),(5,'Echo','Gold');

CREATE TABLE orders (
  id INTEGER, customer_id INTEGER, amount INTEGER
);
INSERT INTO orders VALUES
  (1,1,500),(2,1,1500),(3,2,800),(4,3,1200),(5,3,300),(6,4,400),(7,5,2000),(8,5,600);`,

  prompt: "List the name of each customer who has placed at least one order over $1,000. Use EXISTS.",

  hints: [
    "EXISTS (subquery) returns true if the subquery produces any rows.",
    "Correlate the subquery to the outer query: WHERE o.customer_id = c.id AND o.amount > 1000.",
    "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.amount > 1000)",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Acme'  },
      { name: 'Gamma' },
      { name: 'Echo'  },
    ],
    requireKeywords: ['EXISTS'],
    orderSensitive: false,
  },

  explanation: "EXISTS takes a correlated subquery and returns TRUE if it produces at least one row. Acme has order 1500, Gamma has 1200, Echo has 2000 — each has at least one order > 1000. Beta (800) and Delta (400) do not.",
  plainSummary: "It uses EXISTS, which keeps a customer whenever a quick inner check can find at least one matching order over 1,000 tied to that customer.",

  solutionQuery: `SELECT name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id
    AND o.amount > 1000
)`,
}

export const SELECT_FILTER_HARD_3 = {
  questionId: 'select-filter-hard-3',
  skill: 'select-filter', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE contacts (
  id INTEGER, name TEXT, email TEXT, phone TEXT
);
INSERT INTO contacts VALUES
  (1,'Alice Smith','alice@acme.com','555-1234'),
  (2,'Bob Jones','bob@beta.com','555-5678'),
  (3,'Carol Smith','carol@gamma.com','555-9012'),
  (4,'Dave Brown','dave@acme.com','444-3456'),
  (5,'Eve Davis','eve@beta.com','555-7890'),
  (6,'Frank Smith','frank@delta.com','333-1111');`,

  prompt: "Find all people whose last name is Smith AND whose phone number starts with '555'. Return name and phone.",

  hints: [
    "LIKE 'Smith' won't match 'Alice Smith' — you need a wildcard: LIKE '%Smith'.",
    "Phone starts with '555': LIKE '555%'.",
    "SELECT name, phone FROM contacts WHERE name LIKE '%Smith' AND phone LIKE '555%'",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice Smith', phone: '555-1234' },
      { name: 'Carol Smith', phone: '555-9012' },
    ],
    requireKeywords: ['LIKE', 'WHERE'],
    orderSensitive: false,
  },

  explanation: "LIKE '%Smith' matches any name ending in 'Smith' — the % wildcard matches zero or more characters at the start. Frank Smith has phone '333-1111' which fails the second condition, so he's excluded despite the name match.",
  plainSummary: "It uses LIKE with % wildcards to match any name ending in 'Smith' and any phone starting with '555', and AND requires both to be true at once.",

  solutionQuery: `SELECT name, phone
FROM contacts
WHERE name LIKE '%Smith'
  AND phone LIKE '555%'`,
}

export const SELECT_FILTER_QUESTIONS = [
  SELECT_FILTER_EASY_1, SELECT_FILTER_EASY_2, SELECT_FILTER_EASY_3,
  SELECT_FILTER_MEDIUM_1, SELECT_FILTER_MEDIUM_2, SELECT_FILTER_MEDIUM_3,
  SELECT_FILTER_HARD_1, SELECT_FILTER_HARD_2, SELECT_FILTER_HARD_3,
]
