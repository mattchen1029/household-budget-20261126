// Hearth Budget — router and interaction.
//
// Hash routes: #/dashboard, #/transactions, #/budgets, #/goals, #/bills.
// One delegated click handler and one submit handler cover every control
// on the site, so a view that is re-rendered never loses its wiring.
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { loadState, money, monthsInData, newId, resetState, round2, saveState } from './data.js';
import { budgetsView, dashboardView, goalsView, billsView, notFoundView, transactionsView } from './views.js';

const app = document.getElementById('app');
const nav = document.getElementById('main-nav');

let state = loadState();

// UI state that is not persisted: the month on screen, the category filter
// and the transaction being edited.
const ui = {
  month: monthsInData(state)[0] ?? '2026-11',
  categoryFilter: 'all',
  editingId: null,
};

const ROUTES = {
  '/dashboard': dashboardView,
  '/transactions': transactionsView,
  '/budgets': budgetsView,
  '/goals': goalsView,
  '/bills': billsView,
};

function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/dashboard';
  return ROUTES[hash] ? hash : '/missing';
}

function render() {
  window.__shotReady = false;
  const route = currentRoute();
  const view = ROUTES[route] ?? notFoundView;
  document.title = `${route === '/missing' ? 'Not found' : route.slice(1, 2).toUpperCase() + route.slice(2)} | Hearth Budget`;
  app.innerHTML = view(state, ui);
  for (const link of nav.querySelectorAll('a')) {
    link.classList.toggle('active', link.getAttribute('href') === '#' + route);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function persistAndRender() {
  saveState(state);
  render();
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function validAmount(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? round2(n) : null;
}

// ---- Transaction form: add, or save an edit when an id is present. ----
function submitTransaction(form) {
  const v = formValues(form);
  const amount = validAmount(v.amount);
  const note = String(v.note ?? '').trim();
  const date = String(v.date ?? '');
  const noteEl = document.getElementById('txn-note');
  if (!amount || !note || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    if (noteEl) noteEl.textContent = 'Please fill in a date, a note and an amount over $0.';
    return;
  }
  const category = String(v.category);
  const kind = v.kind === 'income' ? 'income' : 'expense';
  if (v.id) {
    const t = state.transactions.find((x) => x.id === v.id);
    if (t) Object.assign(t, { date, kind, category, note, amount });
    ui.editingId = null;
  } else {
    state.transactions.push({ id: newId('t'), date, kind, category, note, amount });
  }
  // Follow the transaction to its month, so an edit that moves a
  // transaction to another month does not make it vanish from the view.
  ui.month = date.slice(0, 7);
  persistAndRender();
}

function submitBudget(form) {
  const v = formValues(form);
  const limit = Number(v.limit);
  if (!Number.isFinite(limit) || limit < 0) return;
  state.budgets[String(v.category)] = round2(limit);
  persistAndRender();
}

function submitGoalFunds(form) {
  const v = formValues(form);
  const amount = validAmount(v.amount);
  const goal = state.goals.find((g) => g.id === v.id);
  if (!amount || !goal) return;
  goal.saved = round2(goal.saved + amount);
  persistAndRender();
}

function submitNewGoal(form) {
  const v = formValues(form);
  const target = Number(v.target);
  const saved = Math.max(0, Number(v.saved) || 0);
  const name = String(v.name ?? '').trim();
  if (!name || !Number.isFinite(target) || target <= 0) return;
  state.goals.push({ id: newId('g'), name, target: round2(target), saved: round2(saved), note: 'Added by the household.' });
  persistAndRender();
}

function submitNewBill(form) {
  const v = formValues(form);
  const amount = validAmount(v.amount);
  const dueDay = Math.min(28, Math.max(1, Math.floor(Number(v.dueDay)) || 1));
  const name = String(v.name ?? '').trim();
  if (!amount || !name) return;
  state.bills.push({ id: newId('b'), name, amount, dueDay, paid: false });
  persistAndRender();
}

const SUBMITS = {
  txn: submitTransaction,
  budget: submitBudget,
  'goal-funds': submitGoalFunds,
  'goal-new': submitNewGoal,
  'bill-new': submitNewBill,
};

document.addEventListener('submit', (event) => {
  const form = event.target;
  const handler = SUBMITS[form.dataset.form];
  if (!handler) return;
  event.preventDefault();
  handler(form);
});

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'delete-txn') {
    state.transactions = state.transactions.filter((t) => t.id !== el.dataset.id);
    if (ui.editingId === el.dataset.id) ui.editingId = null;
    persistAndRender();
  } else if (action === 'edit-txn') {
    ui.editingId = el.dataset.id;
    render();
    document.getElementById('txn-form')?.scrollIntoView({ block: 'start' });
  } else if (action === 'cancel-edit') {
    ui.editingId = null;
    render();
  } else if (action === 'toggle-bill') {
    const bill = state.bills.find((b) => b.id === el.dataset.id);
    if (bill) bill.paid = !bill.paid;
    persistAndRender();
  } else if (action === 'reset-example') {
    if (window.confirm('Reset everything back to the Alvarez family example data? Your edits will be lost.')) {
      state = resetState();
      ui.month = monthsInData(state)[0] ?? '2026-11';
      ui.editingId = null;
      ui.categoryFilter = 'all';
      persistAndRender();
    }
  }
});

document.addEventListener('change', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  if (el.dataset.action === 'change-month') {
    ui.month = el.value;
    render();
  } else if (el.dataset.action === 'filter-category') {
    ui.categoryFilter = el.value;
    render();
  }
});

window.addEventListener('hashchange', () => {
  ui.editingId = null;
  render();
});

render();
