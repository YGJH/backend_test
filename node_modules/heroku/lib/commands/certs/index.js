"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const display_table_1 = require("../../lib/certs/display_table");
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const { body: certs } = await this.heroku.get(`/apps/${flags.app}/sni-endpoints`);
        if (certs.length === 0) {
            core_1.ux.log(`${color_1.default.magenta(flags.app)} has no SSL certificates.\nUse ${color_1.default.cmd('heroku certs:add CRT KEY')} to add one.`);
        }
        else {
            const sortedCerts = certs.sort((a, b) => a.name > b.name ? 1 : (b.name > a.name ? -1 : 0));
            (0, display_table_1.default)(sortedCerts);
        }
    }
}
exports.default = Index;
Index.topic = 'certs';
Index.description = 'list SSL certificates for an app';
Index.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
