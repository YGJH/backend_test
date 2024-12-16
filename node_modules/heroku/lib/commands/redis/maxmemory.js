"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
class MaxMemory extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(MaxMemory);
        const { app, policy } = flags;
        const { database } = args;
        const addon = await (0, api_1.default)(app, database, false, this.heroku).getRedisAddon();
        const { body: config } = await (0, api_1.default)(app, database, false, this.heroku)
            .request(`/redis/v0/databases/${addon.name}/config`, 'PATCH', { maxmemory_policy: policy });
        const configVars = addon.config_vars || [];
        core_1.ux.log(`Maxmemory policy for ${addon.name} (${configVars.join(', ')}) set to ${config.maxmemory_policy.value}.`);
        core_1.ux.log(`${config.maxmemory_policy.value} ${config.maxmemory_policy.values[config.maxmemory_policy.value]}.`);
    }
}
exports.default = MaxMemory;
MaxMemory.topic = 'redis';
MaxMemory.description = `set the key eviction policy when instances reach their storage limit
  Available policies for key eviction include:

  noeviction      # returns errors when memory limit is reached
  allkeys-lfu     # removes less frequently used keys first
  volatile-lfu    # removes less frequently used keys first that have an expiry set
  allkeys-lru     # removes less recently used keys first
  volatile-lru    # removes less recently used keys first that have an expiry set
  allkeys-random  # evicts random keys
  volatile-random # evicts random keys but only those that have an expiry set
  volatile-ttl    # only evicts keys with an expiry set and a short TTL
`;
MaxMemory.flags = {
    app: command_1.flags.app({ required: true }),
    policy: command_1.flags.string({ char: 'p', description: 'set policy name', required: true }),
    remote: command_1.flags.remote(),
};
MaxMemory.args = {
    database: core_1.Args.string({ description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
