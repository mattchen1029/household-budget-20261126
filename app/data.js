// Hearth Budget — data and calculations.
//
// Everything on the site is computed from this one store: the example
// household's transactions, monthly budget limits, savings goals and
// recurring bills. No figures are hard-coded anywhere else; every total,
// remaining budget and progress bar on screen is derived here, so the
// numbers the site shows are always arithmetically consistent.
//
// The data is a clearly labelled EXAMPLE household (the Alvarez family).
// It is sample data for trying the tools, not real-world statistics.

export const HOUSEHOLD_NAME = 'The Alvarez family';
export const CURRENCY = 'USD';

export const CATEGORIES = [
  'Housing',
  'Groceries',
  'Dining Out',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Clothing',
  'Other',
];

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Refund', 'Other income'];

// A small, stable palette — one colour per spending category, reused by
// the donut chart, the budget bars and the transaction list.
export const CATEGORY_COLORS = {
  Housing: '#2e6f5e',
  Groceries: '#e8a33d',
  'Dining Out': '#d96c4f',
  Transport: '#5b8dbf',
  Utilities: '#7a6fb0',
  Entertainment: '#c98bb0',
  Health: '#4fa08a',
  Clothing: '#a08c5b',
  Other: '#9a9a92',
};

export const DEFAULT_DATA = {
  transactions: [
    // ---- October 2026 ----
    { id: 't-oct-01', date: '2026-10-01', kind: 'income', category: 'Salary', note: 'Maya — monthly pay', amount: 3850.0 },
    { id: 't-oct-02', date: '2026-10-01', kind: 'income', category: 'Salary', note: 'Jordan — monthly pay', amount: 1950.0 },
    { id: 't-oct-03', date: '2026-10-01', kind: 'expense', category: 'Housing', note: 'October rent', amount: 1850.0 },
    { id: 't-oct-04', date: '2026-10-03', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 142.5 },
    { id: 't-oct-05', date: '2026-10-05', kind: 'expense', category: 'Utilities', note: 'Electricity bill', amount: 118.4 },
    { id: 't-oct-06', date: '2026-10-07', kind: 'expense', category: 'Dining Out', note: 'Dinner with friends', amount: 64.2 },
    { id: 't-oct-07', date: '2026-10-09', kind: 'expense', category: 'Transport', note: 'Fuel', amount: 52.0 },
    { id: 't-oct-08', date: '2026-10-11', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 96.75 },
    { id: 't-oct-09', date: '2026-10-13', kind: 'expense', category: 'Entertainment', note: 'Cinema tickets', amount: 38.0 },
    { id: 't-oct-10', date: '2026-10-15', kind: 'expense', category: 'Health', note: 'Pharmacy', amount: 27.9 },
    { id: 't-oct-11', date: '2026-10-16', kind: 'income', category: 'Freelance', note: 'Maya — weekend design work', amount: 320.0 },
    { id: 't-oct-12', date: '2026-10-18', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 121.3 },
    { id: 't-oct-13', date: '2026-10-20', kind: 'expense', category: 'Dining Out', note: 'Takeaway night', amount: 48.5 },
    { id: 't-oct-14', date: '2026-10-22', kind: 'expense', category: 'Transport', note: 'Monthly bus passes', amount: 85.0 },
    { id: 't-oct-15', date: '2026-10-25', kind: 'expense', category: 'Utilities', note: 'Internet bill', amount: 65.0 },
    { id: 't-oct-16', date: '2026-10-27', kind: 'expense', category: 'Clothing', note: "Leo's winter jacket", amount: 74.99 },
    { id: 't-oct-17', date: '2026-10-29', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 88.4 },
    // ---- November 2026 ----
    { id: 't-nov-01', date: '2026-11-01', kind: 'income', category: 'Salary', note: 'Maya — monthly pay', amount: 3850.0 },
    { id: 't-nov-02', date: '2026-11-01', kind: 'income', category: 'Salary', note: 'Jordan — monthly pay', amount: 1950.0 },
    { id: 't-nov-03', date: '2026-11-01', kind: 'expense', category: 'Housing', note: 'November rent', amount: 1850.0 },
    { id: 't-nov-04', date: '2026-11-02', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 134.2 },
    { id: 't-nov-05', date: '2026-11-04', kind: 'expense', category: 'Utilities', note: 'Electricity bill', amount: 104.75 },
    { id: 't-nov-06', date: '2026-11-06', kind: 'expense', category: 'Dining Out', note: 'Friday pizza night', amount: 72.4 },
    { id: 't-nov-07', date: '2026-11-08', kind: 'expense', category: 'Transport', note: 'Fuel', amount: 48.0 },
    { id: 't-nov-08', date: '2026-11-10', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 112.6 },
    { id: 't-nov-09', date: '2026-11-12', kind: 'expense', category: 'Entertainment', note: 'Streaming subscription', amount: 15.99 },
    { id: 't-nov-10', date: '2026-11-14', kind: 'income', category: 'Freelance', note: 'Jordan — tutoring', amount: 180.0 },
    { id: 't-nov-11', date: '2026-11-15', kind: 'expense', category: 'Health', note: 'Dentist check-up', amount: 120.0 },
    { id: 't-nov-12', date: '2026-11-17', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 98.35 },
    { id: 't-nov-13', date: '2026-11-19', kind: 'expense', category: 'Dining Out', note: 'Lunch out', amount: 56.8 },
    { id: 't-nov-14', date: '2026-11-21', kind: 'expense', category: 'Transport', note: 'Monthly bus passes', amount: 85.0 },
    { id: 't-nov-15', date: '2026-11-23', kind: 'expense', category: 'Utilities', note: 'Internet bill', amount: 65.0 },
    { id: 't-nov-16', date: '2026-11-24', kind: 'expense', category: 'Groceries', note: 'Weekly shop — Market Street', amount: 76.5 },
    { id: 't-nov-17', date: '2026-11-25', kind: 'expense', category: 'Clothing', note: 'School shoes', amount: 42.3 },
  ],
  budgets: {
    Housing: 1900,
    Groceries: 550,
    'Dining Out': 300,
    Transport: 220,
    Utilities: 220,
    Entertainment: 120,
    Health: 150,
    Clothing: 120,
  },
  goals: [
    { id: 'g-1', name: 'Emergency fund', target: 10000, saved: 6400, note: 'Six months of essentials, for peace of mind.' },
    { id: 'g-2', name: 'Family vacation', target: 2500, saved: 1150, note: 'A week by the coast next summer.' },
    { id: 'g-3', name: 'New car down payment', target: 8000, saved: 2300, note: 'Replacing the old hatchback in 2027.' },
  ],
  bills: [
    { id: 'b-1', name: 'Rent', amount: 1850, dueDay: 1, paid: true },
    { id: 'b-2', name: 'Internet', amount: 65, dueDay: 15, paid: true },
    { id: 'b-3', name: 'Electricity', amount: 110, dueDay: 20, paid: false },
    { id: 'b-4', name: 'Phone plan (2 lines)', amount: 90, dueDay: 10, paid: true },
    { id: 'b-5', name: 'Streaming', amount: 15.99, dueDay: 12, paid: true },
    { id: 'b-6', name: 'Gym membership', amount: 45, dueDay: 5, paid: false },
    { id: 'b-7', name: 'Car insurance', amount: 132, dueDay: 25, paid: false },
  ],
};

// ---------------------------------------------------------------------------
// Store: load the example data, persist edits to localStorage (guarded), and
// fall back to memory when storage is unavailable (e.g. file:// or a
// private window). Nothing here touches the network.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'hearth-budget-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loadState() {
  return loadStored() ?? clone(DEFAULT_DATA);
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — edits still work for this visit, in memory.
  }
}

export function resetState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
  return clone(DEFAULT_DATA);
}

// ---------------------------------------------------------------------------
// Calculations — every figure on the site comes from these helpers.
// ---------------------------------------------------------------------------

export function monthKey(date) {
  return date.slice(0, 7); // '2026-11'
}

export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function monthsInData(state) {
  const keys = new Set(state.transactions.map((t) => monthKey(t.date)));
  return [...keys].sort().reverse(); // newest first
}

export function transactionsForMonth(state, key) {
  return state.transactions
    .filter((t) => monthKey(t.date) === key)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function monthTotals(state, key) {
  let income = 0;
  let spending = 0;
  for (const t of state.transactions) {
    if (monthKey(t.date) !== key) continue;
    if (t.kind === 'income') income += t.amount;
    else spending += t.amount;
  }
  return { income: round2(income), spending: round2(spending), saved: round2(income - spending) };
}

export function spendingByCategory(state, key) {
  const totals = {};
  for (const t of state.transactions) {
    if (t.kind !== 'expense' || monthKey(t.date) !== key) continue;
    totals[t.category] = round2((totals[t.category] ?? 0) + t.amount);
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function budgetStatus(state, key) {
  const spent = spendingByCategory(state, key);
  const spentMap = Object.fromEntries(spent.map((s) => [s.category, s.amount]));
  return Object.entries(state.budgets)
    .map(([category, limit]) => {
      const used = spentMap[category] ?? 0;
      return {
        category,
        limit,
        used,
        remaining: round2(limit - used),
        pct: limit > 0 ? Math.round((used / limit) * 100) : 0,
        over: used > limit,
      };
    })
    .sort((a, b) => b.used - a.used);
}

export function goalProgress(goal) {
  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
  return { pct, remaining: round2(Math.max(0, goal.target - goal.saved)) };
}

export function billsSummary(bills) {
  const unpaid = bills.filter((b) => !b.paid);
  const total = unpaid.reduce((sum, b) => sum + b.amount, 0);
  return { unpaidCount: unpaid.length, unpaidTotal: round2(total), totalCount: bills.length };
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function newId(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}

export function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
