"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../lib/addons/util");
const _ = require("lodash");
class Plans extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Plans);
        let { body: plans } = await this.heroku.get(`/addon-services/${args.service}/plans`);
        plans = _.sortBy(plans, ['price.contract', 'price.cents']);
        if (flags.json) {
            core_1.ux.styledJSON(plans);
        }
        else {
            core_1.ux.table(plans, {
                default: {
                    header: '',
                    get: (plan) => plan.default ? 'default' : '',
                },
                name: {
                    header: 'Slug',
                },
                human_name: {
                    header: 'Name',
                },
                price: {
                    header: 'Price',
                    get: (plan) => (0, util_1.formatPrice)({ price: plan.price, hourly: true }),
                },
                max_price: {
                    header: 'Max price',
                    get: (plan) => (0, util_1.formatPrice)({ price: plan.price, hourly: false }),
                },
            });
        }
    }
}
exports.default = Plans;
Plans.topic = 'addons';
Plans.description = 'list all available plans for an add-on service';
Plans.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Plans.args = {
    service: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
};
