"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const resolve_1 = require("../../lib/addons/resolve");
const open = require("open");
class Docs extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Docs);
        const { app } = flags;
        const id = args.addon.split(':')[0];
        const addonResponse = await this.heroku.get(`/addon-services/${encodeURIComponent(id)}`)
            .catch(() => null);
        const addon = (addonResponse === null || addonResponse === void 0 ? void 0 : addonResponse.body) ? addonResponse.body : (await (0, resolve_1.resolveAddon)(this.heroku, app, id)).addon_service;
        const url = `https://devcenter.heroku.com/articles/${addon.name}`;
        if (flags['show-url']) {
            core_1.ux.log(url);
        }
        else {
            core_1.ux.log(`Opening ${color_1.default.cyan(url)}...`);
            await open(url);
        }
    }
}
exports.default = Docs;
Docs.topic = 'addons';
Docs.description = "open an add-on's Dev Center documentation in your browser";
Docs.flags = {
    'show-url': command_1.flags.boolean({ description: 'show URL, do not open browser' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Docs.args = {
    addon: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
};
