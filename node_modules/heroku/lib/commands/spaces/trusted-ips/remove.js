"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Remove extends command_1.Command {
    async run() {
        var _a, _b, _c, _d;
        const { flags, args } = await this.parse(Remove);
        const space = flags.space;
        const url = `/spaces/${space}/inbound-ruleset`;
        const { body: rules } = await this.heroku.get(url);
        if (((_a = rules.rules) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            throw new Error('No IP ranges are configured. Nothing to do.');
        }
        const originalLength = (_b = rules.rules) === null || _b === void 0 ? void 0 : _b.length;
        rules.rules = (_c = rules.rules) === null || _c === void 0 ? void 0 : _c.filter(r => r.source !== args.source);
        if (((_d = rules.rules) === null || _d === void 0 ? void 0 : _d.length) === originalLength) {
            throw new Error(`No IP range matching ${args.source} was found.`);
        }
        await this.heroku.put(url, { body: rules });
        core_1.ux.log(`Removed ${color_1.default.cyan.bold(args.source)} from trusted IP ranges on ${color_1.default.cyan.bold(space)}`);
        core_1.ux.warn('It may take a few moments for the changes to take effect.');
    }
}
exports.default = Remove;
Remove.topic = 'spaces';
Remove.hiddenAliases = ['trusted-ips:remove'];
Remove.description = (0, tsheredoc_1.default)(`
  Remove a range from the list of trusted IP ranges
  Uses CIDR notation.`);
Remove.examples = [(0, tsheredoc_1.default)(`
  $ heroku trusted-ips:remove --space my-space 192.168.2.0/24
      Removed 192.168.2.0/24 from trusted IP ranges on my-space
        `)];
Remove.flags = {
    space: command_1.flags.string({ required: true, char: 's', description: 'space to remove rule from' }),
    confirm: command_1.flags.string({ description: 'set to space name to bypass confirm prompt' }),
};
Remove.args = {
    source: core_1.Args.string({ required: true, description: 'IP address in CIDR notation' }),
};
