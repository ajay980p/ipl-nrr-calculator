// nrrCalculator.js  (only the two simulate* functions changed)
const { oversToFloat } = require("./oversUtils");

/**
 * Your team bats first.  Returns:
 * {
 *   minRunsToAllow,   // lowest runs that still meet NRR   (usually 0)
 *   maxRunsToAllow,   // highest runs that still meet NRR
 *   minNRR,           // NRR if opponent all-out 0
 *   maxNRR            // NRR if opponent scores maxRunsToAllow
 * }
 * or null if impossible.
 */
function simulateBattingFirst(team, opponent, score, overs, desiredNRR, maxRequiredNRR) {
    const baseForRuns = team.for.runs + score;
    const baseForOvers = oversToFloat(team.for.overs) + overs;
    const baseAgOvers = oversToFloat(team.against.overs) + overs;

    console.log("Base for Overs : ", baseForOvers)
    console.log("Base Age Overs : ", baseAgOvers)
    console.log("Base for runs : ", baseForRuns)
    console.log("Max required NRR : ", maxRequiredNRR)

    let minRuns = null, maxRuns = null, minNRR = null, maxNRR = null;

    for (let runs = score; runs >= 0; runs--) {
        const newAgRuns = team.against.runs + runs;
        const newNRR = (baseForRuns / baseForOvers) - (newAgRuns / baseAgOvers);

        if (newNRR >= desiredNRR && newNRR <= maxRequiredNRR) {
            if (maxRuns === null) {               // first acceptable → lowest NRR
                maxRuns = runs;
                minAcceptableNRR = newNRR;          // <-- lowest NRR in the range
            }
            minRuns = runs;                       // keep shifting down
            maxAcceptableNRR = newNRR;            // <-- highest NRR in the range
        }
    }

    console.log("Max run are : ", maxRuns);

    return maxRuns === null
        ? null
        : {
            minRunsToAllow: minRuns,
            maxRunsToAllow: maxRuns,
            minNRR: minAcceptableNRR.toFixed(3),
            maxNRR: maxAcceptableNRR.toFixed(3),
        };
}

/**
 * Opponent bats first.  Returns:
 * {
 *   minOversToChase,  // fastest chase to meet NRR
 *   maxOversToChase,  // slowest chase that still meets NRR (≤ full overs)
 *   minNRR, maxNRR    // corresponding NRRs
 * }
 * or null if impossible.
 */
function simulateBowlingFirst(team, opponent, targetRuns, overs, desiredNRR) {
    let minOvers = null, maxOvers = null, minNRR = null, maxNRR = null;

    for (let balls = 1; balls <= overs * 6; balls++) {
        const ovToChase = balls / 6;                         // decimal overs
        const newForRuns = team.for.runs + targetRuns;
        const newForOv = oversToFloat(team.for.overs) + ovToChase;
        const newAgRuns = team.against.runs + targetRuns;
        const newAgOv = oversToFloat(team.against.overs) + overs;
        const newNRR = (newForRuns / newForOv) - (newAgRuns / newAgOv);

        if (newNRR >= desiredNRR) {
            if (minOvers === null) minOvers = ovToChase, maxNRR = newNRR;
            maxOvers = ovToChase;
            minNRR = newNRR;
        }
    }

    return minOvers === null
        ? null
        : {
            minOversToChase: minOvers.toFixed(1), maxOversToChase: maxOvers.toFixed(1),
            minNRR: minNRR.toFixed(3), maxNRR: maxNRR.toFixed(3)
        };
}

module.exports = { simulateBattingFirst, simulateBowlingFirst };