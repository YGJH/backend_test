"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const { team, json } = flags;
        let { body: spaces } = await this.heroku.get('/spaces', {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        if (team) {
            spaces = spaces.filter(s => s.team.name === team);
        }
        spaces = this.sortByName(spaces);
        if (json)
            this.displayJSON(spaces);
        else if (spaces.length === 0) {
            if (team)
                core_1.ux.error(`No spaces in ${color_1.default.cyan(team)}.`);
            else
                core_1.ux.error('You do not have access to any spaces.');
        }
        else {
            this.display(spaces);
        }
    }
    sortByName(spaces) {
        spaces.sort((a, b) => {
            return a.name === b.name ? 0 : (a.name < b.name ? -1 : 1);
        });
        return spaces;
    }
    displayJSON(spaces) {
        core_1.ux.log(JSON.stringify(spaces, null, 2));
    }
    display(spaces) {
        core_1.ux.table(spaces, {
            Name: { get: space => space.name },
            Team: { get: space => space.team.name },
            Region: { get: space => space.region.name },
            State: { get: space => space.state },
            Generation: { get: space => space.generation },
            createdAt: {
                header: 'Created At',
                get: space => space.created_at,
            },
        });
    }
}
exports.default = Index;
Index.topic = 'spaces';
Index.description = 'list available spaces';
Index.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
    team: command_1.flags.team(),
};
