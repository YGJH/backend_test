"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const { body: teams } = await this.heroku.get('/teams');
        if (flags.json)
            core_1.ux.styledJSON(teams);
        else {
            core_1.ux.table(teams.sort((a, b) => {
                const aName = (a === null || a === void 0 ? void 0 : a.name) || '';
                const bName = (b === null || b === void 0 ? void 0 : b.name) || '';
                return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
            }), {
                name: { header: 'Team' },
                role: { header: 'Role', get: ({ role }) => color_1.default.green(role || '') },
            });
        }
    }
}
exports.default = Index;
Index.topic = 'teams';
Index.description = `list the teams that you are a member of\n\nUse ${color_1.default.cyan.bold('heroku members:*')} to manage team members.`;
Index.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
