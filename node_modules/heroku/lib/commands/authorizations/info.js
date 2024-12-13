"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const authorizations_1 = require("../../lib/authorizations/authorizations");
class AuthorizationsInfo extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(AuthorizationsInfo);
        const { body: authentication } = await this.heroku.get(`/oauth/authorizations/${args.id}`);
        if (flags.json) {
            core_1.ux.styledJSON(authentication);
        }
        else {
            (0, authorizations_1.display)(authentication);
        }
    }
}
exports.default = AuthorizationsInfo;
AuthorizationsInfo.description = 'show an existing OAuth authorization';
AuthorizationsInfo.flags = {
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
};
AuthorizationsInfo.args = {
    id: core_1.Args.string({ required: true, description: 'ID of the authorization' }),
};
