"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
async function enableFeature(heroku, feature, app) {
    return heroku.patch(app ? `/apps/${app}/features/${feature}` : `/account/features/${feature}`, {
        body: { enabled: true },
    });
}
class LabsEnable extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(LabsEnable);
        const feature = args.feature;
        let target = null;
        let request;
        try {
            await this.heroku.get(`/account/features/${feature}`);
            request = enableFeature(this.heroku, feature);
            const targetResponse = await this.heroku.get('/account');
            target = targetResponse.body.email;
        }
        catch (error) {
            if (error.http.statusCode !== 404)
                throw error;
            // might be an app feature
            if (!flags.app)
                throw error;
            await this.heroku.get(`/apps/${flags.app}/features/${feature}`);
            request = enableFeature(this.heroku, feature, flags.app);
            target = flags.app;
        }
        core_1.ux.action.start(`Enabling ${color_1.default.green(feature)} for ${color_1.default.cyan(target)}`);
        await request;
        core_1.ux.action.stop();
    }
}
exports.default = LabsEnable;
LabsEnable.description = 'enables an experimental feature';
LabsEnable.topic = 'labs';
LabsEnable.flags = {
    app: command_1.flags.app({ required: false }),
    remote: command_1.flags.remote(),
};
LabsEnable.args = {
    feature: core_1.Args.string({ required: true, description: 'unique identifier or name of the account feature' }),
};
