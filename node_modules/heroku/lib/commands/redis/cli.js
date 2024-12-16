"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const readline = require("readline");
const ssh2_1 = require("ssh2");
const Parser = require("redis-parser");
const portfinder = require("portfinder");
const confirmCommand_1 = require("../../lib/confirmCommand");
const tls = require("tls");
const node_util_1 = require("node:util");
const net = require("net");
const api_1 = require("../../lib/redis/api");
const REPLY_OK = 'OK';
async function redisCLI(uri, client) {
    const io = readline.createInterface(process.stdin, process.stdout);
    const reply = new Parser({
        returnReply(reply) {
            switch (state) {
                case 'monitoring':
                    if (reply !== REPLY_OK) {
                        console.log(reply);
                    }
                    break;
                case 'subscriber':
                    if (Array.isArray(reply)) {
                        reply.forEach(function (value, i) {
                            console.log(`${i + 1}) ${value}`);
                        });
                    }
                    else {
                        console.log(reply);
                    }
                    break;
                case 'connect':
                    if (reply !== REPLY_OK) {
                        console.log(reply);
                    }
                    state = 'normal';
                    io.prompt();
                    break;
                case 'closing':
                    if (reply !== REPLY_OK) {
                        console.log(reply);
                    }
                    break;
                default:
                    if (Array.isArray(reply)) {
                        reply.forEach(function (value, i) {
                            console.log(`${i + 1}) ${value}`);
                        });
                    }
                    else {
                        console.log(reply);
                    }
                    io.prompt();
                    break;
            }
        }, returnError(err) {
            console.log(err.message);
            io.prompt();
        }, returnFatalError(err) {
            client.emit('error', err);
            console.dir(err);
        },
    });
    let state = 'connect';
    client.write(`AUTH ${uri.password}\n`);
    io.setPrompt(uri.host + '> ');
    io.on('line', function (line) {
        switch (line.split(' ')[0]) {
            case 'MONITOR':
                state = 'monitoring';
                break;
            case 'PSUBSCRIBE':
            case 'SUBSCRIBE':
                state = 'subscriber';
                break;
        }
        client.write(`${line}\n`);
    });
    io.on('close', function () {
        state = 'closing';
        client.write('QUIT\n');
    });
    client.on('data', function (data) {
        reply.execute(data);
    });
    return new Promise((resolve, reject) => {
        client.on('error', reject);
        client.on('end', function () {
            console.log('\nDisconnected from instance.');
            io.close();
            resolve();
        });
    });
}
async function bastionConnect(uri, bastions, config, preferNativeTls) {
    const tunnel = await new Promise(resolve => {
        var _a;
        const ssh2 = new ssh2_1.Client();
        ssh2.once('ready', () => resolve(ssh2));
        ssh2.connect({
            host: bastions.split(',')[0],
            username: 'bastion',
            privateKey: (_a = match(config, /_BASTION_KEY/)) !== null && _a !== void 0 ? _a : '',
        });
    });
    const localPort = await portfinder.getPortPromise({ startPort: 49152, stopPort: 65535 });
    const stream = await (0, node_util_1.promisify)(tunnel.forwardOut.bind(tunnel))('localhost', localPort, uri.hostname, Number.parseInt(uri.port, 10));
    let client = stream;
    if (preferNativeTls) {
        client = tls.connect({
            socket: stream,
            port: Number.parseInt(uri.port, 10),
            host: uri.hostname,
            rejectUnauthorized: false,
        });
    }
    stream.on('close', () => tunnel.end());
    stream.on('end', () => client.end());
    return redisCLI(uri, client);
}
function match(config, lookup) {
    for (const key in config) {
        if (lookup.test(key)) {
            return config[key];
        }
    }
    return null;
}
async function maybeTunnel(redis, config) {
    var _a;
    const bastions = match(config, /_BASTIONS/);
    const hobby = redis.plan.indexOf('hobby') === 0;
    const preferNativeTls = redis.prefer_native_tls;
    const uri = preferNativeTls && hobby ? new URL((_a = match(config, /_TLS_URL/)) !== null && _a !== void 0 ? _a : '') : new URL(redis.resource_url);
    if (bastions !== null) {
        return bastionConnect(uri, bastions, config, preferNativeTls);
    }
    let client;
    if (preferNativeTls) {
        client = tls.connect({
            port: Number.parseInt(uri.port, 10), host: uri.hostname, rejectUnauthorized: false,
        });
    }
    else if (hobby) {
        client = net.connect({ port: Number.parseInt(uri.port, 10), host: uri.hostname });
    }
    else {
        client = tls.connect({
            port: Number.parseInt(uri.port, 10) + 1, host: uri.hostname, rejectUnauthorized: false,
        });
    }
    return redisCLI(uri, client);
}
class Cli extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Cli);
        const api = (0, api_1.default)(flags.app, args.database, false, this.heroku);
        const addon = await api.getRedisAddon();
        const configVars = await getRedisConfigVars(addon, this.heroku);
        const { body: redis } = await api.request(`/redis/v0/databases/${addon.id}`);
        if (redis.plan.startsWith('shield-')) {
            core_1.ux.error('\n      Using redis:cli on Heroku Redis shield plans is not supported.\n      Please see Heroku DevCenter for more details: https://devcenter.heroku.com/articles/shield-private-space#shield-features\n      ', { exit: 1 });
        }
        const hobby = redis.plan.indexOf('hobby') === 0;
        const prefer_native_tls = redis.prefer_native_tls;
        if (!prefer_native_tls && hobby) {
            await (0, confirmCommand_1.default)(flags.app, flags.confirm, 'WARNING: Insecure action.\nAll data, including the Redis password, will not be encrypted.');
        }
        const nonBastionVars = Object.keys(configVars)
            .filter(function (configVar) {
            return !(/(?:BASTIONS|BASTION_KEY|BASTION_REKEYS_AFTER)$/.test(configVar));
        })
            .join(', ');
        core_1.ux.log(`Connecting to ${addon.name} (${nonBastionVars}):`);
        return maybeTunnel(redis, configVars);
    }
}
exports.default = Cli;
Cli.topic = 'redis';
Cli.description = 'opens a redis prompt';
Cli.flags = {
    confirm: command_1.flags.string({ char: 'c' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Cli.args = {
    database: core_1.Args.string({ description: 'name of the Key-Value Store database. If omitted, it defaults to the primary database associated with the app.' }),
};
Cli.examples = [
    '$ heroku redis:cli --app=my-app my-database',
    '$ heroku redis:cli --app=my-app --confirm my-database',
];
async function getRedisConfigVars(addon, heroku) {
    const { body: config } = await heroku.get(`/apps/${addon.billing_entity.name}/config-vars`);
    const redisConfigVars = {};
    addon.config_vars.forEach(configVar => {
        redisConfigVars[configVar] = config[configVar];
    });
    return redisConfigVars;
}
