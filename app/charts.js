// Hearth charts: small canvas charts, no libraries. Each draws at the
// canvas's own size with a device-pixel-ratio scale so it stays crisp.
function setup(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 320;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = height + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

// Donut of spending by category. `slices`: [{label, value, color}].
export function drawDonut(canvas, slices) {
  const { ctx, width, height } = setup(canvas, 210);
  const total = slices.reduce((a, s) => a + s.value, 0);
  const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 8, inner = r * 0.62;
  if (!total) {
    ctx.fillStyle = "#5c6b62";
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No spending this month", cx, cy);
    return;
  }
  let a = -Math.PI / 2;
  for (const s of slices) {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    a += sweep;
  }
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#22312a";
  ctx.font = "700 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("$" + Math.round(total).toLocaleString("en-US"), cx, cy - 2);
  ctx.fillStyle = "#5c6b62";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("spent", cx, cy + 16);
}

// Grouped bars: income vs spending per month. `rows`: [{label, income, spending}].
export function drawBars(canvas, rows) {
  const { ctx, width, height } = setup(canvas, 220);
  const padL = 44, padB = 26, padT = 14;
  const max = Math.max(...rows.flatMap((r) => [r.income, r.spending]), 1);
  const plotW = width - padL - 8, plotH = height - padT - padB;
  const groupW = plotW / rows.length;
  const barW = Math.min(26, (groupW - 18) / 2);
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillStyle = "#5c6b62";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    const y = padT + plotH - (plotH * i) / 4;
    ctx.fillText("$" + Math.round(v / 1000) + "k", padL - 8, y + 4);
    ctx.strokeStyle = "#eee7d3";
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(width - 8, y); ctx.stroke();
  }
  rows.forEach((r, i) => {
    const gx = padL + i * groupW + groupW / 2;
    const ih = (r.income / max) * plotH, sh = (r.spending / max) * plotH;
    ctx.fillStyle = "#2e6f5e";
    ctx.fillRect(gx - barW - 2, padT + plotH - ih, barW, ih);
    ctx.fillStyle = "#c65d3b";
    ctx.fillRect(gx + 2, padT + plotH - sh, barW, sh);
    ctx.fillStyle = "#22312a";
    ctx.textAlign = "center";
    ctx.fillText(r.label, gx, height - 8);
  });
  ctx.textAlign = "left";
  ctx.fillStyle = "#2e6f5e";
  ctx.fillRect(padL, 0, 10, 10);
  ctx.fillStyle = "#22312a";
  ctx.fillText("Income", padL + 14, 9);
  ctx.fillStyle = "#c65d3b";
  ctx.fillRect(padL + 74, 0, 10, 10);
  ctx.fillStyle = "#22312a";
  ctx.fillText("Spending", padL + 88, 9);
}

// Line chart of one series over months. `points`: [{label, value}].
// `format` turns a value into its axis label ("$1,234" by default).
export function drawLine(canvas, points, color, format) {
  const fmtAxis = format || ((v) => "$" + Math.round(v).toLocaleString("en-US"));
  const { ctx, width, height } = setup(canvas, 200);
  const padL = 48, padB = 26, padT = 12;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = max - min || 1;
  const plotW = width - padL - 10, plotH = height - padT - padB;
  const x = (i) => padL + (plotW * i) / Math.max(points.length - 1, 1);
  const y = (v) => padT + plotH - ((v - min) / range) * plotH;
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillStyle = "#5c6b62";
  ctx.textAlign = "right";
  for (let i = 0; i <= 3; i++) {
    const v = min + (range * i) / 3;
    const yy = y(v);
    ctx.fillText(fmtAxis(v), padL - 8, yy + 4);
    ctx.strokeStyle = "#eee7d3";
    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(width - 10, yy); ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(x(i), y(p.value)) : ctx.lineTo(x(i), y(p.value))));
  ctx.stroke();
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(p.value), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#22312a";
    ctx.textAlign = "center";
    ctx.fillText(p.label, x(i), height - 8);
  });
}
