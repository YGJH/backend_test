"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable complexity */
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const fetcher_1 = require("../../lib/pg/fetcher");
const host_1 = require("../../lib/pg/host");
const nls_1 = require("../../nls");
class Promote extends command_1.Command {
    async run() {
        var _a, _b, _c;
        const { flags, args } = await this.parse(Promote);
        const { force, app } = flags;
        const { database } = args;
        const attachment = await (0, fetcher_1.getAttachment)(this.heroku, app, database);
        core_1.ux.action.start(`Ensuring an alternate alias for existing ${color_1.default.green('DATABASE_URL')}`);
        const { body: attachments } = await this.heroku.get(`/apps/${app}/addon-attachments`);
        const current = attachments.find(a => a.name === 'DATABASE');
        if (current) {
            // eslint-disable-next-line eqeqeq
            if (((_a = current.addon) === null || _a === void 0 ? void 0 : _a.name) === attachment.addon.name && current.namespace == attachment.namespace) {
                if (attachment.namespace) {
                    core_1.ux.error(`${color_1.default.cyan(attachment.name)} is already promoted on ${color_1.default.app(app)}`);
                }
                else {
                    core_1.ux.error(`${color_1.default.addon(attachment.addon.name)} is already promoted on ${color_1.default.app(app)}`);
                }
            }
            const existing = attachments.filter(a => { var _a, _b; return ((_a = a.addon) === null || _a === void 0 ? void 0 : _a.id) === ((_b = current.addon) === null || _b === void 0 ? void 0 : _b.id) && a.namespace === current.namespace; })
                .find(a => a.name !== 'DATABASE');
            if (existing) {
                core_1.ux.action.stop(color_1.default.green(existing.name + '_URL'));
            }
            else {
                // The current add-on occupying the DATABASE attachment has no
                // other attachments. In order to promote this database without
                // error, we can create a secondary attachment, just-in-time.
                const { body: backup } = await this.heroku.post('/addon-attachments', {
                    body: {
                        app: { name: app },
                        addon: { name: (_b = current.addon) === null || _b === void 0 ? void 0 : _b.name },
                        namespace: current.namespace,
                        confirm: app,
                    },
                });
                core_1.ux.action.stop(color_1.default.green(backup.name + '_URL'));
            }
        }
        if (!force) {
            const { body: status } = await this.heroku.get(`/client/v11/databases/${attachment.addon.id}/wait_status`, {
                hostname: (0, host_1.default)(),
            });
            if (status['waiting?']) {
                core_1.ux.error((0, tsheredoc_1.default)(`
          Database cannot be promoted while in state: ${status.message}

          Promoting this database can lead to application errors and outage. Please run ${color_1.default.cmd('heroku pg:wait')} to wait for database to become available.

          To ignore this error, you can pass the --force flag to promote the database and risk application issues.
        `));
            }
        }
        let promotionMessage;
        if (attachment.namespace) {
            promotionMessage = `Promoting ${color_1.default.cyan(attachment.name)} to ${color_1.default.green('DATABASE_URL')} on ${color_1.default.app(app)}`;
        }
        else {
            promotionMessage = `Promoting ${color_1.default.addon(attachment.addon.name)} to ${color_1.default.green('DATABASE_URL')} on ${color_1.default.app(app)}`;
        }
        core_1.ux.action.start(promotionMessage);
        await this.heroku.post('/addon-attachments', {
            body: {
                name: 'DATABASE',
                app: { name: app },
                addon: { name: attachment.addon.name },
                namespace: attachment.namespace || null,
                confirm: app,
            },
        });
        core_1.ux.action.stop();
        const currentPooler = attachments.find(a => { var _a, _b; return a.namespace === 'connection-pooling:default' && ((_a = a.addon) === null || _a === void 0 ? void 0 : _a.id) === ((_b = current === null || current === void 0 ? void 0 : current.addon) === null || _b === void 0 ? void 0 : _b.id) && a.name === 'DATABASE_CONNECTION_POOL'; });
        if (currentPooler) {
            core_1.ux.action.start('Reattaching pooler to new leader');
            await this.heroku.post('/addon-attachments', {
                body: {
                    name: currentPooler.name,
                    app: { name: app },
                    addon: { name: attachment.addon.name },
                    namespace: 'connection-pooling:default',
                    confirm: app,
                },
            });
            core_1.ux.action.stop();
        }
        const { body: promotedDatabaseDetails } = await this.heroku.get(`/client/v11/databases/${attachment.addon.id}`, {
            hostname: (0, host_1.default)(),
        });
        if (promotedDatabaseDetails.following) {
            const unfollowLeaderCmd = `heroku pg:unfollow ${attachment.addon.name}`;
            core_1.ux.warn((0, tsheredoc_1.default)(`
        Your database has been promoted but it is currently a follower database in read-only mode.

        Promoting a database with ${color_1.default.cmd('heroku pg:promote')} doesn't automatically unfollow its leader.

        Use ${color_1.default.cmd(unfollowLeaderCmd)} to stop this follower from replicating from its leader (${color_1.default.yellow(promotedDatabaseDetails.leader)}) and convert it into a writable database.
      `));
        }
        const { body: formation } = await this.heroku.get(`/apps/${app}/formation`);
        const releasePhase = formation.find(process => process.type === 'release');
        if (releasePhase) {
            core_1.ux.action.start('Checking release phase');
            const { body: releases } = await this.heroku.get(`/apps/${app}/releases`, {
                partial: true,
                headers: {
                    Range: 'version ..; max=5, order=desc',
                },
            });
            const attach = releases.find(release => { var _a; return (_a = release.description) === null || _a === void 0 ? void 0 : _a.includes('Attach DATABASE'); });
            const detach = releases.find(release => { var _a; return (_a = release.description) === null || _a === void 0 ? void 0 : _a.includes('Detach DATABASE'); });
            if (!attach || !detach) {
                core_1.ux.error('Unable to check release phase. Check your Attach DATABASE release for failures.');
            }
            const endTime = Date.now() + 900000; // 15 minutes from now
            const [attachId, detachId] = [attach === null || attach === void 0 ? void 0 : attach.id, detach === null || detach === void 0 ? void 0 : detach.id];
            while (true) {
                const attach = await (0, fetcher_1.getRelease)(this.heroku, app, attachId);
                if (attach && attach.status === 'succeeded') {
                    let msg = 'pg:promote succeeded.';
                    const detach = await (0, fetcher_1.getRelease)(this.heroku, app, detachId);
                    if (detach && detach.status === 'failed') {
                        msg += ` It is safe to ignore the failed ${detach.description} release.`;
                    }
                    core_1.ux.action.stop(msg);
                    return;
                }
                if (attach && attach.status === 'failed') {
                    let msg = `pg:promote failed because ${attach.description} release was unsuccessful. Your application is currently running `;
                    const detach = await (0, fetcher_1.getRelease)(this.heroku, app, detachId);
                    if (detach && detach.status === 'succeeded') {
                        msg += 'without an attached DATABASE_URL.';
                    }
                    else {
                        msg += `with ${(_c = current === null || current === void 0 ? void 0 : current.addon) === null || _c === void 0 ? void 0 : _c.name} attached as DATABASE_URL.`;
                    }
                    msg += ' Check your release phase logs for failure causes.';
                    core_1.ux.action.stop(msg);
                    return;
                }
                if (Date.now() > endTime) {
                    core_1.ux.action.stop('timeout. Check your Attach DATABASE release for failures.');
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}
exports.default = Promote;
Promote.topic = 'pg';
Promote.description = 'sets DATABASE as your DATABASE_URL';
Promote.flags = {
    force: command_1.flags.boolean({ char: 'f' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Promote.args = {
    database: core_1.Args.string({ required: true, description: (0, nls_1.nls)('pg:database:arg:description') }),
};
