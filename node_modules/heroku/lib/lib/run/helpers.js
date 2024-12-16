"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEnvFromFlag = exports.buildCommand = exports.revertSortedArgs = void 0;
/* eslint-disable @typescript-eslint/ban-ts-comment */
const core_1 = require("@oclif/core");
// this function exists because oclif sorts argv
// and to capture all non-flag command inputs
function revertSortedArgs(processArgs, argv) {
    const originalInputOrder = [];
    const flagRegex = /^--?/;
    let isSeparatorPresent = false;
    let argIsFlag = false;
    // this for-loop performs 2 tasks
    // 1. reorders the arguments in the order the user inputted
    // 2. checks that no oclif flags are included in originalInputOrder
    for (const processArg of processArgs) {
        argIsFlag = flagRegex.test(processArg);
        if (processArg === '--') {
            isSeparatorPresent = true;
        }
        if ((argv.includes(processArg) && (!isSeparatorPresent && !argIsFlag)) ||
            (argv.includes(processArg) && (isSeparatorPresent))) {
            originalInputOrder.push(processArg);
        }
    }
    return originalInputOrder;
}
exports.revertSortedArgs = revertSortedArgs;
function buildCommand(args, prependLauncher = false) {
    const prependText = prependLauncher ? 'launcher ' : '';
    if (args.length === 1) {
        // do not add quotes around arguments if there is only one argument
        // `heroku run "rake test"` should work like `heroku run rake test`
        return `${prependText}${args[0]}`;
    }
    let cmd = '';
    for (let arg of args) {
        if (arg.includes(' ') || arg.includes('"')) {
            arg = '"' + arg.replace(/"/g, '\\"') + '"';
        }
        cmd = cmd + ' ' + arg;
    }
    return `${prependText}${cmd.trim()}`;
}
exports.buildCommand = buildCommand;
function buildEnvFromFlag(flag) {
    const env = {};
    for (const v of flag.split(';')) {
        const m = v.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        // @ts-ignore
        if (m)
            env[m[1]] = m[2];
        else
            core_1.ux.warn(`env flag ${v} appears invalid. Avoid using ';' in values.`);
    }
    return env;
}
exports.buildEnvFromFlag = buildEnvFromFlag;
