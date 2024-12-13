"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderInfo = exports.displayNat = exports.displayShieldState = void 0;
const core_1 = require("@oclif/core");
function displayShieldState(space) {
    return space.shield ? 'on' : 'off';
}
exports.displayShieldState = displayShieldState;
function displayNat(nat) {
    if (!nat)
        return;
    if (nat.state !== 'enabled')
        return nat.state;
    return nat.sources.join(', ');
}
exports.displayNat = displayNat;
function renderInfo(space, json) {
    var _a, _b;
    if (json) {
        core_1.ux.log(JSON.stringify(space, null, 2));
    }
    else {
        core_1.ux.styledHeader(space.name || '');
        core_1.ux.styledObject({
            ID: space.id,
            Team: (_a = space.team) === null || _a === void 0 ? void 0 : _a.name,
            Region: (_b = space.region) === null || _b === void 0 ? void 0 : _b.description,
            CIDR: space.cidr,
            'Data CIDR': space.data_cidr,
            State: space.state,
            Shield: displayShieldState(space),
            'Outbound IPs': displayNat(space.outbound_ips),
            Generation: space.generation.name,
            'Created at': space.created_at,
        }, ['ID', 'Team', 'Region', 'CIDR', 'Data CIDR', 'State', 'Shield', 'Outbound IPs', 'Generation', 'Created at']);
    }
}
exports.renderInfo = renderInfo;
