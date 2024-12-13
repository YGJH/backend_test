"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Add extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Add);
        const { space } = flags;
        const url = `/spaces/${space}/inbound-ruleset`;
        const { body: ruleset } = await this.heroku.get(url);
        if (!this.isUniqueRule(ruleset, args.source)) {
            throw new Error(`A rule already exists for ${args.source}.`);
        }
        ruleset.rules.push({ action: 'allow', source: args.source });
        await this.heroku.put(url, { body: ruleset });
        core_1.ux.log(`Added ${color_1.default.cyan.bold(args.source)} to trusted IP ranges on ${color_1.default.cyan.bold(space)}`);
        core_1.ux.warn('It may take a few moments for the changes to take effect.');
    }
    isUniqueRule(ruleset, source) {
        return Array.isArray(ruleset.rules) && !ruleset.rules.some(rs => rs.source === source);
    }
}
exports.default = Add;
Add.topic = 'spaces';
Add.hiddenAliases = ['trusted-ips:add'];
Add.description = (0, tsheredoc_1.default)(`
  Add one range to the list of trusted IP ranges
  Uses CIDR notation.`);
Add.examples = [(0, tsheredoc_1.default)(`
  $ heroku trusted-ips:add --space my-space 192.168.2.0/24
    Added 192.168.0.1/24 to trusted IP ranges on my-space`)];
Add.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to add rule to', required: true }),
    confirm: command_1.flags.string({ description: 'set to space name to bypass confirm prompt' }),
};
Add.args = {
    source: core_1.Args.string({ required: true, description: 'IP address in CIDR notation' }),
};
