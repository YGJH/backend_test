"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const utils_1 = require("../../lib/orgs/utils");
class OrgsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(OrgsIndex);
        let { body: orgs } = await this.heroku.get('/teams');
        if (flags.enterprise) {
            orgs = orgs.filter(o => o.type === 'enterprise');
        }
        if (flags.json) {
            (0, utils_1.printGroupsJSON)(orgs);
        }
        else {
            (0, utils_1.printGroups)(orgs, { label: 'Teams' });
        }
    }
}
exports.default = OrgsIndex;
OrgsIndex.topic = 'orgs';
OrgsIndex.description = 'list the teams that you are a member of';
OrgsIndex.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
    enterprise: command_1.flags.boolean({ description: 'filter by enterprise teams' }),
    teams: command_1.flags.boolean({ description: 'filter by teams', hidden: true }),
};
