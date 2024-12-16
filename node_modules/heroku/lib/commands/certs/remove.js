"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const flags_1 = require("../../lib/certs/flags");
const confirmCommand_1 = require("../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
class Remove extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Remove);
        const { app, confirm } = flags;
        const sniEndpoint = await (0, flags_1.default)(flags, this.heroku);
        await (0, confirmCommand_1.default)(app, confirm, (0, tsheredoc_1.default) `
          WARNING: Destructive Action - you cannot rollback this change
          This command will remove the endpoint ${sniEndpoint.name} from ${color_1.default.magenta(app)}.
        `);
        core_1.ux.action.start(`Removing SSL certificate ${sniEndpoint.name} from ${color_1.default.magenta(app)}`);
        await this.heroku.request(`/apps/${app}/sni-endpoints/${sniEndpoint.name}`, { method: 'DELETE' });
        core_1.ux.action.stop();
    }
}
exports.default = Remove;
Remove.topic = 'certs';
Remove.description = 'remove an SSL certificate from an app';
Remove.flags = {
    confirm: command_1.flags.string({ hidden: true }),
    name: command_1.flags.string({ description: 'name to remove' }),
    endpoint: command_1.flags.string({ description: 'endpoint to remove' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
