"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/redis/api");
const tsheredoc_1 = require("tsheredoc");
const core_2 = require("@oclif/core");
class KeyspaceNotifications extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(KeyspaceNotifications);
        const { app, config } = flags;
        const { database } = args;
        const api = (0, api_1.default)(app, database, false, this.heroku);
        const addon = await api.getRedisAddon();
        const { body: updated_config } = await api.request(`/redis/v0/databases/${addon.name}/config`, 'PATCH', { notify_keyspace_events: config });
        core_2.ux.log(`Keyspace notifications for ${addon.name} (${addon.config_vars.join(', ')}) set to '${updated_config.notify_keyspace_events.value}'.`);
    }
}
exports.default = KeyspaceNotifications;
KeyspaceNotifications.topic = 'redis';
KeyspaceNotifications.description = (0, tsheredoc_1.default) `
    set the keyspace notifications configuration
    Set the configuration to enable keyspace notification events:
    K     Keyspace events, published with __keyspace@<db>__ prefix.
    E     Keyevent events, published with __keyevent@<db>__ prefix.
    g     Generic commands (non-type specific) like DEL, EXPIRE, RENAME, ...
    $     String commands
    l     List commands
    s     Set commands
    h     Hash commands
    z     Sorted set commands
    t     Stream commands
    x     Expired events (events generated every time a key expires)
    e     Evicted events (events generated when a key is evicted for maxmemory)
    m     Key miss events (events generated when a key that doesn't exist is accessed)
    A     Alias for "g$lshztxe", so that the "AKE" string means all the events except "m".

    pass an empty string ('') to disable keyspace notifications
  `;
KeyspaceNotifications.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    config: command_1.flags.string({ char: 'c', description: 'set keyspace notifications configuration', hasValue: true, required: true }),
};
KeyspaceNotifications.args = {
    database: core_1.Args.string({ description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
