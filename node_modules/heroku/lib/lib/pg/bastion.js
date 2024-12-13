"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchConfig = exports.sshTunnel = exports.getConfigs = exports.tunnelConfig = exports.env = exports.getBastion = void 0;
const debug = require('debug')('pg');
const EventEmitter = require("node:events");
const createTunnel = require("tunnel-ssh");
const util_1 = require("util");
const host_1 = require("./host");
const core_1 = require("@oclif/core");
const getBastion = function (config, baseName) {
    // If there are bastions, extract a host and a key
    // otherwise, return an empty Object
    // If there are bastions:
    // * there should be one *_BASTION_KEY
    // * pick one host from the comma-separated list in *_BASTIONS
    // We assert that _BASTIONS and _BASTION_KEY always exist together
    // If either is falsy, pretend neither exist
    const bastionKey = config[`${baseName}_BASTION_KEY`];
    const bastions = (config[`${baseName}_BASTIONS`] || '').split(',');
    const bastionHost = bastions[Math.floor(Math.random() * bastions.length)];
    return (bastionKey && bastionHost) ? { bastionHost, bastionKey } : {};
};
exports.getBastion = getBastion;
const env = (db) => {
    const baseEnv = Object.assign({
        PGAPPNAME: 'psql non-interactive',
        PGSSLMODE: (!db.host || db.host === 'localhost') ? 'prefer' : 'require',
    }, process.env);
    const mapping = {
        PGUSER: 'user',
        PGPASSWORD: 'password',
        PGDATABASE: 'database',
        PGPORT: 'port',
        PGHOST: 'host',
    };
    Object.keys(mapping).forEach(envVar => {
        const val = db[mapping[envVar]];
        if (val) {
            baseEnv[envVar] = val;
        }
    });
    return baseEnv;
};
exports.env = env;
function tunnelConfig(db) {
    const localHost = '127.0.0.1';
    const localPort = Math.floor((Math.random() * (65535 - 49152)) + 49152);
    return {
        username: 'bastion',
        host: db.bastionHost,
        privateKey: db.bastionKey,
        dstHost: db.host || undefined,
        dstPort: (db.port && Number.parseInt(db.port, 10)) || undefined,
        localHost,
        localPort,
    };
}
exports.tunnelConfig = tunnelConfig;
function getConfigs(db) {
    const dbEnv = (0, exports.env)(db);
    const dbTunnelConfig = tunnelConfig(db);
    if (db.bastionKey) {
        Object.assign(dbEnv, {
            PGPORT: dbTunnelConfig.localPort,
            PGHOST: dbTunnelConfig.localHost,
        });
    }
    return {
        dbEnv,
        dbTunnelConfig,
    };
}
exports.getConfigs = getConfigs;
class Timeout {
    constructor(timeout, message) {
        this.events = new EventEmitter();
        this.timeout = timeout;
        this.message = message;
    }
    async promise() {
        this.timer = setTimeout(() => {
            this.events.emit('error', new Error(this.message));
        }, this.timeout);
        try {
            await EventEmitter.once(this.events, 'cancelled');
        }
        finally {
            clearTimeout(this.timer);
        }
    }
    cancel() {
        this.events.emit('cancelled');
    }
}
async function sshTunnel(db, dbTunnelConfig, timeout = 10000) {
    if (!db.bastionKey) {
        return null;
    }
    const timeoutInstance = new Timeout(timeout, 'Establishing a secure tunnel timed out');
    const createSSHTunnel = (0, util_1.promisify)(createTunnel);
    try {
        return await Promise.race([
            timeoutInstance.promise(),
            createSSHTunnel(dbTunnelConfig),
        ]);
    }
    catch (error) {
        debug(error);
        core_1.ux.error('Unable to establish a secure tunnel to your database.');
    }
    finally {
        timeoutInstance.cancel();
    }
}
exports.sshTunnel = sshTunnel;
async function fetchConfig(heroku, db) {
    return heroku.get(`/client/v11/databases/${encodeURIComponent(db.id)}/bastion`, {
        hostname: (0, host_1.default)(),
    });
}
exports.fetchConfig = fetchConfig;
