"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const SecurityExceptionFeatures = {
    'spaces-strict-tls': {
        async prompt(app) {
            core_1.ux.warn('Insecure Action');
            const name = await core_1.ux.prompt(`You are enabling an older security protocol, TLS 1.0, which some organizations may not deem secure.
To proceed, type ${app} or re-run this command with --confirm ${app}`);
            return name;
        },
    },
};
class LabsDisable extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(LabsDisable);
        const feature = args.feature;
        let request;
        let target;
        if (SecurityExceptionFeatures[feature]) {
            if (flags.confirm !== flags.app) {
                const prompt = SecurityExceptionFeatures[feature].prompt;
                const confirm = await prompt(flags.app);
                if (confirm !== flags.app) {
                    this.error('Confirmation name did not match app name. Try again.');
                }
            }
        }
        try {
            await this.heroku.get(`/account/features/${feature}`);
            request = this.disableFeature(feature);
            target = (await this.heroku.get('/account')).body.email;
        }
        catch (error) {
            if (error.http.statusCode !== 404)
                throw error;
            // might be an app feature
            if (!flags.app)
                throw error;
            await this.heroku.get(`/apps/${flags.app}/features/${feature}`);
            request = this.disableFeature(feature, flags.app);
            target = flags.app;
        }
        core_1.ux.action.start(`Disabling ${color_1.default.green(feature)} for ${color_1.default.cyan(target)}`);
        await request;
        core_1.ux.action.stop();
    }
    disableFeature(feature, app) {
        return this.heroku.patch(app ? `/apps/${app}/features/${feature}` : `/account/features/${feature}`, {
            body: { enabled: false },
        });
    }
}
exports.default = LabsDisable;
LabsDisable.description = 'disables an experimental feature';
LabsDisable.args = {
    feature: core_1.Args.string({ required: true, description: 'unique identifier or name of the account feature' }),
};
LabsDisable.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
    confirm: command_1.flags.string({ required: false }),
};
