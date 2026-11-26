// Hearth views: every page of the site, rendered from the store, plus the
// forms that add, edit and delete things. All controls work and persist.
import { CATEGORIES, HOUSEHOLD } from "./data.js";
import {
  getState, MONTHS, CURRENT_MONTH, catById, monthName, shortMonth, fmt,
  fmtDate, monthTxns, monthSummary, budgetFor, budgetTotal,
  billStatus, addTransaction, updateTransaction, deleteTransaction,
  setBudget, toggleBillPaid, addBill, deleteBill, addGoalFunds, addGoal, deleteGoal,
} from "./store.js";
import { drawDonut, drawBars, drawLine } from "./charts.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

let txFilter = { q: "", cat: "all", kind: "all" };

export function openModal(html) {
  document.getElementById("modal-root").innerHTML =
    `<div class="modal-back" id="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  document.getElementById("modal-back").addEventListener("click", (e) => {
    if (e.target.id === "modal-back") closeModal();
  });
}
export function closeModal() { document.getElementById("modal-root").innerHTML = ""; }

function txnRow(t, withDate) {
  const cat = catById(t.category);
  const sign = t.kind === "in" ? "+" : "−";
  const cls = t.kind === "in" ? "pos" : "neg";
  return `<tr>
    ${withDate ? `<td class="num">${fmtDate(t.date)}</td>` : ""}
    <td><span class="cat-dot" style="background:${cat.color}"></span>${esc(t.description)}</td>
    <td class="hide-phone">${esc(cat.name)}</td>
    <td class="amount num ${cls}">${sign}${fmt(t.amount)}</td>
    <td class="row-actions">
      <button type="button" class="icon-btn" data-edit-txn="${t.id}">Edit</button>
      <button type="button" class="icon-btn del" data-del-txn="${t.id}">Delete</button>
    </td>
  </tr>`;
}

function txnForm(t) {
  const isEdit = !!t;
  const d = t || { date: getState().month + "-26", kind: "out", category: "groceries", description: "", amount: "" };
  const catOpts = CATEGORIES.filter((c) => c.id !== "income")
    .map((c) => `<option value="${c.id}" ${d.category === c.id ? "selected" : ""}>${c.name}</option>`).join("");
  return `<h2>${isEdit ? "Edit transaction" : "Add a transaction"}</h2>
  <form id="txn-form" data-id="${t ? t.id : ""}">
    <div class="form-row">
      <div class="field"><label for="f-desc">Description</label>
        <input id="f-desc" name="description" required maxlength="80" value="${esc(d.description)}" placeholder="e.g. GreenLeaf Market"></div>
      <div class="field"><label for="f-amount">Amount ($)</label>
        <input id="f-amount" name="amount" type="number" min="0.01" step="0.01" required value="${d.amount}"></div>
    </div>
    <div class="form-row">
      <div class="field"><label for="f-date">Date</label>
        <input id="f-date" name="date" type="date" required value="${d.date}"></div>
      <div class="field"><label for="f-kind">Type</label>
        <select id="f-kind" name="kind">
          <option value="out" ${d.kind === "out" ? "selected" : ""}>Spending</option>
          <option value="in" ${d.kind === "in" ? "selected" : ""}>Income</option>
        </select></div>
    </div>
    <div class="field"><label for="f-cat">Category</label>
      <select id="f-cat" name="category">${catOpts}</select></div>
    <div class="form-actions">
      <button type="button" class="btn ghost" data-close>Cancel</button>
      <button type="submit" class="btn">${isEdit ? "Save changes" : "Add transaction"}</button>
    </div>
  </form>`;
}

function bindTxnForm() {
  const form = document.getElementById("txn-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const patch = {
      description: String(data.get("description")).trim(),
      amount: Math.round(Number(data.get("amount")) * 100) / 100,
      date: String(data.get("date")),
      kind: String(data.get("kind")),
      category: String(data.get("category")),
    };
    if (!patch.description || !(patch.amount > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(patch.date)) return;
    if (patch.kind === "in") patch.category = "income";
    const id = form.dataset.id;
    if (id) updateTransaction(id, patch); else addTransaction(patch);
    closeModal();
    window.dispatchEvent(new Event("hearth:rerender"));
  });
  document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
}

function bindTxnRowButtons(root) {
  root.querySelectorAll("[data-edit-txn]").forEach((b) => b.addEventListener("click", () => {
    const t = getState().transactions.find((x) => x.id === b.dataset.editTxn);
    if (!t) return;
    openModal(txnForm(t));
    bindTxnForm();
  }));
  root.querySelectorAll("[data-del-txn]").forEach((b) => b.addEventListener("click", () => {
    if (confirm("Delete this transaction?")) {
      deleteTransaction(b.dataset.delTxn);
      window.dispatchEvent(new Event("hearth:rerender"));
    }
  }));
}

// ---------- Dashboard ----------
function renderDashboard() {
  const s = getState();
  const m = s.month;
  const sum = monthSummary(m);
  const prev = MONTHS[MONTHS.indexOf(m) - 1];
  const prevSum = prev ? monthSummary(prev) : null;
  const rate = sum.income > 0 ? Math.round(((sum.income - sum.spending) / sum.income) * 100) : 0;
  const budgets = budgetFor(m);
  const spendCats = Object.entries(sum.byCat)
    .map(([id, v]) => ({ ...catById(id), value: v }))
    .sort((a, b) => b.value - a.value);
  const over = spendCats.filter((c) => budgets[c.id] && c.value > budgets[c.id]);
  const upcoming = s.bills.map((b) => ({ b, st: billStatus(b) })).filter((x) => !x.st.paid).sort((a, b) => a.st.days - b.st.days);
  const recent = [...monthTxns(m)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const bars = MONTHS.map((mo) => {
    const x = monthSummary(mo);
    return { label: shortMonth(mo), income: x.income, spending: x.spending };
  });
  const delta = (now, was) => {
    if (was == null || was === 0) return "";
    const d = Math.round(((now - was) / was) * 100);
    return `<span class="${d <= 0 ? "delta-up" : "delta-down"}">${d > 0 ? "+" : ""}${d}% vs ${shortMonth(prev)}</span>`;
  };
  return `
  <div class="page-head">
    <div><h1>Good evening, Hartleys.</h1>
    <p>${monthName(m)} at a glance &mdash; ${HOUSEHOLD.members}. Income, spending, budgets, bills and goals, all in one place.</p></div>
    <button type="button" class="btn" data-add-txn>+ Add transaction</button>
  </div>
  <div class="grid kpis" style="margin-bottom:16px">
    <div class="card"><div class="kpi-label">Income</div><div class="big num">${fmt(sum.income)}</div>
      <div class="kpi-sub">${prevSum ? delta(sum.income, prevSum.income) : "First month on file"}</div></div>
    <div class="card"><div class="kpi-label">Spending</div><div class="big num">${fmt(sum.spending)}</div>
      <div class="kpi-sub">${prevSum ? delta(sum.spending, prevSum.spending) : "&nbsp;"}</div></div>
    <div class="card"><div class="kpi-label">Saved this month</div><div class="big num">${fmt(sum.saved)}</div>
      <div class="kpi-sub">${sum.saved > 0 ? "Emergency fund + " + fmt(sum.saved) : "Nothing set aside yet"}</div></div>
    <div class="card"><div class="kpi-label">Savings rate</div><div class="big num">${rate}%</div>
      <div class="kpi-sub">${rate >= 20 ? "Above the 20% target — nice work." : "Target is 20% of income."}</div></div>
  </div>
  ${over.length ? `<div class="insight"><strong>Heads up:</strong> ${over.map((c) => `${c.name} is ${fmt(c.value - budgets[c.id])} over its ${fmt(budgets[c.id])} budget`).join("; ")} this month.</div>` : ""}
  <div class="grid two" style="margin-bottom:16px">
    <div class="card">
      <h2>Where the money went <a class="more" href="#/budgets">All budgets &rsaquo;</a></h2>
      <div class="donut-wrap">
        <canvas class="chart" id="donut" width="210" height="210" aria-label="Spending by category chart"></canvas>
        <ul class="donut-legend">
          ${spendCats.slice(0, 7).map((c) => `<li><span><span class="cat-dot" style="background:${c.color}"></span>${esc(c.name)}</span><b class="num">${fmt(c.value)}</b></li>`).join("")}
        </ul>
      </div>
    </div>
    <div class="card">
      <h2>Income vs spending <a class="more" href="#/reports">Reports &rsaquo;</a></h2>
      <canvas class="chart" id="bars" aria-label="Income versus spending by month"></canvas>
      <p class="small muted" style="margin-top:10px">Four months on file. November is the current month, through the 26th.</p>
    </div>
  </div>
  <div class="grid two" style="margin-bottom:16px">
    <div class="card">
      <h2>Budgets this month <a class="more" href="#/budgets">Manage &rsaquo;</a></h2>
      ${spendCats.slice(0, 5).map((c) => {
        const b = budgets[c.id] || 0;
        const p = pct(c.value, b);
        return `<div class="budget-row"><div class="budget-top"><b>${esc(c.name)}</b><span class="num">${fmt(c.value)} of ${fmt(b)}</span></div>
        <div class="bar"><i class="${p > 100 ? "over" : p > 85 ? "warn" : ""}" style="width:${Math.min(p, 100)}%"></i></div>
        <div class="budget-meta"><span>${p}% used</span><span>${b - c.value >= 0 ? fmt(b - c.value) + " left" : fmt(c.value - b) + " over"}</span></div></div>`;
      }).join("")}
    </div>
    <div class="card">
      <h2>Bills coming up <a class="more" href="#/bills">All bills &rsaquo;</a></h2>
      ${upcoming.length ? upcoming.slice(0, 5).map(({ b, st }) => `
        <div class="bill-line"><span><strong>${esc(b.name)}</strong><br><span class="muted small">Due ${st.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${st.days === 0 ? " — today" : st.days > 0 ? ` — in ${st.days} day${st.days === 1 ? "" : "s"}` : ` — ${-st.days} day${st.days === -1 ? "" : "s"} overdue`}</span></span>
        <span class="num"><strong>${fmt(b.amount)}</strong></span></div>`).join("")
        : `<p class="empty">Every bill this month is paid. 🎉</p>`}
      <h2 style="margin-top:18px">Savings goals <a class="more" href="#/goals">All goals &rsaquo;</a></h2>
      ${s.goals.slice(0, 3).map((g) => {
        const p = pct(g.saved, g.target);
        return `<div class="budget-row"><div class="budget-top"><b>${esc(g.name)}</b><span class="num">${fmt(g.saved)} / ${fmt(g.target)}</span></div>
        <div class="bar"><i style="width:${p}%"></i></div><div class="budget-meta"><span>${p}% funded</span><span>${fmt(g.target - g.saved)} to go</span></div></div>`;
      }).join("")}
    </div>
  </div>
  <div class="card">
    <h2>Recent transactions <a class="more" href="#/transactions">See all ${sum.count} &rsaquo;</a></h2>
    <table><thead><tr><th>Date</th><th>Description</th><th class="hide-phone">Category</th><th class="amount">Amount</th><th></th></tr></thead>
    <tbody>${recent.map((t) => txnRow(t, true)).join("")}</tbody></table>
  </div>`;
}

function bindDashboard(root) {
  const sum = monthSummary(getState().month);
  const slices = Object.entries(sum.byCat)
    .map(([id, v]) => ({ label: catById(id).name, value: v, color: catById(id).color }))
    .sort((a, b) => b.value - a.value);
  const donut = root.querySelector("#donut");
  if (donut) drawDonut(donut, slices);
  const bars = root.querySelector("#bars");
  if (bars) drawBars(bars, MONTHS.map((mo) => {
    const x = monthSummary(mo);
    return { label: shortMonth(mo), income: x.income, spending: x.spending };
  }));
  root.querySelectorAll("[data-add-txn]").forEach((b) => b.addEventListener("click", () => { openModal(txnForm(null)); bindTxnForm(); }));
  bindTxnRowButtons(root);
}

// ---------- Transactions ----------
function renderTransactions() {
  const s = getState();
  let list = [...monthTxns(s.month)].sort((a, b) => b.date.localeCompare(a.date));
  const q = txFilter.q.trim().toLowerCase();
  if (q) list = list.filter((t) => t.description.toLowerCase().includes(q) || catById(t.category).name.toLowerCase().includes(q));
  if (txFilter.cat !== "all") list = list.filter((t) => t.category === txFilter.cat);
  if (txFilter.kind !== "all") list = list.filter((t) => t.kind === txFilter.kind);
  const catOpts = `<option value="all">All categories</option>` + CATEGORIES.filter((c) => c.id !== "income")
    .map((c) => `<option value="${c.id}" ${txFilter.cat === c.id ? "selected" : ""}>${c.name}</option>`).join("");
  const inTotal = list.filter((t) => t.kind === "in").reduce((a, t) => a + t.amount, 0);
  const outTotal = list.filter((t) => t.kind === "out").reduce((a, t) => a + t.amount, 0);
  return `
  <div class="page-head">
    <div><h1>Transactions</h1><p>Every dollar in and out for ${monthName(s.month)} — ${list.length} shown. Search, filter, edit or delete any of them.</p></div>
    <button type="button" class="btn" data-add-txn>+ Add transaction</button>
  </div>
  <div class="card">
    <div class="toolbar">
      <input type="search" id="tx-search" placeholder="Search descriptions…" value="${esc(txFilter.q)}" aria-label="Search transactions">
      <select id="tx-cat" aria-label="Filter by category">${catOpts}</select>
      <div class="chip-row" role="group" aria-label="Filter by type">
        <button type="button" class="chip ${txFilter.kind === "all" ? "active" : ""}" data-kind="all">All</button>
        <button type="button" class="chip ${txFilter.kind === "out" ? "active" : ""}" data-kind="out">Spending</button>
        <button type="button" class="chip ${txFilter.kind === "in" ? "active" : ""}" data-kind="in">Income</button>
      </div>
    </div>
    <p class="small muted">Showing <strong class="num">${list.length}</strong> transactions · Income <strong class="pos num">${fmt(inTotal)}</strong> · Out <strong class="neg num">${fmt(outTotal)}</strong></p>
    ${list.length ? `<table><thead><tr><th>Date</th><th>Description</th><th class="hide-phone">Category</th><th class="amount">Amount</th><th></th></tr></thead>
    <tbody>${list.map((t) => txnRow(t, true)).join("")}</tbody></table>`
      : `<p class="empty">Nothing matches those filters. Try clearing the search.</p>`}
  </div>`;
}

function bindTransactions(root) {
  const search = root.querySelector("#tx-search");
  if (search) search.addEventListener("input", () => { txFilter.q = search.value; rerenderSoft(); });
  const cat = root.querySelector("#tx-cat");
  if (cat) cat.addEventListener("change", () => { txFilter.cat = cat.value; window.dispatchEvent(new Event("hearth:rerender")); });
  root.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => {
    txFilter.kind = b.dataset.kind;
    window.dispatchEvent(new Event("hearth:rerender"));
  }));
  root.querySelectorAll("[data-add-txn]").forEach((b) => b.addEventListener("click", () => { openModal(txnForm(null)); bindTxnForm(); }));
  bindTxnRowButtons(root);
  if (search) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
}

function rerenderSoft() {
  // Re-render the list without losing the search box focus.
  const view = document.getElementById("view");
  const pos = view.scrollTop;
  view.innerHTML = renderTransactions();
  bindTransactions(view);
  view.scrollTop = pos;
}

// ---------- Budgets ----------
function renderBudgets() {
  const s = getState();
  const m = s.month;
  const sum = monthSummary(m);
  const budgets = budgetFor(m);
  const totalB = budgetTotal(m);
  const rows = CATEGORIES.filter((c) => budgets[c.id] !== undefined).map((c) => {
    const spent = sum.byCat[c.id] || 0;
    const b = budgets[c.id];
    return { ...c, spent, budget: b, p: pct(spent, b) };
  }).sort((a, b) => b.p - a.p);
  return `
  <div class="page-head">
    <div><h1>Budgets — ${monthName(m)}</h1>
    <p>Monthly spending limits by category. Edit any budget and it applies to this month right away.</p></div>
    <div><strong class="num">${fmt(sum.spending)}</strong> <span class="muted">spent of</span> <strong class="num">${fmt(totalB)}</strong> <span class="muted">budgeted</span></div>
  </div>
  <div class="grid two">
    <div class="card">
      <h2>Category budgets</h2>
      ${rows.map((r) => `
      <div class="budget-row">
        <div class="budget-top"><b><span class="cat-dot" style="background:${r.color}"></span>${esc(r.name)}</b>
          <span class="num">${fmt(r.spent)} / <span class="muted">${fmt(r.budget)}</span></span></div>
        <div class="bar"><i class="${r.p > 100 ? "over" : r.p > 85 ? "warn" : ""}" style="width:${Math.min(r.p, 100)}%"></i></div>
        <div class="budget-meta"><span>${r.p}% used</span>
          <span>${r.budget - r.spent >= 0 ? fmt(r.budget - r.spent) + " left" : fmt(r.spent - r.budget) + " over budget"}</span></div>
        <form class="budget-edit" data-cat="${r.id}" style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <label class="small muted" for="b-${r.id}">Monthly budget $</label>
          <input id="b-${r.id}" name="amount" type="number" min="0" step="1" value="${r.budget}" style="width:110px;padding:6px 9px;border:1px solid #c9c2ae;border-radius:8px">
          <button type="submit" class="btn small ghost">Save</button>
        </form>
      </div>`).join("")}
    </div>
    <div>
      <div class="card" style="margin-bottom:16px">
        <h2>How budgeting works here</h2>
        <p>Each category gets one number for the month. Spending is counted from your transactions, so a budget
        only moves when real money moves. Housing is the mortgage plus nothing else; groceries is the weekly shop
        plus the farmers market.</p>
        <p class="small muted">A bar turns amber past 85% and red when you go over — a nudge, not a scolding.
        Unused money rolls into savings at month end.</p>
      </div>
      <div class="card">
        <h2>Biggest categories</h2>
        ${rows.slice(0, 4).map((r) => `<div class="bill-line"><span><span class="cat-dot" style="background:${r.color}"></span>${esc(r.name)}</span><b class="num">${fmt(r.spent)}</b></div>`).join("")}
        <p class="small muted" style="margin-top:12px">Housing is ${pct(sum.byCat.housing || 0, sum.spending)}% of this month's spending — the fixed costs leave about ${fmt(sum.income - sum.spending - sum.saved)} after everything is paid.</p>
      </div>
    </div>
  </div>`;
}

function bindBudgets(root) {
  root.querySelectorAll(".budget-edit").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = Number(new FormData(f).get("amount"));
    if (!(amount >= 0)) return;
    setBudget(getState().month, f.dataset.cat, amount);
    window.dispatchEvent(new Event("hearth:rerender"));
  }));
}

// ---------- Goals ----------
function renderGoals() {
  const s = getState();
  const totalSaved = s.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = s.goals.reduce((a, g) => a + g.target, 0);
  return `
  <div class="page-head">
    <div><h1>Savings goals</h1><p>${fmt(totalSaved)} saved toward ${fmt(totalTarget)} across ${s.goals.length} goals. Add money whenever you have it — every dollar moves a bar.</p></div>
    <button type="button" class="btn" data-add-goal>+ New goal</button>
  </div>
  <div class="grid three">
    ${s.goals.map((g) => {
      const p = pct(g.saved, g.target);
      return `<div class="card goal-card">
        <div class="goal-top"><h3>${esc(g.name)}</h3><span class="pill">${p}%</span></div>
        <div class="goal-amt num">${fmt(g.saved)} <span class="muted small">of ${fmt(g.target)}</span></div>
        <div class="bar"><i style="width:${p}%"></i></div>
        <p class="small muted">${esc(g.note)}</p>
        <p class="small">Target date: ${new Date(g.deadline + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · ${fmt(g.target - g.saved)} to go</p>
        <div style="display:flex;gap:8px;margin-top:auto">
          <button type="button" class="btn small" data-fund="${g.id}">Add funds</button>
          <button type="button" class="btn small danger" data-del-goal="${g.id}">Delete</button>
        </div>
      </div>`;
    }).join("")}
  </div>
  <div class="callout" style="margin-top:16px">
    <div><h2>Pay yourself first</h2><p>The Hartleys move $400 to the emergency fund on the 15th of every month, payday, before anything optional gets spent. That habit is why the fund is at ${fmt(s.goals[0].saved)}.</p></div>
    <button type="button" class="btn" data-fund="${s.goals[0].id}">Add $100 now</button>
  </div>`;
}

function bindGoals(root) {
  root.querySelectorAll("[data-fund]").forEach((b) => b.addEventListener("click", () => {
    const g = getState().goals.find((x) => x.id === b.dataset.fund);
    if (!g) return;
    const quick = b.textContent.includes("$100");
    openModal(`<h2>Add funds — ${esc(g.name)}</h2>
      <form id="fund-form"><div class="field"><label for="fund-amt">Amount ($)</label>
      <input id="fund-amt" name="amount" type="number" min="1" step="1" required value="${quick ? 100 : 50}"></div>
      <div class="form-actions"><button type="button" class="btn ghost" data-close>Cancel</button>
      <button type="submit" class="btn">Add funds</button></div></form>`);
    document.getElementById("fund-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const amt = Number(new FormData(e.target).get("amount"));
      if (amt > 0) addGoalFunds(g.id, amt);
      closeModal();
      window.dispatchEvent(new Event("hearth:rerender"));
    });
    document.querySelectorAll("[data-close]").forEach((x) => x.addEventListener("click", closeModal));
  }));
  root.querySelectorAll("[data-del-goal]").forEach((b) => b.addEventListener("click", () => {
    if (confirm("Delete this goal? Its saved amount is not a transaction, so nothing else changes.")) {
      deleteGoal(b.dataset.delGoal);
      window.dispatchEvent(new Event("hearth:rerender"));
    }
  }));
  root.querySelectorAll("[data-add-goal]").forEach((b) => b.addEventListener("click", () => {
    openModal(`<h2>New savings goal</h2>
      <form id="goal-form">
        <div class="field"><label for="g-name">Goal name</label><input id="g-name" name="name" required maxlength="60" placeholder="e.g. New bikes for the kids"></div>
        <div class="form-row">
          <div class="field"><label for="g-target">Target ($)</label><input id="g-target" name="target" type="number" min="1" step="1" required></div>
          <div class="field"><label for="g-saved">Already saved ($)</label><input id="g-saved" name="saved" type="number" min="0" step="1" value="0"></div>
        </div>
        <div class="field"><label for="g-date">Target date</label><input id="g-date" name="deadline" type="date" required value="2027-12-31"></div>
        <div class="field"><label for="g-note">Why this goal? (optional)</label><input id="g-note" name="note" maxlength="120" placeholder="What the money is for"></div>
        <div class="form-actions"><button type="button" class="btn ghost" data-close>Cancel</button>
        <button type="submit" class="btn">Create goal</button></div>
      </form>`);
    document.getElementById("goal-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(e.target);
      addGoal({
        name: String(d.get("name")).trim(),
        target: Math.max(1, Number(d.get("target"))),
        saved: Math.max(0, Number(d.get("saved")) || 0),
        deadline: String(d.get("deadline")),
        note: String(d.get("note")).trim() || "A new goal for the household.",
      });
      closeModal();
      window.dispatchEvent(new Event("hearth:rerender"));
    });
    document.querySelectorAll("[data-close]").forEach((x) => x.addEventListener("click", closeModal));
  }));
}

// ---------- Bills ----------
function renderBills() {
  const s = getState();
  const rows = s.bills.map((b) => ({ b, st: billStatus(b) })).sort((a, b) => a.st.due - b.st.due);
  const unpaid = rows.filter((r) => !r.st.paid);
  const unpaidTotal = unpaid.reduce((a, r) => a + r.b.amount, 0);
  const paidTotal = rows.filter((r) => r.st.paid).reduce((a, r) => a + r.b.amount, 0);
  const overdue = rows.filter((r) => r.st.overdue);
  return `
  <div class="page-head">
    <div><h1>Recurring bills</h1><p>Everything that comes out on a schedule. ${unpaid.length} still to pay in November — ${fmt(unpaidTotal)} — and ${fmt(paidTotal)} already paid.</p></div>
    <button type="button" class="btn" data-add-bill>+ Add a bill</button>
  </div>
  ${overdue.length ? `<div class="insight"><strong>Overdue:</strong> ${overdue.map((r) => `${esc(r.b.name)} (${fmt(r.b.amount)}, due ${r.st.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`).join(", ")} — mark it paid once it clears.</div>` : ""}
  <div class="card">
    <table><thead><tr><th>Bill</th><th class="hide-phone">Category</th><th>Due</th><th class="amount">Amount</th><th>Status</th><th></th></tr></thead>
    <tbody>
    ${rows.map(({ b, st }) => `
      <tr>
        <td><strong>${esc(b.name)}</strong><br><span class="small muted">${esc(b.note)}${b.autopay ? " · Autopay on" : ""}</span></td>
        <td class="hide-phone">${esc(catById(b.category).name)}</td>
        <td class="num">${st.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
        <td class="amount num"><strong>${fmt(b.amount)}</strong></td>
        <td>${st.paid ? `<span class="pill paid">Paid</span>` : st.overdue ? `<span class="pill overdue">Overdue ${-st.days}d</span>` : st.dueSoon ? `<span class="pill due">Due in ${st.days}d</span>` : `<span class="pill">Due in ${st.days}d</span>`}</td>
        <td class="row-actions">
          <button type="button" class="icon-btn" data-toggle-bill="${b.id}">${st.paid ? "Mark unpaid" : "Mark paid"}</button>
          <button type="button" class="icon-btn del" data-del-bill="${b.id}">Delete</button>
        </td>
      </tr>`).join("")}
    </tbody></table>
  </div>
  <p class="small muted" style="margin-top:12px">Bills repeat every month on the same day. Marking one paid only affects November — next month starts fresh, as it should.</p>`;
}

function bindBills(root) {
  root.querySelectorAll("[data-toggle-bill]").forEach((b) => b.addEventListener("click", () => {
    toggleBillPaid(b.dataset.toggleBill);
    window.dispatchEvent(new Event("hearth:rerender"));
  }));
  root.querySelectorAll("[data-del-bill]").forEach((b) => b.addEventListener("click", () => {
    if (confirm("Delete this bill?")) {
      deleteBill(b.dataset.delBill);
      window.dispatchEvent(new Event("hearth:rerender"));
    }
  }));
  root.querySelectorAll("[data-add-bill]").forEach((b) => b.addEventListener("click", () => {
    const catOpts = CATEGORIES.filter((c) => c.id !== "income" && c.id !== "savings")
      .map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
    openModal(`<h2>Add a recurring bill</h2>
      <form id="bill-form">
        <div class="field"><label for="bb-name">Bill name</label><input id="bb-name" name="name" required maxlength="60" placeholder="e.g. Water bill"></div>
        <div class="form-row">
          <div class="field"><label for="bb-amt">Amount ($)</label><input id="bb-amt" name="amount" type="number" min="0.01" step="0.01" required></div>
          <div class="field"><label for="bb-day">Due day of month</label><input id="bb-day" name="dueDay" type="number" min="1" max="28" required value="1"></div>
        </div>
        <div class="field"><label for="bb-cat">Category</label><select id="bb-cat" name="category">${catOpts}</select></div>
        <div class="field"><label for="bb-note">Note (optional)</label><input id="bb-note" name="note" maxlength="120"></div>
        <div class="form-actions"><button type="button" class="btn ghost" data-close>Cancel</button>
        <button type="submit" class="btn">Add bill</button></div>
      </form>`);
    document.getElementById("bill-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(e.target);
      addBill({
        name: String(d.get("name")).trim(),
        amount: Math.round(Number(d.get("amount")) * 100) / 100,
        dueDay: Math.min(28, Math.max(1, Number(d.get("dueDay")))),
        category: String(d.get("category")),
        autopay: false,
        note: String(d.get("note")).trim() || "Monthly bill",
      });
      closeModal();
      window.dispatchEvent(new Event("hearth:rerender"));
    });
    document.querySelectorAll("[data-close]").forEach((x) => x.addEventListener("click", closeModal));
  }));
}

// ---------- Reports ----------
function renderReports() {
  const s = getState();
  const sums = MONTHS.map((mo) => ({ month: mo, ...monthSummary(mo) }));
  const totals = sums.reduce((a, x) => ({ income: a.income + x.income, spending: a.spending + x.spending, saved: a.saved + x.saved }), { income: 0, spending: 0, saved: 0 });
  const catTotals = {};
  for (const x of sums) for (const [id, v] of Object.entries(x.byCat)) catTotals[id] = (catTotals[id] || 0) + v;
  const catRows = Object.entries(catTotals)
    .map(([id, v]) => ({ ...catById(id), total: v, avg: v / MONTHS.length }))
    .sort((a, b) => b.total - a.total);
  const allTx = [...s.transactions].filter((t) => t.kind === "out" && t.category !== "savings")
    .sort((a, b) => b.amount - a.amount).slice(0, 5);
  const rates = sums.map((x) => ({ label: shortMonth(x.month), value: x.income > 0 ? Math.round(((x.income - x.spending) / x.income) * 100) : 0 }));
  const avgRate = Math.round(rates.reduce((a, r) => a + r.value, 0) / rates.length);
  const topCat = catRows[0];
  const nov = sums[sums.length - 1];
  const diningAvg = (catTotals.dining || 0) / MONTHS.length;
  return `
  <div class="page-head">
    <div><h1>Reports</h1><p>Four months of the Hartley household, August to November 2026. Averages, trends and the handful of numbers that actually change decisions.</p></div>
  </div>
  <div class="grid kpis" style="margin-bottom:16px">
    <div class="card"><div class="kpi-label">Avg monthly income</div><div class="big num">${fmt(totals.income / 4)}</div><div class="kpi-sub">Across 4 months</div></div>
    <div class="card"><div class="kpi-label">Avg monthly spending</div><div class="big num">${fmt(totals.spending / 4)}</div><div class="kpi-sub">November so far: ${fmt(nov.spending)} (through the 26th)</div></div>
    <div class="card"><div class="kpi-label">Avg savings rate</div><div class="big num">${avgRate}%</div><div class="kpi-sub">Target 20%</div></div>
    <div class="card"><div class="kpi-label">Total saved</div><div class="big num">${fmt(totals.saved)}</div><div class="kpi-sub">Emergency fund transfers</div></div>
  </div>
  <div class="grid two" style="margin-bottom:16px">
    <div class="card"><h2>Income vs spending, by month</h2><canvas class="chart" id="rep-bars" aria-label="Income versus spending by month"></canvas></div>
    <div class="card"><h2>Savings rate trend</h2><canvas class="chart" id="rep-line" aria-label="Savings rate by month"></canvas>
      <p class="small muted" style="margin-top:10px">Savings rate = (income − spending) ÷ income. November is still open, through the 26th.</p></div>
  </div>
  <div class="grid two">
    <div class="card">
      <h2>Spending by category — 4 months</h2>
      <table><thead><tr><th>Category</th><th class="amount">Total</th><th class="amount">Monthly avg</th><th class="amount">Share</th></tr></thead>
      <tbody>${catRows.map((c) => `<tr><td><span class="cat-dot" style="background:${c.color}"></span>${esc(c.name)}</td>
        <td class="amount num">${fmt(c.total)}</td><td class="amount num">${fmt(c.avg)}</td>
        <td class="amount num">${pct(c.total, totals.spending)}%</td></tr>`).join("")}</tbody></table>
    </div>
    <div>
      <div class="card" style="margin-bottom:16px">
        <h2>Biggest single expenses</h2>
        ${allTx.map((t) => `<div class="bill-line"><span>${esc(t.description)}<br><span class="muted small">${fmtDate(t.date)} · ${esc(catById(t.category).name)}</span></span><b class="num">${fmt(t.amount)}</b></div>`).join("")}
      </div>
      <div class="card">
        <h2>What the numbers say</h2>
        <div class="insight good"><strong>${esc(topCat.name)} is the biggest bucket</strong> at ${fmt(topCat.total)} over four months (${pct(topCat.total, totals.spending)}% of spending) — and it is the fixed mortgage, so the lever is everywhere else.</div>
        <div class="insight"><strong>Dining out averages ${fmt(diningAvg)} a month.</strong> One fewer takeout night a week would free about $60 a month — half a car payment.</div>
        <div class="insight good"><strong>The savings rate held at ${avgRate}% on average.</strong> The $400 monthly emergency-fund transfer has never been missed in four months.</div>
      </div>
    </div>
  </div>`;
}

function bindReports(root) {
  const bars = root.querySelector("#rep-bars");
  if (bars) drawBars(bars, MONTHS.map((mo) => {
    const x = monthSummary(mo);
    return { label: shortMonth(mo), income: x.income, spending: x.spending };
  }));
  const line = root.querySelector("#rep-line");
  if (line) {
    const pts = MONTHS.map((mo) => {
      const x = monthSummary(mo);
      return { label: shortMonth(mo), value: x.income > 0 ? Math.round(((x.income - x.spending) / x.income) * 100) : 0 };
    });
    drawLine(line, pts, "#2e6f5e", (v) => Math.round(v) + "%");
  }
}

// ---------- dispatch ----------
export const VIEWS = {
  dashboard: { render: renderDashboard, bind: bindDashboard, nav: "dashboard" },
  transactions: { render: renderTransactions, bind: bindTransactions, nav: "transactions" },
  budgets: { render: renderBudgets, bind: bindBudgets, nav: "budgets" },
  goals: { render: renderGoals, bind: bindGoals, nav: "goals" },
  bills: { render: renderBills, bind: bindBills, nav: "bills" },
  reports: { render: renderReports, bind: bindReports, nav: "reports" },
};

export function renderRoute(route) {
  const view = VIEWS[route] || VIEWS.dashboard;
  const root = document.getElementById("view");
  root.innerHTML = view.render();
  view.bind(root);
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === view.nav));
}
