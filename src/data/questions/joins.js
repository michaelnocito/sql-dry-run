// joins — 9 questions (easy ×3, medium ×3, hard ×3)

// Shared schema used across most questions
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

// ── EASY ────────────────────────────────────────────────────────────────────

export const JOINS_EASY_1 = {
  questionId: 'joins-easy-1',
  skill: 'joins', difficulty: 'easy', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "List each employee's name and their department name.",

  hints: [
    "You need data from two tables — use JOIN (INNER JOIN) to combine them.",
    "Join on the column that links the tables: employees.dept_id = departments.id.",
    "SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.dept_id = d.id",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', dept_name: 'Engineering' },
      { name: 'Bob',   dept_name: 'Marketing'   },
      { name: 'Carol', dept_name: 'Engineering' },
      { name: 'Dave',  dept_name: 'Sales'       },
      { name: 'Eve',   dept_name: 'Marketing'   },
    ],
    requireKeywords: ['JOIN'],
    orderSensitive: false,
  },

  explanation: "JOIN (INNER JOIN) combines rows from two tables where the ON condition matches. Each employee's dept_id matches a department's id, producing one output row per employee. The ON clause defines the relationship.",

  plainSummary: "It uses an INNER JOIN to match each employee up with their department, then shows the employee's name next to the department's name.",

  solutionQuery: `SELECT e.name, d.dept_name
FROM employees e
JOIN departments d ON e.dept_id = d.id`,
}

export const JOINS_EASY_2 = {
  questionId: 'joins-easy-2',
  skill: 'joins', difficulty: 'easy', mode: 'practice',

  schema: `CREATE TABLE customers (
  id INTEGER, name TEXT, city TEXT
);
INSERT INTO customers VALUES
  (1,'Acme','New York'),(2,'Beta','Chicago'),(3,'Gamma','Boston'),
  (4,'Delta','Seattle'),(5,'Echo','Austin');

CREATE TABLE orders (
  id INTEGER, customer_id INTEGER, amount INTEGER
);
INSERT INTO orders VALUES
  (1,1,500),(2,1,1500),(3,2,800),(4,3,1200);`,

  prompt: "List all customers with their order amounts. Include customers who have no orders (show NULL for amount). Return name and amount.",

  hints: [
    "LEFT JOIN keeps ALL rows from the left table, even when there's no match on the right.",
    "Customers 4 (Delta) and 5 (Echo) have no orders — they'll appear with NULL amount.",
    "SELECT c.name, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Acme',  amount: 500  },
      { name: 'Acme',  amount: 1500 },
      { name: 'Beta',  amount: 800  },
      { name: 'Gamma', amount: 1200 },
      { name: 'Delta', amount: null },
      { name: 'Echo',  amount: null },
    ],
    requireKeywords: ['LEFT JOIN'],
    orderSensitive: false,
  },

  explanation: "LEFT JOIN returns all rows from the left table (customers) plus matched rows from the right (orders). Unmatched customers get NULL for every column from the orders table. INNER JOIN would silently drop Delta and Echo.",

  plainSummary: "It uses a LEFT JOIN to line up every customer against their orders, keeping customers even when no order matches; unmatched ones get NULL for the amount.",

  solutionQuery: `SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id`,
}

export const JOINS_EASY_3 = {
  questionId: 'joins-easy-3',
  skill: 'joins', difficulty: 'easy', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "List the name and salary of all employees who work in the SF office.",

  hints: [
    "JOIN employees to departments to access the location column.",
    "After joining, filter with WHERE d.location = 'SF'.",
    "SELECT e.name, e.salary FROM employees e JOIN departments d ON e.dept_id = d.id WHERE d.location = 'SF'",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', salary: 90000 },
      { name: 'Carol', salary: 80000 },
    ],
    requireKeywords: ['JOIN', 'WHERE'],
    orderSensitive: false,
  },

  explanation: "JOIN first combines the tables, then WHERE filters the combined result. Only Engineering is in SF, so only Alice and Carol appear.",

  plainSummary: "It uses a JOIN to attach each employee to their department, then a WHERE filter to keep only those whose department location is SF.",

  solutionQuery: `SELECT e.name, e.salary
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE d.location = 'SF'`,
}

// ── MEDIUM ───────────────────────────────────────────────────────────────────

export const JOINS_MEDIUM_1 = {
  questionId: 'joins-medium-1',
  skill: 'joins', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE employees (
  id INTEGER, name TEXT, dept_id INTEGER
);
INSERT INTO employees VALUES
  (1,'Alice',1),(2,'Bob',2),(3,'Carol',1),(4,'Dave',3),(5,'Eve',2);

CREATE TABLE departments (
  id INTEGER, dept_name TEXT, floor_id INTEGER
);
INSERT INTO departments VALUES
  (1,'Engineering',2),(2,'Marketing',3),(3,'Sales',1);

CREATE TABLE floors (
  id INTEGER, floor_num INTEGER, building TEXT
);
INSERT INTO floors VALUES
  (1,1,'Tower A'),(2,3,'Tower B'),(3,5,'Tower A');`,

  prompt: "List each employee's name, their department name, and the building they work in.",

  hints: [
    "Chain two JOINs: employees → departments → floors.",
    "First join: ON e.dept_id = d.id. Second join: ON d.floor_id = f.id.",
    "SELECT e.name, d.dept_name, f.building FROM employees e JOIN departments d ON e.dept_id = d.id JOIN floors f ON d.floor_id = f.id",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Alice', dept_name: 'Engineering', building: 'Tower B' },
      { name: 'Bob',   dept_name: 'Marketing',   building: 'Tower A' },
      { name: 'Carol', dept_name: 'Engineering', building: 'Tower B' },
      { name: 'Dave',  dept_name: 'Sales',        building: 'Tower A' },
      { name: 'Eve',   dept_name: 'Marketing',   building: 'Tower A' },
    ],
    requireKeywords: ['JOIN'],
    orderSensitive: false,
  },

  explanation: "Chained JOINs resolve left-to-right. Engineering uses floor_id=2 (Tower B). Marketing uses floor_id=3 (Tower A floor 5). Sales uses floor_id=1 (Tower A floor 1). Both Marketing and Sales are in Tower A but different floors.",

  plainSummary: "It chains two JOINs to hop from each employee to their department and then to the floor record, so it can show the name, department, and building together.",

  solutionQuery: `SELECT e.name, d.dept_name, f.building
FROM employees e
JOIN departments d ON e.dept_id = d.id
JOIN floors f ON d.floor_id = f.id`,
}

export const JOINS_MEDIUM_2 = {
  questionId: 'joins-medium-2',
  skill: 'joins', difficulty: 'medium', mode: 'practice',

  schema: `CREATE TABLE staff (
  id INTEGER, name TEXT, mgr_id INTEGER, dept TEXT
);
INSERT INTO staff VALUES
  (1,'Alice',NULL,'Engineering'),
  (2,'Bob',1,'Engineering'),
  (3,'Carol',1,'Engineering'),
  (4,'Dave',NULL,'Marketing'),
  (5,'Eve',4,'Marketing'),
  (6,'Frank',4,'Marketing');`,

  prompt: "List each employee and their manager's name. Exclude employees who have no manager. Return employee and manager.",

  hints: [
    "A self-join joins a table to itself using two aliases: FROM staff e JOIN staff m ON ...",
    "The join condition links each employee's mgr_id to the manager's id: e.mgr_id = m.id.",
    "SELECT e.name AS employee, m.name AS manager FROM staff e JOIN staff m ON e.mgr_id = m.id",
  ],

  answerKey: {
    expectedRows: [
      { employee: 'Bob',   manager: 'Alice' },
      { employee: 'Carol', manager: 'Alice' },
      { employee: 'Eve',   manager: 'Dave'  },
      { employee: 'Frank', manager: 'Dave'  },
    ],
    requireKeywords: ['JOIN'],
    orderSensitive: false,
  },

  explanation: "A self-join uses two aliases for the same table — here e for employees and m for managers. INNER JOIN on e.mgr_id = m.id naturally excludes Alice and Dave because their mgr_id is NULL, which doesn't match any id.",

  plainSummary: "It uses a self-join — joining the staff list to itself under two nicknames — to pair each person with their manager; people with no manager drop out because there's nothing to match.",

  solutionQuery: `SELECT e.name AS employee, m.name AS manager
FROM staff e
JOIN staff m ON e.mgr_id = m.id`,
}

export const JOINS_MEDIUM_3 = {
  questionId: 'joins-medium-3',
  skill: 'joins', difficulty: 'medium', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "For each department, show the department name, headcount, and average salary. Include all departments.",

  hints: [
    "LEFT JOIN departments → employees keeps all departments even if headcount would be 0.",
    "GROUP BY d.id, d.dept_name groups after the join.",
    "SELECT d.dept_name, COUNT(e.id) AS headcount, AVG(e.salary) AS avg_salary FROM departments d LEFT JOIN employees e ON e.dept_id = d.id GROUP BY d.id, d.dept_name",
  ],

  answerKey: {
    expectedRows: [
      { dept_name: 'Engineering', headcount: 2, avg_salary: 85000 },
      { dept_name: 'Marketing',   headcount: 2, avg_salary: 72500 },
      { dept_name: 'Sales',       headcount: 1, avg_salary: 65000 },
    ],
    requireKeywords: ['JOIN', 'GROUP BY'],
    orderSensitive: false,
  },

  explanation: "JOIN then GROUP BY is a common reporting pattern. Engineering: Alice(90k)+Carol(80k), avg=(90000+80000)/2=85000. Marketing: Bob(75k)+Eve(70k), avg=72500. COUNT(e.id) instead of COUNT(*) correctly handles departments with no employees (counts NULL e.id as 0).",

  plainSummary: "It uses a LEFT JOIN plus GROUP BY to bucket employees by department, then counts the people and averages their salaries per department, keeping departments that have nobody.",

  solutionQuery: `SELECT d.dept_name,
  COUNT(e.id)    AS headcount,
  AVG(e.salary)  AS avg_salary
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.id
GROUP BY d.id, d.dept_name`,
}

// ── HARD ─────────────────────────────────────────────────────────────────────

export const JOINS_HARD_1 = {
  questionId: 'joins-hard-1',
  skill: 'joins', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE customers (id INTEGER, name TEXT);
INSERT INTO customers VALUES (1,'Acme'),(2,'Beta'),(3,'Gamma'),(4,'Delta');

CREATE TABLE orders (id INTEGER, customer_id INTEGER, amount INTEGER);
INSERT INTO orders VALUES (1,1,1000),(2,1,500),(3,2,2000),(4,3,800);

CREATE TABLE payments (id INTEGER, order_id INTEGER, paid INTEGER);
INSERT INTO payments VALUES (1,1,1000),(2,3,1500);`,

  prompt: "For each customer show their name, order count, and total amount paid. Include customers with no orders. Return name, order_count, and total_paid.",

  hints: [
    "Chain two LEFT JOINs: customers → orders → payments.",
    "COALESCE(SUM(p.paid), 0) converts NULL (no payments) to 0.",
    "SELECT c.name, COUNT(o.id) AS order_count, COALESCE(SUM(p.paid), 0) AS total_paid FROM customers c LEFT JOIN orders o ON o.customer_id = c.id LEFT JOIN payments p ON p.order_id = o.id GROUP BY c.id, c.name ORDER BY c.name",
  ],

  answerKey: {
    expectedRows: [
      { name: 'Acme',  order_count: 2, total_paid: 1000 },
      { name: 'Beta',  order_count: 1, total_paid: 1500 },
      { name: 'Delta', order_count: 0, total_paid: 0    },
      { name: 'Gamma', order_count: 1, total_paid: 0    },
    ],
    requireKeywords: ['LEFT JOIN'],
    orderSensitive: false,
  },

  explanation: "Chained LEFT JOINs preserve all customers. Acme has 2 orders, payment on order 1 only (1000). Beta has 1 order, partially paid (1500 of 2000). Gamma has 1 order, unpaid (0). Delta has no orders (0/0). COALESCE handles the NULL-to-zero conversion for SUM.",

  plainSummary: "It chains two LEFT JOINs from customers to orders to payments, then groups per customer to count orders and add up payments, using COALESCE to turn missing totals into 0 so customers with no orders still show up.",

  solutionQuery: `SELECT c.name,
  COUNT(o.id)            AS order_count,
  COALESCE(SUM(p.paid), 0) AS total_paid
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY c.id, c.name
ORDER BY c.name`,
}

export const JOINS_HARD_2 = {
  questionId: 'joins-hard-2',
  skill: 'joins', difficulty: 'hard', mode: 'practice',

  schema: EMP_DEPT_SCHEMA,

  prompt: "For each department, show the department name and the name of the highest-paid employee. Return dept_name and top_earner.",

  hints: [
    "One approach: correlated subquery in WHERE — filter to employees whose salary equals the dept maximum.",
    "WHERE e.salary = (SELECT MAX(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)",
    "SELECT d.dept_name, e.name AS top_earner FROM employees e JOIN departments d ON e.dept_id = d.id WHERE e.salary = (SELECT MAX(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)",
  ],

  answerKey: {
    expectedRows: [
      { dept_name: 'Engineering', top_earner: 'Alice' },
      { dept_name: 'Marketing',   top_earner: 'Bob'   },
      { dept_name: 'Sales',       top_earner: 'Dave'  },
    ],
    requireKeywords: ['JOIN'],
    orderSensitive: false,
  },

  explanation: "The correlated subquery approach filters to rows where the salary matches the max for that department. Engineering max=90000 (Alice). Marketing max=75000 (Bob). Sales: Dave is the only employee. A derived table JOIN is an equally valid solution.",

  plainSummary: "It joins employees to their departments and uses a per-department MAX(salary) subquery in the WHERE clause to keep only the highest earner in each department.",

  solutionQuery: `SELECT d.dept_name, e.name AS top_earner
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.salary = (
  SELECT MAX(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id
)`,
}

export const JOINS_HARD_3 = {
  questionId: 'joins-hard-3',
  skill: 'joins', difficulty: 'hard', mode: 'practice',

  schema: `CREATE TABLE employees (
  id INTEGER, name TEXT, dept_id INTEGER, salary INTEGER
);
INSERT INTO employees VALUES
  (1,'Alice',1,90000),(2,'Bob',2,75000),(3,'Carol',1,80000),
  (4,'Dave',3,65000),(5,'Eve',2,70000);

CREATE TABLE departments (
  id INTEGER, dept_name TEXT, location TEXT
);
INSERT INTO departments VALUES
  (1,'Engineering','SF'),(2,'Marketing','NY'),
  (3,'Sales','Chicago'),(4,'Research','Boston');`,

  prompt: "List the name of any department that has no employees assigned to it.",

  hints: [
    "LEFT JOIN departments to employees — unmatched departments get NULL for employee columns.",
    "Filter with WHERE e.id IS NULL to keep only unmatched departments.",
    "SELECT d.dept_name FROM departments d LEFT JOIN employees e ON e.dept_id = d.id WHERE e.id IS NULL",
  ],

  answerKey: {
    expectedRows: [
      { dept_name: 'Research' },
    ],
    requireKeywords: ['LEFT JOIN', 'IS NULL'],
    orderSensitive: false,
  },

  explanation: "The anti-join pattern: LEFT JOIN then WHERE right-side column IS NULL. LEFT JOIN keeps all departments; WHERE e.id IS NULL filters to only the ones with no matching employee. Research (dept 4) has no employees. NOT IN or NOT EXISTS are alternative approaches.",

  plainSummary: "It uses the anti-join pattern — LEFT JOIN then WHERE the employee side IS NULL — to keep only departments that found no matching employee.",

  solutionQuery: `SELECT d.dept_name
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.id
WHERE e.id IS NULL`,
}

export const JOINS_QUESTIONS = [
  JOINS_EASY_1, JOINS_EASY_2, JOINS_EASY_3,
  JOINS_MEDIUM_1, JOINS_MEDIUM_2, JOINS_MEDIUM_3,
  JOINS_HARD_1, JOINS_HARD_2, JOINS_HARD_3,
]
