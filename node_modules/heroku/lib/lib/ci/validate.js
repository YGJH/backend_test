"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArgvPresent = void 0;
const core_1 = require("@oclif/core");
const validateArgvPresent = (argv, isUnset = false) => {
    if (argv.length === 0) {
        core_1.ux.error(`Usage: heroku ci:config:${isUnset ? 'unset' : 'set'} KEY1 [KEY2 ...]\nMust specify KEY to ${isUnset ? 'unset' : 'set'}.`, { exit: 1 });
    }
};
exports.validateArgvPresent = validateArgvPresent;
