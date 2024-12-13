"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
exports.default = (app, database, json, heroku) => {
    const HOST = process.env.HEROKU_REDIS_HOST || 'api.data.heroku.com';
    const ADDON = process.env.HEROKU_REDIS_ADDON_NAME || 'heroku-redis';
    return {
        request(path, method = 'GET', body = {}) {
            const headers = { Accept: 'application/json' };
            if (process.env.HEROKU_HEADERS) {
                Object.assign(headers, JSON.parse(process.env.HEROKU_HEADERS));
            }
            return heroku.request(path, {
                hostname: HOST,
                method,
                headers,
                body,
            });
        },
        makeAddonsFilter(filter) {
            if (filter) {
                filter = filter.toUpperCase();
            }
            function matches(addon) {
                const configVars = addon.config_vars || [];
                for (const configVar of configVars) {
                    const cfgName = configVar.toUpperCase();
                    if (filter && cfgName.includes(filter)) {
                        return true;
                    }
                }
                if (addon.name && filter && addon.name.toUpperCase().includes(filter)) {
                    return true;
                }
                return false;
            }
            function onResponse(addons) {
                var _a;
                const redisAddons = [];
                for (const addon of addons) {
                    const service = (_a = addon === null || addon === void 0 ? void 0 : addon.addon_service) === null || _a === void 0 ? void 0 : _a.name;
                    if (service && service.indexOf(ADDON) === 0 && (!filter || matches(addon))) {
                        redisAddons.push(addon);
                    }
                }
                return redisAddons;
            }
            return onResponse;
        },
        async getRedisAddon(addons) {
            if (!addons) {
                ({ body: addons } = await heroku.get(`/apps/${app}/addons`));
            }
            const addonsFilter = this.makeAddonsFilter(database);
            const redisAddons = addonsFilter(addons);
            if (redisAddons.length === 0) {
                core_1.ux.error('No Redis instances found.', { exit: 1 });
            }
            else if (redisAddons.length > 1) {
                const names = redisAddons.map(function (addon) {
                    return addon.name;
                });
                core_1.ux.error(`Please specify a single instance. Found: ${names.join(', ')}`, { exit: 1 });
            }
            return redisAddons[0];
        },
        async info() {
            let { body: addons } = await heroku.get(`/apps/${app}/addons`);
            // filter out non-redis addons
            addons = this.makeAddonsFilter(database)(addons);
            // get info for each db
            const databases = addons.map(addon => {
                return {
                    addon: addon,
                    redis: this.request(`/redis/v0/databases/${addon.name}`).catch(function (error) {
                        if (error.statusCode !== 404) {
                            throw error;
                        }
                        return null;
                    }),
                };
            });
            if (json) {
                const redii = [];
                for (const db of databases) {
                    const { body: redis } = await db.redis || {};
                    if (!redis) {
                        continue;
                    }
                    const json_data = redis;
                    json_data.app = db.addon.app;
                    json_data.config_vars = db.addon.config_vars;
                    const { formation, metaas_source, port } = json_data, filteredRedis = tslib_1.__rest(json_data, ["formation", "metaas_source", "port"]);
                    redii.push(filteredRedis);
                }
                core_1.ux.styledJSON(redii);
                return;
            }
            // print out the info of the addon and redis db info
            for (const db of databases) {
                const { body: redis } = await db.redis || {};
                if (!redis) {
                    continue;
                }
                let uxHeader = db.addon.name;
                if (db.addon && db.addon.config_vars) {
                    uxHeader += ` (${db.addon.config_vars.join(', ')})`;
                }
                if (uxHeader) {
                    core_1.ux.styledHeader(uxHeader);
                    core_1.ux.styledObject(
                    // eslint-disable-next-line unicorn/no-array-reduce
                    redis.info.reduce(function (memo, row) {
                        memo[row.name] = row.values;
                        return memo;
                    }, {}), redis.info.map(row => row.name));
                }
            }
        },
    };
};
