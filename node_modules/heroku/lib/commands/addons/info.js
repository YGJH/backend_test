"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../lib/addons/util");
const resolve_1 = require("../../lib/addons/resolve");
const topic = 'addons';
class Info extends command_1.Command {
    async run() {
        var _a, _b, _c, _d;
        const { flags, args } = await this.parse(Info);
        const { app } = flags;
        const addon = await (0, resolve_1.resolveAddon)(this.heroku, app, args.addon);
        const { body: attachments } = await this.heroku.get(`/addons/${addon.id}/addon-attachments`);
        addon.plan.price = (0, util_1.grandfatheredPrice)(addon);
        addon.attachments = attachments;
        core_1.ux.styledHeader(color_1.default.magenta((_a = addon.name) !== null && _a !== void 0 ? _a : ''));
        core_1.ux.styledObject({
            Plan: addon.plan.name,
            Price: (0, util_1.formatPrice)({ price: addon.plan.price, hourly: true }),
            'Max Price': (0, util_1.formatPrice)({ price: addon.plan.price, hourly: false }),
            Attachments: addon.attachments.map(function (att) {
                var _a;
                return [
                    color_1.default.cyan(((_a = att.app) === null || _a === void 0 ? void 0 : _a.name) || ''), color_1.default.green(att.name || ''),
                ].join('::');
            })
                .sort(), 'Owning app': color_1.default.cyan((_c = (_b = addon.app) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : ''), 'Installed at': (new Date((_d = addon.created_at) !== null && _d !== void 0 ? _d : ''))
                .toString(), State: (0, util_1.formatState)(addon.state),
        });
    }
}
exports.default = Info;
Info.topic = topic;
Info.description = 'show detailed add-on resource and attachment information';
Info.flags = {
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Info.usage = `${topic}:info ADDON`;
Info.args = {
    addon: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
};
