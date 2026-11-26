// Hearth Budget — views.
//
// Each view is a pure function of (state, ui) that returns an HTML string.
// main.js owns the router and the event handling; nothing here touches
// the DOM or the network.

import {
  CATEGORIES,
  CATEGORY_COLORS,
  INCOME_CATEGORIES,
  billsSummary,
  budgetStatus,
  esc,
  goalProgress,
  money,
  monthLabel,
  monthTotals,
  monthsInData,
  spendingByCategory,
  transactionsForMonth,
} from './data.js';
import { donutChart, incomeSpendingBars } from './charts.js';

export function monthPicker(state, currentMonth) {
  const options = monthsInData(state)
    .map((key) => `<option value="${key}"${key === currentMonth ? ' selected' : ''}>${monthLabel(key)}</option>`)
    .join('');
  return `<label class="month-picker">Month
    <select id="month-select" data-action="change-month">${options}</select>
  </label>`;
}

function statCard(label, value, sub, tone = '') {
  return `<div class="stat ${tone}">
    <span class="stat-label">${label}</span>
    <span class="stat-value">${value}</span>
    <span class="stat-sub">${sub}</span>
  </div>`;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function dashboardView(state, ui) {
  const month = ui.month;
  const totals = monthTotals(state, month);
  const byCategory = spendingByCategory(state, month);
  const budgets = budgetStatus(state, month);
  const over = budgets.filter((b) => b.over);
  const bills = billsSummary(state.bills);
  const topCategory = byCategory[0];
  const history = monthsInData(state)
    .reverse() // oldest first, so the bars read left to right in time
    .map((key) => ({
      key,
      label: monthLabel(key).split(' ')[0],
      ...monthTotals(state, key),
    }));

  const savingsRate = totals.income > 0 ? Math.round((totals.saved / totals.income) * 100) : 0;

  return `
  <section class="page-head">
    <div>
      <h1>Dashboard</h1>
      <p class="lede">How the Alvarez household is doing in ${monthLabel(month)}.</p>
    </div>
    ${monthPicker(state, month)}
  </section>

  <section class="stats">
    ${statCard('Income', money(totals.income), 'money coming in')}
    ${statCard('Spending', money(totals.spending), 'money going out', 'spending')}
    ${statCard('Left over', money(totals.saved), `${savingsRate}% of income saved`, totals.saved >= 0 ? 'good' : 'bad')}
    ${statCard('Bills due', bills.unpaidCount + ' unpaid', money(bills.unpaidTotal) + ' still to pay', bills.unpaidCount ? 'warn' : 'good')}
  </section>

  <section class="grid-2">
    <article class="card">
      <h2>Where the money went</h2>
      <p class="card-sub">Spending by category, ${monthLabel(month)}.</p>
      ${donutChart(byCategory)}
    </article>
    <article class="card">
      <h2>Income vs spending</h2>
      <p class="card-sub">Each month, side by side.</p>
      ${incomeSpendingBars(history)}
    </article>
  </section>

  <section class="grid-2">
    <article class="card">
      <h2>Budgets to watch</h2>
      <p class="card-sub">${over.length ? over.map((b) => b.category).join(', ') + ' over budget this month.' : 'Nothing over budget this month.'}</p>
      <ul class="mini-list">
        ${budgets
          .slice(0, 4)
          .map(
            (b) => `<li><span class="mini-name">${b.category}</span>
              <span class="mini-bar"><span style="width:${Math.min(100, b.pct)}%;background:${b.over ? '#c0392b' : CATEGORY_COLORS[b.category]}"></span></span>
              <span class="mini-num">${money(b.used)} of ${money(b.limit)}</span></li>`,
          )
          .join('')}
      </ul>
      <p><a class="btn" href="#/budgets">See all budgets</a></p>
    </article>
    <article class="card">
      <h2>Savings at a glance</h2>
      <p class="card-sub">Three goals, moving steadily.</p>
      <ul class="mini-list">
        ${state.goals
          .map((g) => {
            const p = goalProgress(g);
            return `<li><span class="mini-name">${esc(g.name)}</span>
              <span class="mini-bar"><span style="width:${p.pct}%;background:#2e6f5e"></span></span>
              <span class="mini-num">${money(g.saved)} of ${money(g.target)}</span></li>`;
          })
          .join('')}
      </ul>
      <p><a class="btn" href="#/goals">See savings goals</a></p>
    </article>
  </section>

  <section class="card">
    <h2>Biggest costs this month</h2>
    <p class="card-sub">${topCategory ? 'Most of the spending is ' + topCategory.category.toLowerCase() + ' — ' + money(topCategory.amount) + ' in ' + monthLabel(month) + '.' : 'No spending yet.'}</p>
    <ul class="mini-list">
      ${byCategory
        .slice(0, 3)
        .map((c) => `<li><span class="mini-name">${c.category}</span><span class="mini-num">${money(c.amount)}</span></li>`)
        .join('')}
    </ul>
    <p><a class="btn" href="#/transactions">See all transactions</a></p>
  </section>`;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

function transactionRow(t) {
  const sign = t.kind === 'income' ? '+' : '−';
  const cls = t.kind === 'income' ? 'amount in' : 'amount out';
  return `<li class="txn">
    <span class="txn-date">${t.date.slice(5)}</span>
    <span class="txn-main"><b>${esc(t.note)}</b><span class="txn-cat" style="--cat:${CATEGORY_COLORS[t.category] ?? '#9a9a92'}">${t.category}</span></span>
    <span class="${cls}">${sign}${money(t.amount)}</span>
    <span class="txn-actions">
      <button type="button" data-action="edit-txn" data-id="${t.id}">Edit</button>
      <button type="button" data-action="delete-txn" data-id="${t.id}">Delete</button>
    </span>
  </li>`;
}

export function transactionsView(state, ui) {
  const month = ui.month;
  const filter = ui.categoryFilter ?? 'all';
  let list = transactionsForMonth(state, month);
  if (filter !== 'all') list = list.filter((t) => t.category === filter);
  const totals = monthTotals(state, month);
  const editing = ui.editingId ? state.transactions.find((t) => t.id === ui.editingId) : null;

  const categoryOptions = ['all', ...CATEGORIES, ...INCOME_CATEGORIES.filter((c) => !CATEGORIES.includes(c))]
    .map((c) => `<option value="${c}"${c === filter ? ' selected' : ''}>${c === 'all' ? 'All categories' : c}</option>`)
    .join('');

  return `
  <section class="page-head">
    <div>
      <h1>Transactions</h1>
      <p class="lede">Every dollar in and out, for ${monthLabel(month)}.</p>
    </div>
    ${monthPicker(state, month)}
  </section>

  <section class="card">
    <h2>${editing ? 'Edit transaction' : 'Add a transaction'}</h2>
    <form id="txn-form" data-form="txn">
      <input type="hidden" name="id" value="${editing ? editing.id : ''}">
      <div class="form-row">
        <label>Date <input type="date" name="date" value="${editing ? editing.date : month + '-26'}" required></label>
        <label>Type
          <select name="kind">
            <option value="expense"${editing && editing.kind === 'expense' ? ' selected' : ''}>Expense</option>
            <option value="income"${editing && editing.kind === 'income' ? ' selected' : ''}>Income</option>
          </select>
        </label>
        <label>Category
          <select name="category">
            ${[...CATEGORIES, ...INCOME_CATEGORIES].map((c) => `<option${editing && editing.category === c ? ' selected' : ''}>${c}</option>`).join('')}
          </select>
        </label>
        <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" value="${editing ? editing.amount : ''}" placeholder="0.00" required></label>
      </div>
      <div class="form-row">
        <label class="grow">Note <input type="text" name="note" maxlength="80" value="${editing ? esc(editing.note) : ''}" placeholder="What was it for?" required></label>
        <button class="btn primary" type="submit">${editing ? 'Save changes' : 'Add transaction'}</button>
        ${editing ? '<button class="btn" type="button" data-action="cancel-edit">Cancel</button>' : ''}
      </div>
      <p class="form-note" id="txn-note"></p>
    </form>
  </section>

  <section class="card">
    <div class="list-head">
      <h2>${list.length} transaction${list.length === 1 ? '' : 's'}</h2>
      <label class="filter">Filter
        <select id="category-filter" data-action="filter-category">${categoryOptions}</select>
      </label>
    </div>
    <p class="card-sub">${monthLabel(month)}: ${money(totals.income)} in, ${money(totals.spending)} out, ${money(totals.saved)} left over.${filter !== 'all' ? ` Showing ${list.length} of ${transactionsForMonth(state, month).length} transactions in ${filter}.` : ''}</p>
    ${list.length ? `<ul class="txn-list">${list.map(transactionRow).join('')}</ul>` : '<p class="empty">Nothing here yet — add a transaction above, or pick another month.</p>'}
  </section>`;
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

export function budgetsView(state, ui) {
  const month = ui.month;
  const budgets = budgetStatus(state, month);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalUsed = budgets.reduce((s, b) => s + b.used, 0);

  return `
  <section class="page-head">
    <div>
      <h1>Monthly budgets</h1>
      <p class="lede">Limits for ${monthLabel(month)} — ${money(totalUsed)} of ${money(totalLimit)} spent so far.</p>
    </div>
    ${monthPicker(state, month)}
  </section>

  <section class="card">
    <h2>How to use budgets</h2>
    <p>Set a monthly limit for each category. The bar fills as you spend; when it passes the limit it turns red and shows how much you are over. Change a limit any time — the bar updates at once.</p>
  </section>

  <ul class="budget-list">
    ${budgets
      .map(
        (b) => `<li class="card budget-row${b.over ? ' over' : ''}">
        <div class="budget-top">
          <h2><span class="swatch" style="background:${CATEGORY_COLORS[b.category]}"></span>${b.category}</h2>
          <span class="budget-nums"><b>${money(b.used)}</b> of ${money(b.limit)}</span>
        </div>
        <div class="bar"><span style="width:${Math.min(100, b.pct)}%;background:${b.over ? '#c0392b' : CATEGORY_COLORS[b.category]}"></span></div>
        <p class="budget-status">${b.over ? `<b class="bad">${money(-b.remaining)} over budget</b> — ${b.pct}% of the limit used.` : `${money(b.remaining)} left — ${b.pct}% of the limit used.`}</p>
        <form class="budget-form" data-form="budget">
          <input type="hidden" name="category" value="${b.category}">
          <label>Monthly limit ($) <input type="number" name="limit" min="0" step="1" value="${b.limit}" required></label>
          <button class="btn" type="submit">Update limit</button>
        </form>
      </li>`,
      )
      .join('')}
  </ul>`;
}

// ---------------------------------------------------------------------------
// Savings goals
// ---------------------------------------------------------------------------

export function goalsView(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);

  return `
  <section class="page-head">
    <div>
      <h1>Savings goals</h1>
      <p class="lede">${money(totalSaved)} saved toward ${money(totalTarget)} of goals.</p>
    </div>
  </section>

  <section class="grid-3">
    ${state.goals
      .map((g) => {
        const p = goalProgress(g);
        return `<article class="card goal">
        <h2>${esc(g.name)}</h2>
        <p class="goal-note">${esc(g.note)}</p>
        <div class="goal-amounts"><span class="goal-saved">${money(g.saved)}</span><span class="muted">of ${money(g.target)}</span></div>
        <div class="bar"><span style="width:${p.pct}%;background:#2e6f5e"></span></div>
        <p class="budget-status">${p.pct}% there — ${p.remaining > 0 ? money(p.remaining) + ' to go' : 'Goal reached!'}</p>
        <form class="goal-form" data-form="goal-funds">
          <input type="hidden" name="id" value="${g.id}">
          <label>Add funds ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
          <button class="btn primary" type="submit">Add funds</button>
        </form>
      </article>`;
      })
      .join('')}
  </section>

  <section class="card">
    <h2>Start a new goal</h2>
    <form id="goal-form" data-form="goal-new">
      <div class="form-row">
        <label class="grow">Goal name <input type="text" name="name" maxlength="60" placeholder="e.g. New bike" required></label>
        <label>Target ($) <input type="number" name="target" min="1" step="1" placeholder="1000" required></label>
        <label>Already saved ($) <input type="number" name="saved" min="0" step="0.01" value="0"></label>
        <button class="btn primary" type="submit">Add goal</button>
      </div>
      <p class="form-note">A goal with no money saved yet is fine — add funds whenever you can.</p>
    </form>
  </section>`;
}

// ---------------------------------------------------------------------------
// Recurring bills
// ---------------------------------------------------------------------------

export function billsView(state) {
  const summary = billsSummary(state.bills);
  const sorted = [...state.bills].sort((a, b) => a.dueDay - b.dueDay);

  return `
  <section class="page-head">
    <div>
      <h1>Recurring bills</h1>
      <p class="lede">${summary.unpaidCount} of ${summary.totalCount} bills still unpaid — ${money(summary.unpaidTotal)} to pay.</p>
    </div>
  </section>

  <section class="card">
    <h2>Every month, on the same day</h2>
    <p>Tap “Mark paid” when a bill is settled, or “Mark unpaid” if it needs paying again. The totals above update at once.</p>
    <ul class="bill-list">
      ${sorted
        .map(
          (b) => `<li class="bill${b.paid ? ' paid' : ''}">
          <span class="bill-day">Day ${b.dueDay}</span>
          <span class="bill-main"><b>${esc(b.name)}</b><span class="muted">${b.paid ? 'Paid' : 'Due this month'}</span></span>
          <span class="bill-amount">${money(b.amount)}</span>
          <button type="button" class="btn${b.paid ? '' : ' primary'}" data-action="toggle-bill" data-id="${b.id}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button>
        </li>`,
        )
        .join('')}
    </ul>
  </section>

  <section class="card">
    <h2>Add a recurring bill</h2>
    <form id="bill-form" data-form="bill-new">
      <div class="form-row">
        <label class="grow">Bill name <input type="text" name="name" maxlength="60" placeholder="e.g. Water bill" required></label>
        <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
        <label>Due day <input type="number" name="dueDay" min="1" max="28" value="1" required></label>
        <button class="btn primary" type="submit">Add bill</button>
      </div>
      <p class="form-note">Due day is the day of the month the bill is normally paid (1–28).</p>
    </form>
  </section>`;
}

export function notFoundView() {
  return `<section class="card"><h1>Page not found</h1>
  <p>That page does not exist. Try the <a href="#/dashboard">dashboard</a>, <a href="#/transactions">transactions</a>, <a href="#/budgets">budgets</a>, <a href="#/goals">savings goals</a> or <a href="#/bills">bills</a>.</p></section>`;
}
