"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const { sortBy } = require('lodash');
class AuthorizationsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(AuthorizationsIndex);
        let { body: authorizations } = await this.heroku.get('/oauth/authorizations');
        authorizations = sortBy(authorizations, 'description');
        if (flags.json) {
            core_1.ux.styledJSON(authorizations);
        }
        else if (authorizations.length === 0) {
            core_1.ux.log('No OAuth authorizations.');
        }
        else {
            const printLine = (...args) => this.log(...args);
            core_1.ux.table(authorizations, {
                description: { get: (v) => color_1.default.green(v.description) },
                id: {},
                scope: { get: (v) => v.scope.join(',') },
            }, { 'no-header': true, printLine });
        }
    }
}
exports.default = AuthorizationsIndex;
AuthorizationsIndex.description = 'list OAuth authorizations';
AuthorizationsIndex.examples = [
    '$ heroku authorizations',
];
AuthorizationsIndex.flags = {
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
};
