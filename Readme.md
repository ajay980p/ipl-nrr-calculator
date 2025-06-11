# IPL Net Run‑Rate Calculator (CLI)

A simple **Node.js command‑line tool** that tells you exactly how many runs / overs your favourite IPL team needs to win its next match and climb the points table.

> "If Rajasthan Royals score 120 in 20 overs, they must restrict Delhi Capitals to 0–102 runs …"

---

## ✨ Features

| Feature                | Description                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Interactive CLI        | Pick teams by number, enter overs, toss result, score.                                      |
| Bat **or** Bowl first  | Handles both scenarios with the correct NRR maths.                                          |
| NRR Bounds             | Won’t let you overshoot into higher positions when points are tied with more than one team. |
| Full validation        | No crashes on bad input – prompts again until the entry is valid.                           |
| Clear PDF‑style output | Matches the assignment wording exactly, with ranges & revised NRR.                          |

---

## 📂 Project Structure

```
├── main.js              # Entry‑point CLI script
├── pointsTable.js       # Season stats for each team (runs, overs, points, NRR)
├── oversUtils.js        # Helper to convert "128.2" → 128.333 overs
├── nrrCalculator.js     # Core simulation logic (bat first & bowl first)
└── README.md            # You are here
```

---

## 🛠️ Installation

```bash
# 1. Clone the repo
$ git clone https://github.com/your‑handle/ipl-nrr-calculator.git
$ cd ipl-nrr-calculator

# 2. Install dependencies (only readline which is built‑in, so… nothing!)
$ npm install   # (no external packages required)
```

---

## 🚀 Running the Tool

```bash
$ node main.js
```

You’ll see numbered menus like:

```
Available Teams:
  1. Chennai Super Kings
  2. Royal Challengers Bangalore
  3. Delhi Capitals
  4. Rajasthan Royals
  5. Mumbai Indians

Select *your* team by number: 4
Total Overs per match: 20
(Your team is currently at position 4)
Desired Table Position should be less than 4): 3
Toss Options:
  1. Your team BATS first
  2. Your team BOWLS first
Select toss result (1 or 2): 1
Runs Scored or Target to Chase: 120
```

…and the calculator prints a PDF‑style answer:

```
📊 Scenario • If Rajasthan Royals bat first and score 120 runs in 20 overs…
• If Rajasthan Royals score 120 runs in 20 overs, Rajasthan Royals need to restrict Delhi Capitals between 0 to 102 runs in 20 overs.
• Revised NRR of Rajasthan Royals will be between 0.597 to 0.325.
```

---

## 🧮 How the Maths Works

- **NRR formula:** `(Runs For / Overs Faced) – (Runs Against / Overs Bowled)`
- Simulator increments opponent score (bat‑first) or chase overs (bowl‑first) ball‑by‑ball and records every outcome that keeps the revised NRR **within the permitted range**:
  - **Lower bound:** Beat the team in the desired position.
  - **Upper cap:** Don’t surpass the NRR of the team immediately above if points will tie.

See comments in `nrrCalculator.js` for full derivation.

---

## 🔄 Customising

1. **Update season stats** – edit `pointsTable.js` if you want a different league stage.
2. **Change match length** – just enter another overs value at run‑time (works for 20, 50, etc.).
3. **Add new teams** – append objects to `pointsTable.js`.

---

## 🤝 Contributing

Pull requests are welcome! If you spot a bug or want another feature (e.g. JSON export, unit tests), open an issue first.

---

## 📜 License

MIT © 2025 Ajay Prajapati

