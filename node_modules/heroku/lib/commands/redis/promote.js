"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
class Promote extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Promote);
        const api = (0, api_1.default)(flags.app, args.database, false, this.heroku);
        const { body: addonsList } = await this.heroku.get(`/apps/${flags.app}/addons`);
        const addon = await api.getRedisAddon(addonsList);
        const redisFilter = api.makeAddonsFilter('REDIS_URL');
        const redis = redisFilter(addonsList);
        if (redis.length === 1 && redis[0].config_vars.filter((c) => c.endsWith('_URL')).length === 1) {
            const attachment = redis[0];
            await this.heroku.post('/addon-attachments', {
                body: {
                    app: { name: flags.app }, addon: { name: attachment.name }, confirm: flags.app,
                },
            });
        }
        core_1.ux.log(`Promoting ${addon.name} to REDIS_URL on ${flags.app}`);
        await this.heroku.post('/addon-attachments', {
            body: {
                app: { name: flags.app }, addon: { name: addon.name }, confirm: flags.app, name: 'REDIS',
            },
        });
    }
}
exports.default = Promote;
Promote.topic = 'redis';
Promote.description = 'sets DATABASE as your REDIS_URL';
Promote.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Promote.args = {
    database: core_1.Args.string({ required: false, description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
