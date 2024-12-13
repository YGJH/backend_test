"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const host_1 = require("./host");
const bytes = require("bytes");
function prefix(transfer) {
    if (transfer.from_type === 'pg_dump') {
        if (transfer.to_type === 'pg_restore') {
            return 'c';
        }
        return transfer.schedule ? 'a' : 'b';
        // eslint-disable-next-line no-else-return
    }
    else {
        if (transfer.to_type === 'pg_restore') {
            return 'r';
        }
        return 'b';
    }
}
class Backups {
    constructor(app, heroku) {
        this.logsAlreadyShown = new Set();
        this.status = (transfer) => {
            if (transfer.finished_at && transfer.succeeded) {
                const warnings = transfer.warnings;
                if (warnings > 0) {
                    return `Finished with ${warnings} warnings`;
                }
                return `Completed ${transfer.finished_at}`;
            }
            if (transfer.finished_at) {
                return `Failed ${transfer.finished_at}`;
            }
            if (transfer.started_at) {
                return `Running (processed ${this.filesize(transfer.processed_bytes)})`;
            }
            return 'Pending';
        };
        this.num = async (name) => {
            let m = name.match(/^[abcr](\d+)$/);
            if (m)
                return Number.parseInt(m[1], 10);
            m = name.match(/^o[ab]\d+$/);
            if (m) {
                const { body: transfers } = await this.heroku.get(`/client/v11/apps/${this.app}/transfers`, { hostname: (0, host_1.default)() });
                const transfer = transfers.find(t => this.name(t) === name);
                if (transfer)
                    return transfer.num;
            }
        };
        this.name = (transfer) => {
            const oldPGBName = transfer.options && transfer.options.pgbackups_name;
            if (oldPGBName)
                return `o${oldPGBName}`;
            return `${prefix(transfer)}${(transfer.num || '').toString().padStart(3, '0')}`;
        };
        this.wait = async (action, transferID, interval, verbose, app) => {
            var e_1, _a;
            if (verbose) {
                core_1.ux.log(`${action}...`);
            }
            core_1.ux.action.start(action);
            try {
                try {
                    for (var _b = tslib_1.__asyncValues(this.poll(transferID, interval, verbose, app || this.app)), _c; _c = await _b.next(), !_c.done;) {
                        const backupSucceeded = _c.value;
                        if (backupSucceeded) {
                            core_1.ux.action.stop();
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            catch (error) {
                core_1.ux.action.stop('!');
                core_1.ux.error(error);
            }
        };
        this.app = app;
        this.heroku = heroku;
    }
    filesize(size, opts = {}) {
        Object.assign(opts, {
            decimalPlaces: 2,
            fixedDecimals: true,
        });
        return bytes(size, opts);
    }
    displayLogs(logs) {
        for (const log of logs) {
            if (this.logsAlreadyShown.has(log.created_at + log.message)) {
                continue;
            }
            this.logsAlreadyShown.add(log.created_at + log.message);
            core_1.ux.log(`${log.created_at} ${log.message}`);
        }
    }
    poll(transferID, interval, verbose, appId) {
        var _a;
        return tslib_1.__asyncGenerator(this, arguments, function* poll_1() {
            const tty = process.env.TERM !== 'dumb' && process.stderr.isTTY;
            let backup = {};
            let failures = 0;
            const quietUrl = `/client/v11/apps/${appId !== null && appId !== void 0 ? appId : this.app}/transfers/${transferID}`;
            const verboseUrl = quietUrl + '?verbose=true';
            const url = verbose ? verboseUrl : quietUrl;
            while (failures < 21) {
                try {
                    ({ body: backup } = yield tslib_1.__await(this.heroku.get(url, { hostname: (0, host_1.default)() })));
                }
                catch (error) {
                    if (failures++ > 20) {
                        throw error;
                    }
                }
                if (verbose) {
                    this.displayLogs(backup.logs);
                }
                else if (tty) {
                    const msg = backup.started_at ? this.filesize(backup.processed_bytes) : 'pending';
                    const log = (_a = backup.logs) === null || _a === void 0 ? void 0 : _a.pop();
                    if (log) {
                        core_1.ux.action.status = `${msg}\n${log.created_at + ' ' + log.message}`;
                    }
                    else {
                        core_1.ux.action.status = msg;
                    }
                }
                if (backup === null || backup === void 0 ? void 0 : backup.finished_at) {
                    if (backup.succeeded) {
                        yield yield tslib_1.__await(true);
                        break;
                    }
                    // logs is undefined unless verbose=true is passed
                    ({ body: backup } = yield tslib_1.__await(this.heroku.get(verboseUrl, { hostname: (0, host_1.default)() })));
                    throw new Error((0, tsheredoc_1.default)(`
          An error occurred and the backup did not finish.

          ${backup.logs.slice(-5).map(l => l.message).join('\n')}

          Run ${color_1.default.cmd('heroku pg:backups:info ' + this.name(backup))} for more details.`));
                }
                yield yield tslib_1.__await(new Promise(resolve => {
                    setTimeout(resolve, interval * 1000);
                }));
            }
        });
    }
}
function factory(app, heroku) {
    return new Backups(app, heroku);
}
exports.default = factory;
