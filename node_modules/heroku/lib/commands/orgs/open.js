"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const open = require("open");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
class OrgsOpen extends command_1.Command {
    static async openUrl(url) {
        core_1.ux.log(`Opening ${color_1.default.cyan(url)}...`);
        await open(url);
    }
    async run() {
        const { flags } = await this.parse(OrgsOpen);
        const team = flags.team;
        const { body: org } = await this.heroku.get(`/teams/${team}`);
        await OrgsOpen.openUrl(`https://dashboard.heroku.com/teams/${org.name}`);
    }
}
exports.default = OrgsOpen;
OrgsOpen.topic = 'orgs';
OrgsOpen.description = 'open the team interface in a browser window';
OrgsOpen.flags = {
    team: command_1.flags.team({ required: true }),
};
