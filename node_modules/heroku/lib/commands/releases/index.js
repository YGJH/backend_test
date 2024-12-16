"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const statusHelper = require("../../lib/releases/status_helper");
const time = require("../../lib/time");
const stripAnsi = require("strip-ansi");
const getDescriptionTruncation = function (releases, columns, optimizeKey) {
    // width management here is quite opaque.
    // This entire function is to determine how much of Formation.description should be truncated to accommodate for Formation.status. They both go in the same column.
    // Nothing else is truncated and the table is passed `'no-truncate': true` in options.
    let optimizationWidth = 0;
    const optimizationWidthMap = {};
    for (const key of Object.keys(columns)) {
        optimizationWidthMap[key] = 0;
    }
    for (const row of releases) {
        for (const colKey in row) {
            if (colKey === optimizeKey) {
                continue;
            }
            for (const [key, col] of Object.entries(columns)) {
                const parts = key.split('.');
                const matchKey = parts[0];
                if (matchKey !== colKey) {
                    continue;
                }
                let colValue = row;
                for (const part of parts) {
                    colValue = colValue[part];
                }
                let formattedValue;
                if (col.get) {
                    formattedValue = col.get(row);
                }
                else {
                    formattedValue = colValue.toString();
                }
                if (key !== optimizeKey) {
                    optimizationWidthMap[key] = Math.max(optimizationWidthMap[key], stripAnsi(formattedValue).length);
                }
            }
        }
    }
    for (const key of Object.keys(columns)) {
        if (key !== optimizeKey) {
            optimizationWidth += optimizationWidthMap[key] + 2;
        }
    }
    return optimizationWidth;
};
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const { app, num, json, extended } = flags;
        const url = `/apps/${app}/releases${extended ? '?extended=true' : ''}`;
        const { body: releases } = await this.heroku.request(url, {
            partial: true,
            headers: {
                Range: `version ..; max=${num || 15}, order=desc`,
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        let optimizationWidth = 0;
        const descriptionWithStatus = function (release) {
            const { description } = release;
            const width = () => { var _a; return ((_a = process.stdout) === null || _a === void 0 ? void 0 : _a.columns) && process.stdout.columns > 80 ? process.stdout.columns : 80; };
            const trunc = (l, s) => {
                if (process.stdout.isTTY) {
                    return (0, lodash_1.truncate)(s, { length: width() - (optimizationWidth + l), omission: '…' });
                }
                return s;
            };
            const status = statusHelper.description(release);
            if (status) {
                const sc = color_1.default[statusHelper.color(release.status)](status);
                return trunc(status.length + 1, description) + ' ' + sc;
            }
            return trunc(0, description);
        };
        const columns = {
            // column name "v" as ux.table will make it's width at least "version" even though 'no-header': true
            v: { get: release => color_1.default[statusHelper.color(release.status)]('v' + release.version) },
            description: { get: descriptionWithStatus },
            user: { get: ({ user }) => color_1.default.magenta((user === null || user === void 0 ? void 0 : user.email) || '') },
            created_at: { get: ({ created_at }) => time.ago(new Date(created_at || '')) },
            slug_id: { extended: true, get: ({ extended }) => extended === null || extended === void 0 ? void 0 : extended.slug_id },
            slug_uuid: { extended: true, get: ({ extended }) => extended === null || extended === void 0 ? void 0 : extended.slug_uuid },
        };
        // `getDescriptionTruncation` is dependent on `columns` being defined and thus `descriptionWithStatus`.
        // `descriptionWithStatus` requires `optimizationWidth` to be defined. Redefine here before `descriptionWithStatus` is actually called.
        optimizationWidth = getDescriptionTruncation(releases, columns, 'description');
        if (json) {
            core_1.ux.log(JSON.stringify(releases, null, 2));
        }
        else if (releases.length === 0) {
            core_1.ux.log(`${app} has no releases.`);
        }
        else {
            let header = `${app} Releases`;
            const currentRelease = releases.find(r => r.current === true);
            if (currentRelease) {
                header += ' - ' + color_1.default.cyan(`Current: v${currentRelease.version}`);
            }
            core_1.ux.styledHeader(header);
            core_1.ux.table(releases, columns, { 'no-header': true, 'no-truncate': true, extended });
        }
    }
}
exports.default = Index;
Index.topic = 'releases';
Index.description = 'display the releases for an app';
Index.examples = [
    'v1 Config add FOO_BAR email@example.com 2015/11/17 17:37:41 (~ 1h ago)',
    'v2 Config add BAR_BAZ email@example.com 2015/11/17 17:37:41 (~ 1h ago)',
    'v3 Config add BAZ_QUX email@example.com 2015/11/17 17:37:41 (~ 1h ago)',
];
Index.flags = {
    num: command_1.flags.string({ char: 'n', description: 'number of releases to show' }),
    json: command_1.flags.boolean({ description: 'output releases in json format' }),
    extended: command_1.flags.boolean({ char: 'x', hidden: true }),
    remote: command_1.flags.remote(),
    app: command_1.flags.app({ required: true }),
};
