"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Index extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Index);
        const space = flags.space || args.space;
        if (!space) {
            throw new Error('Space name required.\nUSAGE: heroku trusted-ips my-space');
        }
        const { body: rules } = await this.heroku.get(`/spaces/${space}/inbound-ruleset`);
        if (flags.json) {
            core_1.ux.log(JSON.stringify(rules, null, 2));
        }
        else {
            this.displayRules(space, rules);
        }
    }
    displayRules(space, ruleset) {
        if (ruleset.rules.length > 0) {
            core_1.ux.styledHeader('Trusted IP Ranges');
            for (const rule of ruleset.rules) {
                core_1.ux.log(rule.source);
            }
        }
        else {
            core_1.ux.styledHeader(`${space} has no trusted IP ranges. All inbound web requests to dynos are blocked.`);
        }
    }
}
exports.default = Index;
Index.topic = 'spaces';
Index.hiddenAliases = ['trusted-ips'];
Index.description = (0, tsheredoc_1.default)(`
  list trusted IP ranges for a space
  Trusted IP ranges are only available on Private Spaces.

  The space name is a required parameter. Newly created spaces will have 0.0.0.0/0 set by default
  allowing all traffic to applications in the space. More than one CIDR block can be provided at
  a time to the commands listed below. For example 1.2.3.4/20 and 5.6.7.8/20 can be added with:
  `);
Index.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get inbound rules from' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Index.args = {
    space: core_1.Args.string({ hidden: true }),
};
