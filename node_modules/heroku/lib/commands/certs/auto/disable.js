"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const confirmCommand_1 = require("../../../lib/confirmCommand");
const tsheredoc_1 = require("tsheredoc");
class Disable extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Disable);
        const { app, confirm } = flags;
        const warning = (0, tsheredoc_1.default)(`
      This command will disable Automatic Certificate Management from ${color_1.default.app(app)}.
      This will cause the certificate to be removed from ${color_1.default.app(app)} causing SSL
      validation errors.  In order to avoid downtime, the recommended steps
      are preferred which will also disable Automatic Certificate Management.

      1) Request a new SSL certificate for your domains names from your certificate provider
      2) heroku certs:update CRT KEY
    `);
        await (0, confirmCommand_1.default)(app, confirm, warning);
        core_1.ux.action.start('Disabling Automatic Certificate Management');
        await this.heroku.delete(`/apps/${app}/acm`);
        core_1.ux.action.stop();
    }
}
exports.default = Disable;
Disable.topic = 'certs';
Disable.description = 'disable ACM for an app';
Disable.flags = {
    confirm: command_1.flags.string({ char: 'c', hidden: true }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
