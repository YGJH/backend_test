"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const { sortBy } = require('lodash');
class SessionsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(SessionsIndex);
        let { body: sessions } = await this.heroku.get('/oauth/sessions');
        sessions = sortBy(sessions, 'description');
        if (flags.json) {
            core_1.ux.styledJSON(sessions);
        }
        else if (sessions.length === 0) {
            core_1.ux.log('No OAuth sessions.');
        }
        else {
            const printLine = (...args) => this.log(...args);
            core_1.ux.table(sessions, {
                description: { get: (v) => color_1.default.green(v.description) },
                id: {},
            }, { 'no-header': true, printLine });
        }
    }
}
exports.default = SessionsIndex;
SessionsIndex.description = 'list your OAuth sessions';
SessionsIndex.flags = {
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
};
