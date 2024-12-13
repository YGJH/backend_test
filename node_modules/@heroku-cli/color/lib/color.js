"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = exports.CustomColors = void 0;
const ansiStyles = require("ansi-styles");
const supports = require("supports-color");
const chalk = require('chalk');
const dim = process.env.ConEmuANSI === 'ON' ? chalk.gray : chalk.dim;
exports.CustomColors = {
    supports,
    // map gray -> dim because it's not solarized compatible
    gray: dim,
    grey: dim,
    dim,
    attachment: chalk.cyan,
    addon: chalk.yellow,
    configVar: chalk.green,
    release: chalk.blue.bold,
    cmd: chalk.cyan.bold,
    pipeline: chalk.green.bold,
    app: (s) => chalk.level > 0 ? exports.color.heroku(`⬢ ${s}`) : s,
    heroku: (s) => {
        if (chalk.level === 0)
            return s;
        if (!exports.color.supports)
            return s;
        let has256 = exports.color.supportsColor.has256 || (process.env.TERM || '').indexOf('256') !== -1;
        return has256 ? '\u001b[38;5;104m' + s + ansiStyles.reset.open : chalk.magenta(s);
    },
};
exports.color = new Proxy(chalk, {
    get: (chalk, name) => {
        if (exports.CustomColors[name])
            return exports.CustomColors[name];
        return chalk[name];
    },
    set: (chalk, name, value) => {
        switch (name) {
            case 'enabled':
                if (value)
                    chalk.level = 2;
                else
                    chalk.level = 0;
                break;
            default:
                throw new Error(`cannot set property ${name.toString()}`);
        }
        return true;
    },
});
exports.default = exports.color;
