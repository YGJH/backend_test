"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayVPNStatus = exports.peeringStatus = exports.hostStatus = exports.displayCIDR = void 0;
const color_1 = require("@heroku-cli/color");
function displayCIDR(cidr) {
    var _a;
    return (_a = cidr === null || cidr === void 0 ? void 0 : cidr.join(', ')) !== null && _a !== void 0 ? _a : '';
}
exports.displayCIDR = displayCIDR;
function hostStatus(s) {
    switch (s) {
        case 'available':
            return `${color_1.default.green(s)}`;
        case 'under-assessment':
            return `${color_1.default.yellow(s)}`;
        case 'permanent-failure':
        case 'released-permanent-failure':
            return `${color_1.default.red(s)}`;
        case 'released':
            return `${color_1.default.gray(s)}`;
        default:
            return s;
    }
}
exports.hostStatus = hostStatus;
function peeringStatus(s) {
    switch (s) {
        case 'active':
            return `${color_1.default.green(s)}`;
        case 'pending-acceptance':
        case 'provisioning':
            return `${color_1.default.yellow(s)}`;
        case 'expired':
        case 'failed':
        case 'deleted':
        case 'rejected':
            return `${color_1.default.red(s)}`;
        default:
            return s;
    }
}
exports.peeringStatus = peeringStatus;
function displayVPNStatus(s) {
    switch (s) {
        case 'UP':
        case 'available':
            return `${color_1.default.green(s)}`;
        case 'pending':
        case 'provisioning':
        case 'deprovisioning':
            return `${color_1.default.yellow(s)}`;
        case 'DOWN':
        case 'deleting':
        case 'deleted':
            return `${color_1.default.red(s)}`;
        default:
            return s;
    }
}
exports.displayVPNStatus = displayVPNStatus;
