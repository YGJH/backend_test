"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Detach extends command_1.Command {
    async run() {
        var _a, _b;
        const { flags, args } = await this.parse(Detach);
        const app = flags.app;
        const { body: attachment } = await this.heroku.get(`/apps/${app}/addon-attachments/${args.attachment_name}`);
        core_1.ux.action.start(`Detaching ${color_1.default.cyan(attachment.name || '')} to ${color_1.default.yellow(((_a = attachment.addon) === null || _a === void 0 ? void 0 : _a.name) || '')} from ${color_1.default.magenta(app)}`);
        await this.heroku.delete(`/addon-attachments/${attachment.id}`);
        core_1.ux.action.stop();
        core_1.ux.action.start(`Unsetting ${color_1.default.cyan(attachment.name || '')} config vars and restarting ${color_1.default.magenta(app)}`);
        const { body: releases } = await this.heroku.get(`/apps/${app}/releases`, {
            partial: true, headers: { Range: 'version ..; max=1, order=desc' },
        });
        core_1.ux.action.stop(`done, v${((_b = releases[0]) === null || _b === void 0 ? void 0 : _b.version) || ''}`);
    }
}
exports.default = Detach;
Detach.topic = 'addons';
Detach.description = 'detach an existing add-on resource from an app';
Detach.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Detach.args = {
    attachment_name: core_1.Args.string({ required: true, description: 'unique identifier of the add-on attachment' }),
};
