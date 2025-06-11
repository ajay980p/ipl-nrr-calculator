// main.js  (with detailed analysis output)
const readline = require("readline");
const pointsTable = require("./pointsTable");
const { simulateBattingFirst, simulateBowlingFirst } = require("./nrrCalculator");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = q => new Promise(res => rl.question(q, res));

/* ───── helper menus ───── */
function showTeamsMenu() {
    console.log("\nAvailable Teams:");
    pointsTable.forEach((t, i) => console.log(`  ${i + 1}. ${t.team}`));
    console.log();
}
function pickTeam(num) {
    return num >= 1 && num <= pointsTable.length ? pointsTable[num - 1] : null;
}
function showTossMenu() {
    console.log("\nToss Options:");
    console.log("  1. Your team BATS first");
    console.log("  2. Your team BOWLS first\n");
}

/* ───── generic “ask until valid” helpers ───── */
async function askInt(question, validate, errMsg) {
    while (true) {
        const txt = await prompt(question);
        const num = parseInt(txt, 10);
        if (!isNaN(num) && validate(num)) return num;
        console.log(`❌  ${errMsg}\n`);
    }
}
async function askTeam(question) {
    while (true) {
        const num = await askInt(question, n => pickTeam(n) !== null, "Please choose a listed number.");
        return pickTeam(num);
    }
}
async function askBetterPosition(currentRank) {
    while (true) {
        const pos = await askInt(
            `Desired Table Position should be less than ${currentRank}): `,
            n => n >= 1 && n < currentRank && n <= pointsTable.length,
            `Enter a number between 1 and ${currentRank - 1}.`
        );
        return pos;
    }
}

/* ───── main flow ───── */
(async function main() {
    console.log("=== Cricket NRR Calculator ===");

    /* 1️⃣ choose your team */
    showTeamsMenu();
    const team = await askTeam("Select *your* team by number: ");

    /* 2️⃣ choose opponent */
    showTeamsMenu();
    let opponent;
    while (true) {
        opponent = await askTeam("Select opposition team by number: ");
        if (opponent.team !== team.team) break;
        console.log("❌  Your team and opponent cannot be the same.\n");
    }

    /* 3️⃣ match details */
    const overs = await askInt(
        "Total Overs per match: ",
        n => n > 0,
        "Overs must be a positive integer."
    );

    const currentRank = pointsTable.findIndex(t => t.team === team.team) + 1;
    console.log(`(Your team is currently at position ${currentRank})`);

    const desiredPos = await askBetterPosition(currentRank);
    const targetTeam = pointsTable[desiredPos - 1];

    showTossMenu();
    const tossPick = await askInt(
        "Select toss result (1 or 2): ",
        n => n === 1 || n === 2,
        "Enter 1 or 2."
    );
    const batsFirst = tossPick === 1;

    const score = await askInt(
        "Runs Scored or Target to Chase: ",
        n => n >= 0,
        "Score must be a non-negative integer."
    );

    /* 4️⃣ analysis — detailed summary */
    const curRank = pointsTable.findIndex(t => t.team === team.team) + 1;
    const curNRR = team.nrr ?? "N/A";
    const requiredNRR = (targetTeam.nrr + 0.001).toFixed(3);
    // const maxRequiredNRR = desiredPos === 0 ? pointsTable[0].nrr : pointsTable[desiredPos - 2].nrr;

    // const maxRequiredNRR = pointsTable[desiredPos - 1].points - pointsTable[desiredPos - 2].points === 0 ?
    //     pointsTable[desiredPos - 2].nrr : 999;

    const pointsAfterWin = team.points + 2;   // your team gets two points
    const teamAbove = pointsTable[desiredPos - 2];  // team just ahead of target pos

    let maxRequiredNRR = Infinity;            // default: no ceiling
    if (teamAbove && pointsAfterWin === teamAbove.points) {
        maxRequiredNRR = teamAbove.nrr;         // cap = NRR of team above, if tied
    }

    console.log("\n================ MATCH SUMMARY ================");
    console.log(`Your Team        : ${team.team}`);
    console.log(`Opponent Team    : ${opponent.team}`);
    console.log(`Overs / Format   : ${overs}-over match`);
    console.log(`Toss Result      : ${batsFirst ? `${team.team} BATS first` : `${team.team} BOWLS first`}`);
    console.log(`Score Entered    : ${score} runs`);
    console.log("------------------------------------------------");
    console.log(`Current Position : ${curRank}`);
    console.log(`Current Points   : ${team.points}`);
    console.log(`Current NRR      : ${curNRR}`);
    console.log("------------------------------------------------");
    console.log(`Desired Position : ${desiredPos} (${targetTeam.team})`);
    console.log(`Target Points    : ${targetTeam.points}`);
    console.log(`Target NRR       : ${targetTeam.nrr}`);
    console.log(`NRR You Need     : ≥ ${requiredNRR}`);
    console.log("===============================================\n");

    /* 5️⃣ run NRR simulation – PDF-style */
    let sim;
    if (batsFirst) {
        sim = simulateBattingFirst(team, opponent, score, overs, parseFloat(requiredNRR), parseFloat(maxRequiredNRR));
        console.log(`📊 Scenario • If ${team.team} bat first and score ${score} runs in ${overs} overs…`);

        if (sim) {
            const { minRunsToAllow, maxRunsToAllow, minNRR, maxNRR } = sim;
            console.log(`• If ${team.team} score ${score} runs in ${overs} overs, ${team.team} need to restrict ${opponent.team}`
                + ` between ${minRunsToAllow} to ${maxRunsToAllow} runs in ${overs} overs.`);
            console.log(`• Revised NRR of ${team.team} will be between ${minNRR} to ${maxNRR}.`);
        } else {
            console.log("❌ Cannot reach desired position in this batting-first scenario.");
        }
    } else {
        sim = simulateBowlingFirst(team, opponent, score, overs, parseFloat(requiredNRR));
        console.log(`📊 Scenario • If ${opponent.team} bat first and score ${score} runs in ${overs} overs…`);

        if (sim) {
            const { minOversToChase, maxOversToChase, minNRR, maxNRR } = sim;
            console.log(`• ${team.team} need to chase ${score} runs between ${minOversToChase} and ${maxOversToChase} overs.`);
            console.log(`• Revised NRR for ${team.team} will be between ${minNRR} to ${maxNRR}.`);
        } else {
            console.log("❌ Cannot reach desired position in this bowling-first scenario.");
        }
    }

    rl.close();
})();