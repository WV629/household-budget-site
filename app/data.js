// Hearth demo data: the Hartley household — two adults, two kids, one dog.
// Every figure is invented demo data. Months run August to November 2026;
// November is the current month, so it ends on the 26th.
export const HOUSEHOLD = {
  name: "The Hartley Household",
  members: "Maya & Jordan Hartley, Leo (9), Nora (6), and Biscuit the dog",
  home: "Maple Street, since 2021",
  currency: "USD",
};

export const CATEGORIES = [
  { id: "housing", name: "Housing", color: "#2e6f5e", icon: "⌂" },
  { id: "groceries", name: "Groceries", color: "#7a9a3d", icon: "◍" },
  { id: "dining", name: "Dining Out", color: "#c65d3b", icon: "♨" },
  { id: "transport", name: "Transport", color: "#4a7fb5", icon: "➤" },
  { id: "utilities", name: "Utilities", color: "#8a6fb8", icon: "⚡" },
  { id: "entertainment", name: "Entertainment", color: "#d99a2b", icon: "♪" },
  { id: "health", name: "Health", color: "#3d9a8a", icon: "+" },
  { id: "kids", name: "Kids & School", color: "#b85c8a", icon: "✎" },
  { id: "shopping", name: "Shopping", color: "#6b7f8f", icon: "▣" },
  { id: "savings", name: "Savings", color: "#2e7d4f", icon: "⬢" },
  { id: "income", name: "Income", color: "#2e7d4f", icon: "$" },
];

export const MONTH_BUDGETS = {
  "2026-08": { housing: 1850, groceries: 700, dining: 300, transport: 400, utilities: 290, entertainment: 170, health: 200, kids: 350, shopping: 240 },
  "2026-09": { housing: 1850, groceries: 700, dining: 300, transport: 400, utilities: 290, entertainment: 170, health: 200, kids: 350, shopping: 240 },
  "2026-10": { housing: 1850, groceries: 720, dining: 320, transport: 410, utilities: 295, entertainment: 180, health: 220, kids: 380, shopping: 260 },
  "2026-11": { housing: 1850, groceries: 720, dining: 320, transport: 410, utilities: 295, entertainment: 180, health: 220, kids: 380, shopping: 260 },
};

export const GOALS = [
  { id: "g-emergency", name: "Emergency fund", target: 12000, saved: 8450, note: "Six months of essentials, kept in a high-yield savings account.", deadline: "2027-06-30" },
  { id: "g-trip", name: "Summer road trip", target: 3500, saved: 2140, note: "Two weeks down the coast: gas, motels, and a lot of ice cream.", deadline: "2027-06-01" },
  { id: "g-car", name: "Next car down payment", target: 8000, saved: 3200, note: "The wagon is at 148,000 miles. A used hybrid is the plan.", deadline: "2027-09-01" },
  { id: "g-kitchen", name: "Kitchen refresh", target: 15000, saved: 4800, note: "New counters, paint, and a dishwasher that does not leak.", deadline: "2028-03-01" },
];

export const BILLS = [
  { id: "b-mortgage", name: "Northside Mortgage", amount: 1650, dueDay: 1, category: "housing", autopay: true, note: "30-year fixed, 4.1%" },
  { id: "b-electric", name: "City Power & Light", amount: 132, dueDay: 8, category: "utilities", autopay: true, note: "Varies with the season" },
  { id: "b-water", name: "ClearWater Utility", amount: 58, dueDay: 12, category: "utilities", autopay: false, note: "Water and sewer" },
  { id: "b-internet", name: "Skyline Internet", amount: 79, dueDay: 15, category: "utilities", autopay: true, note: "500 Mbps fiber" },
  { id: "b-mobile", name: "Beacon Mobile — 2 lines", amount: 96, dueDay: 18, category: "utilities", autopay: true, note: "Maya and Jordan" },
  { id: "b-insurance", name: "Harbor Car Insurance", amount: 142, dueDay: 21, category: "transport", autopay: true, note: "Two cars, full coverage" },
  { id: "b-gym", name: "Maple Street Gym", amount: 45, dueDay: 25, category: "health", autopay: true, note: "Family membership" },
  { id: "b-stream", name: "StreamBox", amount: 18, dueDay: 27, category: "entertainment", autopay: true, note: "Movies and kids' shows" },
  { id: "b-car", name: "Wagon loan payment", amount: 385, dueDay: 28, category: "transport", autopay: true, note: "14 payments left" },
];

// [day, "in"|"out", category, description, amount] — amount always positive here.
const RAW = {
  "2026-08": [
    [1, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [1, "out", "housing", "Northside Mortgage", 1650],
    [2, "out", "groceries", "GreenLeaf Market", 186.40],
    [3, "out", "transport", "Metro Transit monthly pass", 96],
    [4, "out", "utilities", "City Power & Light", 128.55],
    [5, "out", "dining", "Hearthstone Cafe", 34.20],
    [7, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [7, "out", "groceries", "GreenLeaf Market", 142.75],
    [8, "out", "entertainment", "Riverside Cinema — family night", 48],
    [9, "out", "kids", "Bright Start school supplies", 86.30],
    [10, "out", "shopping", "Maple Street Outfitters", 74.99],
    [11, "out", "utilities", "ClearWater Utility", 54.20],
    [12, "out", "dining", "Noodle House", 41.60],
    [14, "out", "groceries", "GreenLeaf Market", 168.90],
    [15, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [15, "out", "utilities", "Skyline Internet", 79],
    [16, "out", "health", "Sunrise Pharmacy", 32.40],
    [17, "out", "transport", "Fuel — Corner Gas", 52.30],
    [18, "out", "dining", "Taco Barn", 28.75],
    [19, "out", "entertainment", "StreamBox", 17.99],
    [20, "out", "kids", "Kids' soccer registration", 120],
    [21, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [22, "out", "groceries", "GreenLeaf Market", 154.60],
    [23, "out", "shopping", "HomeGoods Outlet", 63.45],
    [24, "out", "health", "BrightSmile Dental — checkup", 85],
    [26, "out", "dining", "Bella's Pizzeria", 46.80],
    [27, "out", "transport", "Fuel — Corner Gas", 48.90],
    [28, "out", "groceries", "Saturday farmers market", 92.15],
    [29, "out", "entertainment", "Board game night snacks", 22.40],
    [15, "out", "savings", "Transfer to emergency fund", 400],
    [31, "in", "income", "Freelance design — Maya", 450],
  ],
  "2026-09": [
    [1, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [1, "out", "housing", "Northside Mortgage", 1650],
    [2, "out", "groceries", "GreenLeaf Market", 178.20],
    [3, "out", "transport", "Metro Transit monthly pass", 96],
    [5, "out", "kids", "Leo's new sneakers", 64.99],
    [6, "out", "dining", "Sunday brunch — Hearthstone Cafe", 52.40],
    [7, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [8, "out", "utilities", "City Power & Light", 121.10],
    [9, "out", "groceries", "GreenLeaf Market", 149.85],
    [10, "out", "health", "Annual flu shots — family", 60],
    [11, "out", "utilities", "ClearWater Utility", 57.60],
    [12, "out", "shopping", "Bookstore — Nora's birthday books", 41.25],
    [13, "out", "entertainment", "Mini golf — family outing", 36],
    [14, "out", "groceries", "GreenLeaf Market", 161.30],
    [15, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [15, "out", "utilities", "Skyline Internet", 79],
    [16, "out", "transport", "Fuel — Corner Gas", 55.10],
    [17, "out", "dining", "Noodle House", 38.90],
    [18, "out", "kids", "Nora's birthday party supplies", 73.40],
    [19, "out", "entertainment", "StreamBox", 17.99],
    [20, "out", "shopping", "Hardware store — faucet repair", 28.75],
    [21, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [22, "out", "groceries", "GreenLeaf Market", 172.45],
    [23, "out", "health", "Sunrise Pharmacy", 24.80],
    [24, "out", "dining", "Taco Barn", 31.20],
    [25, "out", "transport", "Fuel — Corner Gas", 49.60],
    [26, "out", "groceries", "Saturday farmers market", 88.70],
    [27, "out", "entertainment", "Library book sale", 15],
    [28, "out", "kids", "After-school art class — Leo", 95],
    [29, "out", "dining", "Bella's Pizzeria", 44.10],
    [15, "out", "savings", "Transfer to emergency fund", 400],
  ],
  "2026-10": [
    [1, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [1, "out", "housing", "Northside Mortgage", 1650],
    [2, "out", "groceries", "GreenLeaf Market", 191.55],
    [3, "out", "transport", "Metro Transit monthly pass", 96],
    [4, "out", "kids", "Halloween costumes — Leo & Nora", 78.40],
    [5, "out", "dining", "Hearthstone Cafe", 36.75],
    [7, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [8, "out", "utilities", "City Power & Light", 118.45],
    [9, "out", "groceries", "GreenLeaf Market", 158.90],
    [10, "out", "shopping", "Maple Street Outfitters — fall jackets", 132.60],
    [11, "out", "utilities", "ClearWater Utility", 59.30],
    [12, "out", "health", "Sunrise Pharmacy", 41.15],
    [13, "out", "dining", "Noodle House", 43.20],
    [14, "out", "groceries", "GreenLeaf Market", 174.25],
    [15, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [15, "out", "utilities", "Skyline Internet", 79],
    [16, "out", "transport", "Fuel — Corner Gas", 54.80],
    [17, "out", "entertainment", "Pumpkin patch — family day", 42],
    [18, "out", "kids", "Nora's dance class — October", 110],
    [19, "out", "entertainment", "StreamBox", 17.99],
    [20, "out", "groceries", "GreenLeaf Market", 166.40],
    [21, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [22, "out", "shopping", "HomeGoods Outlet — curtains", 58.90],
    [23, "out", "dining", "Bella's Pizzeria", 47.50],
    [24, "out", "transport", "Fuel — Corner Gas", 51.20],
    [25, "out", "health", "BrightSmile Dental — Nora", 65],
    [26, "out", "groceries", "Saturday farmers market", 96.30],
    [27, "out", "entertainment", "Riverside Cinema — family night", 44],
    [28, "out", "kids", "School fundraiser — bake sale", 25],
    [29, "out", "dining", "Taco Barn", 29.85],
    [15, "out", "savings", "Transfer to emergency fund", 400],
    [31, "out", "entertainment", "Halloween candy & decorations", 37.60],
  ],
  "2026-11": [
    [1, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [1, "out", "housing", "Northside Mortgage", 1650],
    [2, "out", "groceries", "GreenLeaf Market", 183.75],
    [3, "out", "transport", "Metro Transit monthly pass", 96],
    [4, "out", "dining", "Hearthstone Cafe", 31.90],
    [5, "out", "kids", "Leo's science fair materials", 42.30],
    [6, "out", "groceries", "GreenLeaf Market", 147.60],
    [7, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [8, "out", "utilities", "City Power & Light", 124.80],
    [9, "out", "health", "Sunrise Pharmacy", 28.60],
    [10, "out", "groceries", "GreenLeaf Market", 169.35],
    [11, "out", "utilities", "ClearWater Utility", 56.40],
    [12, "out", "dining", "Noodle House", 39.75],
    [13, "out", "shopping", "Maple Street Outfitters", 69.95],
    [14, "out", "entertainment", "Riverside Cinema — family night", 46],
    [15, "in", "income", "Paycheck — Maya (Riverbend Studio)", 2300],
    [15, "out", "utilities", "Skyline Internet", 79],
    [15, "out", "savings", "Transfer to emergency fund", 400],
    [16, "out", "transport", "Fuel — Corner Gas", 53.40],
    [17, "out", "groceries", "GreenLeaf Market", 158.20],
    [18, "out", "kids", "Nora's dance class — November", 110],
    [19, "out", "entertainment", "StreamBox", 17.99],
    [20, "out", "dining", "Bella's Pizzeria", 48.25],
    [21, "in", "income", "Paycheck — Jordan (Northgate Logistics)", 1625],
    [22, "out", "groceries", "Saturday farmers market", 94.50],
    [23, "out", "health", "BrightSmile Dental — Jordan", 70],
    [24, "out", "shopping", "HomeGoods Outlet — holiday lights", 54.80],
    [25, "out", "transport", "Fuel — Corner Gas", 50.75],
    [26, "out", "groceries", "Thanksgiving groceries — GreenLeaf Market", 96.40],
  ],
};

// Paid status for the current month's bills, keyed by bill id.
export const BILLS_PAID_NOV = {
  "b-mortgage": true, "b-electric": true, "b-water": true, "b-internet": true,
  "b-mobile": false, "b-insurance": false, "b-gym": true, "b-stream": false, "b-car": false,
};

export function seedTransactions() {
  const list = [];
  let n = 1;
  for (const [month, rows] of Object.entries(RAW)) {
    for (const [day, kind, category, description, amount] of rows) {
      list.push({
        id: "t" + String(n++).padStart(4, "0"),
        date: `${month}-${String(day).padStart(2, "0")}`,
        kind, category, description, amount,
      });
    }
  }
  return list;
}

export function seedState() {
  return {
    transactions: seedTransactions(),
    budgets: JSON.parse(JSON.stringify(MONTH_BUDGETS)),
    goals: JSON.parse(JSON.stringify(GOALS)),
    bills: JSON.parse(JSON.stringify(BILLS)),
    billsPaid: { ...BILLS_PAID_NOV },
    month: "2026-11",
  };
}
