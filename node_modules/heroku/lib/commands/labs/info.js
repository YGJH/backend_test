"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
function print(feature) {
    core_1.ux.styledHeader(feature.name);
    core_1.ux.styledObject({
        Description: feature.description,
        Enabled: feature.enabled ? color_1.default.green(feature.enabled) : color_1.default.red(feature.enabled),
        Docs: feature.doc_url,
    });
}
class LabsInfo extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(LabsInfo);
        let feature;
        try {
            const featureResponse = await this.heroku.get(`/account/features/${args.feature}`);
            feature = featureResponse.body;
        }
        catch (error) {
            if (error.http.statusCode !== 404)
                throw error;
            // might be an app feature
            if (!flags.app)
                throw error;
            const featureResponse = await this.heroku.get(`/apps/${flags.app}/features/${args.feature}`);
            feature = featureResponse.body;
        }
        if (flags.json) {
            core_1.ux.styledJSON(feature);
        }
        else {
            print(feature);
        }
    }
}
exports.default = LabsInfo;
LabsInfo.description = 'show feature info';
LabsInfo.topic = 'labs';
LabsInfo.args = {
    feature: core_1.Args.string({ required: true, description: 'unique identifier or name of the account feature' }),
};
LabsInfo.flags = {
    app: command_1.flags.app({ required: false }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ description: 'display as json', required: false }),
};
