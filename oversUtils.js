function oversToFloat(oversStr) {
    const parts = oversStr.split(".");
    const overs = parseInt(parts[0]);
    const balls = parts.length > 1 ? parseInt(parts[1]) : 0;
    return overs + balls / 6;
}

module.exports = { oversToFloat };