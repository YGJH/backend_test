"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactive = exports.execFile = exports.exec = exports.fetchVersion = exports.Tunnel = exports.runWithTunnel = exports.consumeStream = exports.trapAndForwardSignalsToChildProcess = exports.waitForPSQLExit = exports.execPSQL = exports.psqlInteractiveOptions = exports.psqlFileOptions = exports.psqlQueryOptions = void 0;
const core_1 = require("@oclif/core");
const child_process_1 = require("child_process");
const debug_1 = require("debug");
const fs = require("fs");
const node_events_1 = require("node:events");
const path = require("node:path");
const node_stream_1 = require("node:stream");
const promises_1 = require("node:stream/promises");
const bastion_1 = require("./bastion");
const pgDebug = (0, debug_1.default)('pg');
function psqlQueryOptions(query, dbEnv, cmdArgs = []) {
    pgDebug('Running query: %s', query.trim());
    const psqlArgs = ['-c', query, '--set', 'sslmode=require', ...cmdArgs];
    const childProcessOptions = {
        stdio: ['ignore', 'pipe', 'inherit'],
    };
    return {
        dbEnv,
        psqlArgs,
        childProcessOptions,
    };
}
exports.psqlQueryOptions = psqlQueryOptions;
function psqlFileOptions(file, dbEnv) {
    pgDebug('Running sql file: %s', file.trim());
    const childProcessOptions = {
        stdio: ['ignore', 'pipe', 'inherit'],
    };
    const psqlArgs = ['-f', file, '--set', 'sslmode=require'];
    return {
        dbEnv,
        psqlArgs,
        childProcessOptions,
    };
}
exports.psqlFileOptions = psqlFileOptions;
function psqlInteractiveOptions(prompt, dbEnv) {
    let psqlArgs = ['--set', `PROMPT1=${prompt}`, '--set', `PROMPT2=${prompt}`];
    const psqlHistoryPath = process.env.HEROKU_PSQL_HISTORY;
    if (psqlHistoryPath) {
        if (fs.existsSync(psqlHistoryPath) && fs.statSync(psqlHistoryPath).isDirectory()) {
            const appLogFile = `${psqlHistoryPath}/${prompt.split(':')[0]}`;
            pgDebug('Logging psql history to %s', appLogFile);
            psqlArgs = psqlArgs.concat(['--set', `HISTFILE=${appLogFile}`]);
        }
        else if (fs.existsSync(path.dirname(psqlHistoryPath))) {
            pgDebug('Logging psql history to %s', psqlHistoryPath);
            psqlArgs = psqlArgs.concat(['--set', `HISTFILE=${psqlHistoryPath}`]);
        }
        else {
            core_1.ux.warn(`HEROKU_PSQL_HISTORY is set but is not a valid path (${psqlHistoryPath})`);
        }
    }
    psqlArgs = psqlArgs.concat(['--set', 'sslmode=require']);
    const childProcessOptions = {
        stdio: 'inherit',
    };
    return {
        dbEnv,
        psqlArgs,
        childProcessOptions,
    };
}
exports.psqlInteractiveOptions = psqlInteractiveOptions;
function execPSQL({ dbEnv, psqlArgs, childProcessOptions }) {
    const options = Object.assign({ env: dbEnv }, childProcessOptions);
    pgDebug('opening psql process');
    const psql = (0, child_process_1.spawn)('psql', psqlArgs, options);
    psql.once('spawn', () => pgDebug('psql process spawned'));
    return psql;
}
exports.execPSQL = execPSQL;
async function waitForPSQLExit(psql) {
    let errorToThrow = null;
    try {
        const [exitCode] = await (0, node_events_1.once)(psql, 'close');
        pgDebug(`psql exited with code ${exitCode}`);
        if (exitCode > 0) {
            errorToThrow = new Error(`psql exited with code ${exitCode}`);
        }
    }
    catch (error) {
        pgDebug('psql process error', error);
        const { code } = error;
        if (code === 'ENOENT') {
            errorToThrow = new Error('The local psql command could not be located. For help installing psql, see https://devcenter.heroku.com/articles/heroku-postgresql#local-setup');
        }
    }
    if (errorToThrow) {
        throw errorToThrow;
    }
}
exports.waitForPSQLExit = waitForPSQLExit;
// According to node.js docs, sending a kill to a process won't cause an error
// but could have unintended consequences if the PID gets reassigned:
// https://nodejs.org/docs/latest-v14.x/api/child_process.html#child_process_subprocess_kill_signal
// To be on the safe side, check if the process was already killed before sending the signal
function kill(childProcess, signal) {
    if (!childProcess.killed) {
        pgDebug('killing psql child process');
        childProcess.kill(signal);
    }
}
// trap SIGINT so that ctrl+c can be used by psql without killing the
// parent node process.
// you can use ctrl+c in psql to kill running queries
// while keeping the psql process open.
// This code is to stop the parent node process (heroku CLI)
// from exiting. If the parent Heroku CLI node process exits, then psql will exit as it
// is a child process of the Heroku CLI node process.
const trapAndForwardSignalsToChildProcess = (childProcess) => {
    const signalsToTrap = ['SIGINT'];
    const signalTraps = signalsToTrap.map(signal => {
        process.removeAllListeners(signal);
        const listener = () => kill(childProcess, signal);
        process.on(signal, listener);
        return [signal, listener];
    });
    // restores the built-in node ctrl+c and other handlers
    return () => {
        signalTraps.forEach(([signal, listener]) => {
            process.removeListener(signal, listener);
        });
    };
};
exports.trapAndForwardSignalsToChildProcess = trapAndForwardSignalsToChildProcess;
function consumeStream(inputStream) {
    let result = '';
    const throughStream = new node_stream_1.Stream.PassThrough();
    // eslint-disable-next-line no-async-promise-executor
    const promise = new Promise(async (resolve, reject) => {
        try {
            await (0, promises_1.finished)(throughStream);
            resolve(result);
        }
        catch (error) {
            reject(error);
        }
    });
    // eslint-disable-next-line no-return-assign
    throughStream.on('data', chunk => result += chunk.toString());
    inputStream.pipe(throughStream);
    return promise;
}
exports.consumeStream = consumeStream;
async function runWithTunnel(db, tunnelConfig, options) {
    const tunnel = await Tunnel.connect(db, tunnelConfig);
    pgDebug('after create tunnel');
    const psql = execPSQL(options);
    // interactive opens with stdio: 'inherit'
    // which gives the child process the same stdin,stdout,stderr of the node process (global `process`)
    // https://nodejs.org/api/child_process.html#child_process_options_stdio
    // psql.stdout will be null in this case
    // return a string for consistency but ideally we should return the child process from this function
    // and let the caller decide what to do with stdin/stdout/stderr
    const stdoutPromise = psql.stdout ? consumeStream(psql.stdout) : Promise.resolve('');
    const cleanupSignalTraps = (0, exports.trapAndForwardSignalsToChildProcess)(psql);
    try {
        pgDebug('waiting for psql or tunnel to exit');
        // wait for either psql or tunnel to exit;
        // the important bit is that we ensure both processes are
        // always cleaned up in the `finally` block below
        await Promise.race([
            waitForPSQLExit(psql),
            tunnel.waitForClose(),
        ]);
    }
    catch (error) {
        pgDebug('wait for psql or tunnel error', error);
        throw error;
    }
    finally {
        pgDebug('begin tunnel cleanup');
        cleanupSignalTraps();
        tunnel.close();
        kill(psql, 'SIGKILL');
        pgDebug('end tunnel cleanup');
    }
    return stdoutPromise;
}
exports.runWithTunnel = runWithTunnel;
// a small wrapper around tunnel-ssh
// so that other code doesn't have to worry about
// whether there is or is not a tunnel
class Tunnel {
    constructor(bastionTunnel) {
        this.bastionTunnel = bastionTunnel;
        this.events = new node_events_1.EventEmitter();
    }
    async waitForClose() {
        if (this.bastionTunnel) {
            try {
                pgDebug('wait for tunnel close');
                await (0, node_events_1.once)(this.bastionTunnel, 'close');
                pgDebug('tunnel closed');
            }
            catch (error) {
                pgDebug('tunnel close error', error);
                throw new Error('Secure tunnel to your database failed');
            }
        }
        else {
            pgDebug('no bastion required; waiting for fake close event');
            await (0, node_events_1.once)(this.events, 'close');
        }
    }
    close() {
        if (this.bastionTunnel) {
            pgDebug('close tunnel');
            this.bastionTunnel.close();
        }
        else {
            pgDebug('no tunnel necessary; sending fake close event');
            this.events.emit('close', 0);
        }
    }
    static async connect(db, tunnelConfig) {
        const tunnel = await (0, bastion_1.sshTunnel)(db, tunnelConfig);
        return new Tunnel(tunnel);
    }
}
exports.Tunnel = Tunnel;
async function fetchVersion(db) {
    var _a;
    const output = await exec(db, 'SHOW server_version', ['-X', '-q']);
    return (_a = output.match(/[0-9]{1,}\.[0-9]{1,}/)) === null || _a === void 0 ? void 0 : _a[0];
}
exports.fetchVersion = fetchVersion;
async function exec(db, query, cmdArgs = []) {
    const configs = (0, bastion_1.getConfigs)(db);
    const options = psqlQueryOptions(query, configs.dbEnv, cmdArgs);
    return runWithTunnel(db, configs.dbTunnelConfig, options);
}
exports.exec = exec;
async function execFile(db, file) {
    const configs = (0, bastion_1.getConfigs)(db);
    const options = psqlFileOptions(file, configs.dbEnv);
    return runWithTunnel(db, configs.dbTunnelConfig, options);
}
exports.execFile = execFile;
async function interactive(db) {
    const name = db.attachment.name;
    const prompt = `${db.attachment.app.name}::${name}%R%# `;
    const configs = (0, bastion_1.getConfigs)(db);
    configs.dbEnv.PGAPPNAME = 'psql interactive'; // default was 'psql non-interactive`
    const options = psqlInteractiveOptions(prompt, configs.dbEnv);
    return runWithTunnel(db, configs.dbTunnelConfig, options);
}
exports.interactive = interactive;
