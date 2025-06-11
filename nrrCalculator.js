const { oversToFloat } = require("./oversUtils");

/**
 * Your team bats first.
 *
 * Returns an object with:
 *   minRunsToAllow  – lowest opponent score that still meets NRR bounds (usually 0)
 *   maxRunsToAllow  – highest opponent score that still meets NRR bounds
 *   minNRR          – lowest acceptable NRR (when opponent make maxRunsToAllow)
 *   maxNRR          – highest acceptable NRR (when opponent all-out for minRunsToAllow)
 *
 * If no opponent score can satisfy the bounds, the function returns null.
 *
 * @param {Object} team         – your team’s season aggregates (runs, overs, NRR, points)
 * @param {Object} opponent     – opponent team (not used in math; included for symmetry)
 * @param {number} score        – runs your team scores when batting first
 * @param {number} overs        – overs allotted to each side (e.g. 20 or 50)
 * @param {number} minNRRNeeded – lower NRR bound (must be ≥ this to overtake target team)
 * @param {number} maxNRRCap    – upper NRR cap (must be ≤ this to avoid leap-frogging the
 *                                team above when points are tied).  Defaults to Infinity
 *                                when no ceiling is required.
 */
function simulateBattingFirst(team, opponent, score, overs, minNRRNeeded, maxNRRCap = Infinity) {
    const baseForRuns = team.for.runs + score;
    const baseForOvers = oversToFloat(team.for.overs) + overs;
    const baseAgOvers = oversToFloat(team.against.overs) + overs;

    let minRuns = null, maxRuns = null;
    let minNRR = null, maxNRR = null;

    /* walk DOWN from ‘runs = score’ to 0 so the FIRST hit is the LOWEST NRR */
    for (let runs = score; runs >= 0; runs--) {
        const newAgRuns = team.against.runs + runs;
        const newNRR = (baseForRuns / baseForOvers) - (newAgRuns / baseAgOvers);

        /* accept only if inside BOTH bounds */
        if (newNRR >= minNRRNeeded && newNRR <= maxNRRCap) {
            if (maxRuns === null) {                 // first acceptable → lowest NRR
                maxRuns = runs;                     // …so these are the LAST runs allowed
                minNRR = newNRR;                    // (lowest acceptable NRR)
            }
            minRuns = runs;                         // keep shifting downward
            maxNRR = newNRR;                        // (highest acceptable NRR)
        }
    }

    return maxRuns === null
        ? null                                      // no legal result
        : {
            minRunsToAllow: minRuns,
            maxRunsToAllow: maxRuns,
            minNRR: minNRR.toFixed(3),
            maxNRR: maxNRR.toFixed(3)
        };
}



/**
 * Opponent bats first.
 * Returns an object with:
 *   minOversToChase  – fastest chase that still meets NRR bounds
 *   maxOversToChase  – slowest chase that still meets NRR bounds (≤ full overs)
 *   minNRR           – lowest acceptable NRR   (when chase finished latest)
 *   maxNRR           – highest acceptable NRR  (when chase finished fastest)
 *
 * If no chase can satisfy the bounds, returns null.
 *
 * @param {Object} team          – your team (season totals)
 * @param {Object} opponent      – opponent team (not used in calc but kept for symmetry)
 * @param {number} targetRuns    – runs to chase
 * @param {number} overs         – match length (e.g. 50)
 * @param {number} minNRRNeeded  – lower NRR bound (must be ≥ this)
 * @param {number} maxNRRCap     – upper NRR cap   (must be ≤ this, default Infinity)
 */
function simulateBowlingFirst(
    team,
    opponent,
    targetRuns,
    overs,
    minNRRNeeded,
    maxNRRCap = Infinity
) {
    let minOvers = null, maxOvers = null;
    let maxNRR = null, minNRR = null;

    /* iterate from FASTEST chase (1 ball) to SLOWEST (all balls) */
    for (let balls = 1; balls <= overs * 6; balls++) {
        const ovToChase = balls / 6;                      // decimal overs
        const newForRuns = team.for.runs + targetRuns;
        const newForOv = oversToFloat(team.for.overs) + ovToChase;

        const newAgRuns = team.against.runs + targetRuns;
        const newAgOv = oversToFloat(team.against.overs) + overs;

        const newNRR = (newForRuns / newForOv) - (newAgRuns / newAgOv);

        /* accept only if inside BOTH bounds */
        if (newNRR >= minNRRNeeded && newNRR <= maxNRRCap) {
            if (minOvers === null) {                    // first eligible = FASTEST chase
                minOvers = ovToChase;                   // fastest overs
                maxNRR = newNRR;                        // highest NRR
            }
            maxOvers = ovToChase;                       // keep extending to slower chases
            minNRR = newNRR;                            // lowest acceptable NRR
        }
    }

    return minOvers === null
        ? null
        : {
            minOversToChase: minOvers.toFixed(1),
            maxOversToChase: maxOvers.toFixed(1),
            minNRR: minNRR.toFixed(3),
            maxNRR: maxNRR.toFixed(3)
        };
}

module.exports = { simulateBattingFirst, simulateBowlingFirst };