"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../lib/addons/util");
class Attach extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Attach);
        const { app, credential, as, confirm } = flags;
        const { body: addon } = await this.heroku.get(`/addons/${encodeURIComponent(args.addon_name)}`);
        const createAttachment = async (confirmed) => {
            let namespace;
            if (credential && credential !== 'default') {
                namespace = 'credential:' + credential;
            }
            const body = {
                name: as, app: { name: app }, addon: { name: addon.name }, confirm: confirmed, namespace,
            };
            core_1.ux.action.start(`Attaching ${credential ? color_1.default.yellow(credential) + ' of ' : ''}${color_1.default.yellow(addon.name || '')}${as ? ' as ' + color_1.default.cyan(as) : ''} to ${color_1.default.magenta(app)}`);
            const { body: attachments } = await this.heroku.post('/addon-attachments', { body });
            core_1.ux.action.stop();
            return attachments;
        };
        if (credential && credential !== 'default') {
            const { body: credentialConfig } = await this.heroku.get(`/addons/${addon.name}/config/credential:${encodeURIComponent(credential)}`);
            if (credentialConfig.length === 0) {
                throw new Error(`Could not find credential ${credential} for database ${addon.name}`);
            }
        }
        const attachment = await (0, util_1.trapConfirmationRequired)(app, confirm, (confirmed) => createAttachment(confirmed));
        core_1.ux.action.start(`Setting ${color_1.default.cyan(attachment.name || '')} config vars and restarting ${color_1.default.magenta(app)}`);
        const { body: releases } = await this.heroku.get(`/apps/${app}/releases`, {
            partial: true, headers: { Range: 'version ..; max=1, order=desc' },
        });
        core_1.ux.action.stop(`done, v${releases[0].version}`);
    }
}
exports.default = Attach;
Attach.topic = 'addons';
Attach.description = 'attach an existing add-on resource to an app';
Attach.flags = {
    as: command_1.flags.string({ description: 'name for add-on attachment' }),
    credential: command_1.flags.string({ description: 'credential name for scoped access to Heroku Postgres' }),
    confirm: command_1.flags.string({ description: 'overwrite existing add-on attachment with same name' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Attach.args = {
    addon_name: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
};
