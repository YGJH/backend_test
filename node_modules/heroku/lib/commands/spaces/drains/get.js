"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Get extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Get);
        const { space, json } = flags;
        const { body: drain } = await this.heroku.get(`/spaces/${space}/log-drain`, { headers: { Accept: 'application/vnd.heroku+json; version=3.dogwood' } });
        if (json) {
            core_1.ux.log(JSON.stringify(drain, null, 2));
        }
        else {
            core_1.ux.log(`${color_1.default.cyan(drain.url)} (${color_1.default.green(drain.token)})`);
        }
    }
}
exports.default = Get;
Get.topic = 'spaces';
Get.aliases = ['drains:get'];
Get.hidden = true;
Get.description = 'display the log drain for a space';
Get.flags = {
    space: command_1.flags.string({ char: 's', description: 'space for which to get log drain', required: true }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
