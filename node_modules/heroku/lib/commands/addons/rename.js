"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Rename extends command_1.Command {
    async run() {
        var _a;
        const { args } = await this.parse(Rename);
        const { body: addon } = await this.heroku.get(`/addons/${encodeURIComponent(args.addon_name)}`);
        await this.heroku.patch(`/apps/${(_a = addon.app) === null || _a === void 0 ? void 0 : _a.id}/addons/${addon.id}`, { body: { name: args.new_name } });
        core_1.ux.log(`${args.addon_name} successfully renamed to ${args.new_name}.`);
    }
}
exports.default = Rename;
Rename.topic = 'addons';
Rename.description = 'rename an add-on';
Rename.args = {
    addon_name: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
    new_name: core_1.Args.string({ required: true, description: 'new globally unique name of the add-on' }),
};
