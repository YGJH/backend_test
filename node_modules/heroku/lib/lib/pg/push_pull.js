"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyExtensionsMatch = exports.spawnPipe = exports.connArgs = exports.maybeTunnel = exports.prepare = exports.parseExclusions = void 0;
const psql_1 = require("./psql");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const bastion_1 = require("./bastion");
const node_child_process_1 = require("node:child_process");
const tsheredoc_1 = require("tsheredoc");
const debug_1 = require("debug");
const debug = (0, debug_1.default)('pg:push-pull');
const parseExclusions = (rawExcludeList) => {
    return (rawExcludeList || '')
        .split(';').map(excl => excl.trim())
        .filter(texcl => texcl !== '');
};
exports.parseExclusions = parseExclusions;
const prepare = async (target) => {
    if (target.host === 'localhost' || !target.host) {
        exec(`createdb ${(0, exports.connArgs)(target, true).join(' ')}`);
    }
    else {
        // N.B.: we don't have a proper postgres driver and we don't want to rely on overriding
        // possible .psqlrc output configurations, so we generate a random marker that is returned
        // from the query. We avoid including it verbatim in the query text in case the equivalent
        // of --echo-all is set.
        const num = Math.random();
        const emptyMarker = `${num}${num}`;
        const result = await (0, psql_1.exec)(target, `SELECT CASE count(*) WHEN 0 THEN '${num}' || '${num}' END FROM pg_stat_user_tables`);
        if (!result.includes(emptyMarker))
            core_1.ux.error(`Remote database is not empty. Please create a new database or use ${color_1.color.cmd('heroku pg:reset')}`);
    }
};
exports.prepare = prepare;
const maybeTunnel = async (herokuDb) => {
    var _a;
    let withTunnel = Object.assign({}, herokuDb);
    const configs = (0, bastion_1.getConfigs)(herokuDb);
    const tunnel = await (0, bastion_1.sshTunnel)(herokuDb, configs.dbTunnelConfig);
    if (tunnel) {
        const tunnelHost = {
            host: configs.dbTunnelConfig.localHost,
            port: (_a = configs.dbTunnelConfig.localPort) === null || _a === void 0 ? void 0 : _a.toString(),
            _tunnel: tunnel,
        };
        withTunnel = Object.assign(withTunnel, tunnelHost);
    }
    return withTunnel;
};
exports.maybeTunnel = maybeTunnel;
const connArgs = (uri, skipDFlag = false) => {
    const args = [];
    if (uri.user)
        args.push('-U', uri.user);
    if (uri.host)
        args.push('-h', uri.host);
    if (uri.port)
        args.push('-p', uri.port);
    if (!skipDFlag)
        args.push('-d');
    args.push(uri.database);
    return args;
};
exports.connArgs = connArgs;
const exec = (cmd, opts = {}) => {
    debug(cmd);
    opts = Object.assign({}, opts, { stdio: 'inherit' });
    try {
        return (0, node_child_process_1.execSync)(cmd, opts);
    }
    catch (error) {
        const { status } = error;
        if (status)
            process.exit(status);
        throw error;
    }
};
const spawnPipe = async (pgDump, pgRestore) => {
    return new Promise((resolve, reject) => {
        const dumpStdout = pgDump.stdout;
        const restoreStdin = pgRestore.stdin;
        dumpStdout.pipe(restoreStdin);
        pgDump.on('close', code => code ? reject(new Error(`pg_dump errored with ${code}`)) : restoreStdin.end());
        pgRestore.on('close', code => code ? reject(new Error(`pg_restore errored with ${code}`)) : resolve());
    });
};
exports.spawnPipe = spawnPipe;
const verifyExtensionsMatch = async function (source, target) {
    // It's pretty common for local DBs to not have extensions available that
    // are used by the remote app, so take the final precaution of warning if
    // the extensions available in the local database don't match. We don't
    // report it if the difference is solely in the version of an extension
    // used, though.
    const sql = 'SELECT extname FROM pg_extension ORDER BY extname;';
    const [extensionTarget, extensionSource] = await Promise.all([
        (0, psql_1.exec)(target, sql),
        (0, psql_1.exec)(source, sql),
    ]);
    const extensions = {
        target: extensionTarget,
        source: extensionSource,
    };
    // TODO: it shouldn't matter if the target has *more* extensions than the source
    if (extensions.target !== extensions.source) {
        core_1.ux.warn((0, tsheredoc_1.default) `
      Extensions in newly created target database differ from existing source database.
      Target extensions:
    ` + extensions.target + (0, tsheredoc_1.default) `
      Source extensions:
    ` + extensions.source + (0, tsheredoc_1.default) `
      HINT: You should review output to ensure that any errors
      ignored are acceptable - entire tables may have been missed, where a dependency
      could not be resolved. You may need to install a postgresql-contrib package
      and retry.
    `);
    }
};
exports.verifyExtensionsMatch = verifyExtensionsMatch;
