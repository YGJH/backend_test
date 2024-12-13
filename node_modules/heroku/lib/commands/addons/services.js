"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Services extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Services);
        const { body: services } = await this.heroku.get('/addon-services');
        if (flags.json) {
            core_1.ux.styledJSON(services);
        }
        else {
            core_1.ux.table(services, {
                name: {
                    header: 'Slug',
                },
                human_name: {
                    header: 'Name',
                },
                state: {
                    header: 'State',
                },
            });
            core_1.ux.log(`\nSee plans with ${color_1.default.blue('heroku addons:plans SERVICE')}`);
        }
    }
}
exports.default = Services;
Services.topic = 'addons';
Services.description = 'list all available add-on services';
Services.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
