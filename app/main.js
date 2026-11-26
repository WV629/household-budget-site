// Hearth entry point: hash routing, the month switcher in the header, and
// the demo-data reset. The site is plain static files; state lives in
// localStorage (see store.js) and every view re-renders from it.
import { getState, setMonth, stepMonth, monthName, resetDemo } from "./store.js";
import { renderRoute, closeModal } from "./views.js";

function routeFromHash() {
  const hash = location.hash.replace(/^#\/?/, "").split("/")[0];
  const known = ["dashboard", "transactions", "budgets", "goals", "bills", "reports"];
  if (hash === "" || hash === "dashboard") return "dashboard";
  return known.includes(hash) ? hash : "dashboard";
}

function render() {
  renderRoute(routeFromHash());
  const prev = document.getElementById("month-prev");
  const next = document.getElementById("month-next");
  const label = document.getElementById("month-label");
  const months = ["2026-08", "2026-09", "2026-10", "2026-11"];
  const i = months.indexOf(getState().month);
  label.textContent = monthName(getState().month);
  prev.disabled = i <= 0;
  next.disabled = i >= months.length - 1;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
window.addEventListener("hearth:rerender", render);

document.getElementById("month-prev").addEventListener("click", () => { if (stepMonth(-1)) render(); });
document.getElementById("month-next").addEventListener("click", () => { if (stepMonth(1)) render(); });
document.getElementById("reset-demo").addEventListener("click", () => {
  if (confirm("Reset Hearth to the demo household? Your edits will be replaced by the original demo data.")) {
    resetDemo();
    setMonth("2026-11");
    render();
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

render();
