"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
class Info extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Info);
        const { app, json } = flags;
        const { body: feature } = await this.heroku.get(`/apps/${app}/features/${args.feature}`);
        if (json) {
            core_1.ux.styledJSON(feature);
        }
        else {
            core_1.ux.styledHeader(feature.name || '');
            core_1.ux.styledObject({
                Description: feature.description,
                Enabled: feature.enabled ? color_1.default.green('true') : color_1.default.red('false'),
                Docs: feature.doc_url,
            });
        }
    }
}
exports.default = Info;
Info.description = 'display information about a feature';
Info.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Info.args = {
    feature: core_1.Args.string({ required: true, description: 'unique identifier or name of the app feature' }),
};
