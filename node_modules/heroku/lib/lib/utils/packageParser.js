"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllHelpFlags = exports.getAllVersionFlags = void 0;
const { oclif } = require('../../../package.json');
function getAllVersionFlags() {
    return [...oclif.additionalVersionFlags, '--version'];
}
exports.getAllVersionFlags = getAllVersionFlags;
function getAllHelpFlags() {
    return [...oclif.additionalHelpFlags, '--help', 'help'];
}
exports.getAllHelpFlags = getAllHelpFlags;
