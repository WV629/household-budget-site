// Hearth store: one household's state, saved to localStorage, with the
// monthly aggregates every view needs. Demo data seeds on first visit.
import { seedState, CATEGORIES } from "./data.js";

const KEY = "hearth-budget-v1";
export const MONTHS = ["2026-08", "2026-09", "2026-10", "2026-11"];
export const CURRENT_MONTH = "2026-11";

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch { /* corrupted storage: reseed below */ }
  const fresh = seedState();
  save(fresh);
  return fresh;
}

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full or blocked */ }
}

export function getState() { return state; }
export function resetDemo() {
  state = seedState();
  save(state);
  return state;
}

export const catById = (id) => CATEGORIES.find((c) => c.id === id) || { id, name: id, color: "#6b7f8f" };
export const monthName = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};
export const shortMonth = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-US", { month: "short" });
};
export const fmt = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtSigned = (n) => (n < 0 ? "−" : "+") + fmt(n);
export const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function setMonth(m) {
  if (!MONTHS.includes(m)) return false;
  state.month = m;
  save(state);
  return true;
}
export function stepMonth(dir) {
  const i = MONTHS.indexOf(state.month) + dir;
  if (i < 0 || i >= MONTHS.length) return false;
  return setMonth(MONTHS[i]);
}

export function monthTxns(month) {
  return state.transactions.filter((t) => t.date.startsWith(month));
}

// Income, spending (excludes savings transfers), and saved for a month.
export function monthSummary(month) {
  const tx = monthTxns(month);
  let income = 0, spending = 0, saved = 0;
  const byCat = {};
  for (const t of tx) {
    if (t.kind === "in") income += t.amount;
    else if (t.category === "savings") saved += t.amount;
    else {
      spending += t.amount;
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    }
  }
  return { income, spending, saved, net: income - spending - saved, byCat, count: tx.length };
}

export function budgetFor(month) { return state.budgets[month] || {}; }
export function budgetTotal(month) {
  return Object.values(budgetFor(month)).reduce((a, b) => a + b, 0);
}

// Bills for the current month: due date, paid flag, days until due.
export function billStatus(bill) {
  const paid = !!state.billsPaid[bill.id];
  const [y, m] = CURRENT_MONTH.split("-").map(Number);
  const due = new Date(y, m - 1, bill.dueDay);
  const today = new Date(2026, 10, 26); // demo "today": Nov 26, 2026
  const days = Math.round((due - today) / 86400000);
  return { paid, due, days, overdue: !paid && days < 0, dueSoon: !paid && days >= 0 && days <= 3 };
}

export function addTransaction(t) {
  const id = "t" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  state.transactions.push({ id, ...t });
  save(state);
  return id;
}
export function updateTransaction(id, patch) {
  const t = state.transactions.find((x) => x.id === id);
  if (!t) return false;
  Object.assign(t, patch);
  save(state);
  return true;
}
export function deleteTransaction(id) {
  const before = state.transactions.length;
  state.transactions = state.transactions.filter((x) => x.id !== id);
  if (state.transactions.length !== before) { save(state); return true; }
  return false;
}

export function setBudget(month, category, amount) {
  if (!state.budgets[month]) state.budgets[month] = {};
  state.budgets[month][category] = Math.max(0, Math.round(amount));
  save(state);
}
export function toggleBillPaid(id) {
  state.billsPaid[id] = !state.billsPaid[id];
  save(state);
  return state.billsPaid[id];
}
export function addBill(b) {
  const id = "b" + Date.now().toString(36);
  state.bills.push({ id, ...b });
  state.billsPaid[id] = false;
  save(state);
  return id;
}
export function deleteBill(id) {
  state.bills = state.bills.filter((b) => b.id !== id);
  delete state.billsPaid[id];
  save(state);
}
export function addGoalFunds(id, amount) {
  const g = state.goals.find((x) => x.id === id);
  if (!g) return false;
  g.saved = Math.min(g.target, Math.max(0, g.saved + amount));
  save(state);
  return true;
}
export function addGoal(g) {
  const id = "g" + Date.now().toString(36);
  state.goals.push({ id, ...g });
  save(state);
  return id;
}
export function deleteGoal(id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  save(state);
}
