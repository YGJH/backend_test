"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayRulesAsJSON = exports.displayRules = exports.parsePorts = void 0;
const core_1 = require("@oclif/core");
function parsePorts(protocol, port = '') {
    if (port === '-1' || port === 'any') {
        if (protocol === 'icmp') {
            return [0, 255];
        }
        return [0, 65535];
    }
    let actual = [];
    const ports = port.split('-').map(port => Number.parseInt(port));
    if (ports.length === 2) {
        actual = ports;
    }
    else if (ports.length === 1) {
        actual = ports.concat(ports);
    }
    else {
        throw new Error('Specified --port range seems incorrect.');
    }
    if (actual.length !== 2) {
        throw new Error('Specified --port range seems incorrect.');
    }
    return actual;
}
exports.parsePorts = parsePorts;
function displayRules(space, ruleset) {
    const rules = ruleset.rules || [];
    if (rules.length > 0) {
        core_1.ux.styledHeader('Outbound Rules');
        display(ruleset.rules);
    }
    else {
        core_1.ux.styledHeader(`${space} has no Outbound Rules. Your Dynos cannot communicate with hosts outside of ${space}.`);
    }
}
exports.displayRules = displayRules;
function displayRulesAsJSON(ruleset) {
    core_1.ux.log(JSON.stringify(ruleset, null, 2));
}
exports.displayRulesAsJSON = displayRulesAsJSON;
function display(rules) {
    core_1.ux.table(lined(rules), {
        line: {
            header: 'Rule Number',
        },
        target: {
            header: 'Destination',
        },
        from_port: {
            header: 'From Port',
            get: rule => rule.from_port.toString(),
        },
        to_port: {
            header: 'To Port',
            get: rule => rule.to_port.toString(),
        },
        protocol: {
            header: 'Protocol',
        },
    });
}
function lined(rules) {
    const lined = [];
    rules = rules || [];
    for (let i = 0, len = rules.length; i < len; i++) {
        lined.push({
            line: i + 1,
            target: rules[i].target,
            from_port: rules[i].from_port,
            to_port: rules[i].to_port,
            protocol: rules[i].protocol,
        });
    }
    return lined;
}
