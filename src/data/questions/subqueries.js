// subqueries — 9 questions (easy ×3, medium ×3, hard ×3)

// ── EASY ────────────────────────────────────────────────────────────────────

const PRODUCTS_CART_SCHEMA = `CREATE TABLE products (
  id INTEGER, name TEXT, category TEXT, price INTEGER
);
INSERT INTO products VALUES
  (1,'Laptop','Electronics',999),(2,'Phone','Electronics',699),
  (3,'Desk','Furniture',350),(4,'Chair','Furniture',250),
  (5,'Monitor','Electronics',499),(6,'Notebook','Office',15),
  (7,'Stapler','Office',25);

CREATE TABLE cart (product_id INTEGER, qty INTEGER);
INSERT INTO cart VALUES (1,1),(3,2),(6,5),(7,1);`

export const SUBQUERIES_EASY_1 = {
  questionId: 'subqueries-easy-1',
  skill: 'subqueries', difficulty: 'easy', mode: 'practice',

  schema: PRODUCTS_CART_SCHEMA,

  prompt: "List the names of all products currently in the cart. Use a subquery with IN.",

  hints: [
    "First figure out which product_ids are in the cart: SELECT product_id FROM cart.",
    "Then use that as a subquery: WHERE id IN (SELECT product_id FROM cart).",
    "IN checks whether a value appears in a list or subquery result.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Laptop'   },
      { name: 'Desk'     },
      { name: 'Notebook' },
      { name: 'Stapler'  },
    ],
    requireKeywords: ['IN'],
    orderSensitive: false,
  },

  explanation: "IN (subquery) is equivalent to joining and filtering but often reads more clearly. The subquery SELECT product_id FROM cart returns {1,3,6,7}, and WHERE id IN (...) keeps only matching products.",

  solutionQuery: `SELECT name
FROM products
WHERE id IN (SELECT product_id FROM cart)`,
}

export const SUBQUERIES_EASY_2 = {
  questionId: 'subqueries-easy-2',
  skill: 'subqueries', difficulty: 'easy', mode: 'practice',

  schema: PRODUCTS_CART_SCHEMA,

  prompt: "List the names of all products NOT currently in the cart. Use NOT IN.",

  hints: [
    "NOT IN is the inverse of IN — it keeps rows where the value is absent from the subquery result.",
    "SELECT product_id FROM cart returns {1,3,6,7} — you want products whose id is NOT in that set.",
    "WHERE id NOT IN (SELECT product_id FROM cart)",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Phone'   },
      { name: 'Chair'   },
      { name: 'Monitor' },
    ],
    requireKeywords: ['NOT IN'],
    orderSensitive: false,
  },

  explanation: "NOT IN excludes rows whose value appears in the subquery result. Products 1,3,6,7 are in the cart, so ids 2 (Phone), 4 (Chair), and 5 (Monitor) remain. Warning: NOT IN returns no rows if the subquery contains any NULL values — use NOT EXISTS as a safer alternative in production.",

  solutionQuery: `SELECT name
FROM products
WHERE id NOT IN (SELECT product_id FROM cart)`,
}

export const SUBQUERIES_EASY_3 = {
  questionId: 'subqueries-easy-3',
  skill: 'subqueries', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE items (id INTEGER, name TEXT, price INTEGER);
INSERT INTO items VALUES (1,'Alpha',100),(2,'Beta',200),(3,'Gamma',300),(4,'Delta',400);`,

  prompt: "For each item, show its name and the difference between its price and the average price of all items. Return name and price_diff.",

  hints: [
    "A scalar subquery (SELECT AVG(price) FROM items) computes a single value you can use in expressions.",
    "price - (SELECT AVG(price) FROM items) gives the difference for each row.",
    "The subquery runs once; the result is used for every row.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alpha', price_diff: -150 },
      { name: 'Beta',  price_diff: -50  },
      { name: 'Gamma', price_diff: 50   },
      { name: 'Delta', price_diff: 150  },
    ],
    requireKeywords: ['AVG'],
    orderSensitive: false,
  },

  explanation: "A scalar subquery returns a single value and can appear in SELECT expressions. AVG(price) = (100+200+300+400)/4 = 250. Each item's price_diff = price - 250. Negative means below average, positive means above.",

  solutionQuery: `SELECT name, price - (SELECT AVG(price) FROM items) AS price_diff
FROM items
ORDER BY id`,
}

// ── MEDIUM ───────────────────────────────────────────────────────────────────

const EMP_DEPT_SCHEMA = `CREATE TABLE employees (
  id INTEGER, name TEXT, dept_id INTEGER, salary INTEGER
);
INSERT INTO employees VALUES
  (1,'Alice',1,90000),(2,'Bob',2,75000),(3,'Carol',1,80000),
  (4,'Dave',3,65000),(5,'Eve',2,70000);

CREATE TABLE departments (
  id INTEGER, dept_name TEXT, location TEXT
);
INSERT INTO departments VALUES
  (1,'Engineering','SF'),(2,'Marketing','NY'),(3,'Sales','Chicago');`

export const SUBQUERIES_MEDIUM_1 = {
  questionId: 'subqueries-medium-1',
  skill: 'subqueries', difficulty: 'medium', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "For each employee, show their name, salary, and the average salary of their department. Return name, salary, and dept_avg.",

  hints: [
    "A correlated subquery references the outer query: SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id.",
    "This subquery runs once per row of the outer query.",
    "Place the correlated subquery in the SELECT clause.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', salary: 90000, dept_avg: 85000 },
      { name: 'Bob',   salary: 75000, dept_avg: 72500 },
      { name: 'Carol', salary: 80000, dept_avg: 85000 },
      { name: 'Dave',  salary: 65000, dept_avg: 65000 },
      { name: 'Eve',   salary: 70000, dept_avg: 72500 },
    ],
    requireKeywords: ['AVG'],
    orderSensitive: false,
  },

  explanation: "A correlated subquery references the outer query's row — here e.dept_id ties the inner query to each employee's department. Engineering avg: (90000+80000)/2=85000. Marketing avg: (75000+70000)/2=72500. Dave is the only Sales employee, so his dept_avg equals his own salary.",

  solutionQuery: `SELECT name, salary,
  (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id) AS dept_avg
FROM employees e
ORDER BY name`,
}

export const SUBQUERIES_MEDIUM_2 = {
  questionId: 'subqueries-medium-2',
  skill: 'subqueries', difficulty: 'medium', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "Using a derived table (subquery in FROM), show each department name and its total salary spend. Return dept_name and total_salary.",

  hints: [
    "A derived table is a subquery in the FROM clause — give it an alias.",
    "Inner query: SELECT dept_id, SUM(salary) AS total_salary FROM employees GROUP BY dept_id.",
    "Then JOIN that result to departments on id = dept_id.",
  ],

  answerKey: {
    expectedRows: [
      { dept_name: 'Engineering', total_salary: 170000 },
      { dept_name: 'Marketing',   total_salary: 145000 },
      { dept_name: 'Sales',       total_salary: 65000  },
    ],
    requireKeywords: ['JOIN', 'GROUP BY'],
    orderSensitive: false,
  },

  explanation: "A derived table (inline view) lets you pre-aggregate data and join the result. The subquery groups employees by dept_id and sums salaries; the outer query joins that back to departments for the name. Engineering: 90000+80000=170000. Marketing: 75000+70000=145000.",

  solutionQuery: `SELECT d.dept_name, t.total_salary
FROM departments d
JOIN (
  SELECT dept_id, SUM(salary) AS total_salary
  FROM employees
  GROUP BY dept_id
) t ON d.id = t.dept_id
ORDER BY d.dept_name`,
}

export const SUBQUERIES_MEDIUM_3 = {
  questionId: 'subqueries-medium-3',
  skill: 'subqueries', difficulty: 'medium', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "Use a CTE (WITH clause) to find employees who earn above the company-wide average salary. Return name and salary, highest-paid first.",

  hints: [
    "WITH avg_sal AS (SELECT AVG(salary) AS avg FROM employees) defines a named result you can reference.",
    "Then in the main query: FROM employees, avg_sal WHERE salary > avg.",
    "CTEs make complex queries easier to read by naming intermediate steps.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', salary: 90000 },
      { name: 'Carol', salary: 80000 },
    ],
    requireKeywords: ['WITH'],
    orderSensitive: true,
  },

  explanation: "A CTE (Common Table Expression) names a temporary result set. Average salary = (90000+75000+80000+65000+70000)/5 = 76000. Alice (90000) and Carol (80000) are above the average. Bob (75000), Eve (70000), and Dave (65000) are not.",

  solutionQuery: `WITH avg_sal AS (
  SELECT AVG(salary) AS avg FROM employees
)
SELECT name, salary
FROM employees, avg_sal
WHERE salary > avg
ORDER BY salary DESC`,
}

// ── HARD ─────────────────────────────────────────────────────────────────────

export const SUBQUERIES_HARD_1 = {
  questionId: 'subqueries-hard-1',
  skill: 'subqueries', difficulty: 'hard', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "Use two CTEs: one to compute each department's average salary, and one to find employees above their department average. Return name, dept_name, and salary, ordered by salary descending.",

  hints: [
    "CTE 1: dept_avgs — SELECT dept_id, AVG(salary) AS dept_avg FROM employees GROUP BY dept_id.",
    "CTE 2: above_avg — JOIN employees to dept_avgs WHERE salary > dept_avg.",
    "Main query: JOIN above_avg with departments for the dept_name.",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', dept_name: 'Engineering', salary: 90000 },
      { name: 'Bob',   dept_name: 'Marketing',   salary: 75000 },
    ],
    requireKeywords: ['WITH', 'JOIN'],
    orderSensitive: true,
  },

  explanation: "Multiple CTEs keep each logical step named and readable. Engineering avg=85000: Alice(90k) is above, Carol(80k) is below. Marketing avg=72500: Bob(75k) is above, Eve(70k) is below. Dave is the only Sales employee — he equals the dept average, not above it.",

  solutionQuery: `WITH dept_avgs AS (
  SELECT dept_id, AVG(salary) AS dept_avg
  FROM employees GROUP BY dept_id
),
above_avg AS (
  SELECT e.name, e.dept_id, e.salary
  FROM employees e
  JOIN dept_avgs d ON e.dept_id = d.dept_id
  WHERE e.salary > d.dept_avg
)
SELECT a.name, d.dept_name, a.salary
FROM above_avg a
JOIN departments d ON a.dept_id = d.id
ORDER BY a.salary DESC`,
}

export const SUBQUERIES_HARD_2 = {
  questionId: 'subqueries-hard-2',
  skill: 'subqueries', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE customers (id INTEGER, name TEXT);
INSERT INTO customers VALUES (1,'Acme'),(2,'Beta'),(3,'Gamma'),(4,'Delta');

CREATE TABLE orders (id INTEGER, customer_id INTEGER, amount INTEGER);
INSERT INTO orders VALUES
  (1,1,500),(2,1,1500),(3,2,800),(4,2,1200),(5,3,600);`,

  prompt: "List the names of customers who have placed at least one order. Use EXISTS. Also list customers with no orders using NOT EXISTS — return both in two separate queries joined with UNION.",

  hints: [
    "EXISTS (subquery) is true if the subquery returns any rows — use it for 'at least one order'.",
    "NOT EXISTS is the inverse — true when the subquery returns no rows.",
    "UNION combines results from two SELECT statements (removing duplicates).",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Acme',  has_order: 'yes' },
      { name: 'Beta',  has_order: 'yes' },
      { name: 'Delta', has_order: 'no'  },
      { name: 'Gamma', has_order: 'yes' },
    ],
    requireKeywords: ['EXISTS', 'NOT EXISTS'],
    orderSensitive: false,
  },

  explanation: "EXISTS is safer than IN when the subquery could return NULLs. NOT EXISTS is safer than NOT IN for the same reason. UNION combines both result sets. Acme, Beta, Gamma have orders; Delta does not.",

  solutionQuery: `SELECT name, 'yes' AS has_order FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
UNION
SELECT name, 'no' AS has_order FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
ORDER BY name`,
}

export const SUBQUERIES_HARD_3 = {
  questionId: 'subqueries-hard-3',
  skill: 'subqueries', difficulty: 'hard', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "Use a CTE with a window function to find the top 2 earners in each department. Return dept_name, name, and salary, ordered by dept_name then salary descending.",

  hints: [
    "CTE: rank each employee with ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn.",
    "Main query: JOIN the ranked CTE with departments WHERE rn <= 2.",
    "ROW_NUMBER assigns unique ranks even for ties — no shared positions.",
  ],

  answerKey: {
    expectedRows: [
      { dept_name: 'Engineering', name: 'Alice', salary: 90000 },
      { dept_name: 'Engineering', name: 'Carol', salary: 80000 },
      { dept_name: 'Marketing',   name: 'Bob',   salary: 75000 },
      { dept_name: 'Marketing',   name: 'Eve',   salary: 70000 },
      { dept_name: 'Sales',       name: 'Dave',  salary: 65000 },
    ],
    requireKeywords: ['WITH', 'ROW_NUMBER'],
    orderSensitive: true,
  },

  explanation: "The CTE + window function pattern is the standard way to filter on a window function result — you can't use a window function directly in WHERE. ROW_NUMBER PARTITION BY dept_id ranks within each department; WHERE rn <= 2 keeps the top two. Sales has only one employee so only one row appears.",

  solutionQuery: `WITH ranked AS (
  SELECT name, dept_id, salary,
    ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT d.dept_name, r.name, r.salary
FROM ranked r
JOIN departments d ON r.dept_id = d.id
WHERE r.rn <= 2
ORDER BY d.dept_name, r.salary DESC`,
}

export const SUBQUERIES_QUESTIONS = [
  SUBQUERIES_EASY_1, SUBQUERIES_EASY_2, SUBQUERIES_EASY_3,
  SUBQUERIES_MEDIUM_1, SUBQUERIES_MEDIUM_2, SUBQUERIES_MEDIUM_3,
  SUBQUERIES_HARD_1, SUBQUERIES_HARD_2, SUBQUERIES_HARD_3,
]
