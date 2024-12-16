"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("@oclif/core/lib/util");
const tsheredoc_1 = require("tsheredoc");
const fetcher_1 = require("../../lib/pg/fetcher");
const host_1 = require("../../lib/pg/host");
const util_2 = require("../../lib/pg/util");
const color_1 = require("@heroku-cli/color");
const uuid_validate_1 = require("../../lib/utils/uuid-validate");
const PGDIAGNOSE_HOST = process.env.PGDIAGNOSE_URL || 'pgdiagnose.herokai.com';
class Diagnose extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Diagnose);
        const id = args['DATABASE|REPORT_ID'];
        let report;
        if (id && (0, uuid_validate_1.uuidValidate)(id)) {
            ({ body: report } = await this.heroku.get(`/reports/${encodeURIComponent(id)}`, { hostname: PGDIAGNOSE_HOST }));
        }
        else {
            report = await this.generateReport(id, flags.app);
        }
        this.displayReport(report, flags.json);
    }
    displayReport(report, json) {
        if (json) {
            core_1.ux.styledJSON(report);
            return;
        }
        core_1.ux.log(`Report ${report.id} for ${report.app}::${report.database}\navailable for one month after creation on ${report.created_at}\n`);
        this.display(report.checks.filter(c => c.status === 'red'));
        this.display(report.checks.filter(c => c.status === 'yellow'));
        this.display(report.checks.filter(c => c.status === 'green'));
        this.display(report.checks.filter(c => !['red', 'yellow', 'green'].includes(c.status)));
    }
    display(checks) {
        checks.forEach(check => {
            var _a;
            const colorFn = color_1.default[check.status] || ((txt) => txt);
            core_1.ux.log(colorFn(`${check.status.toUpperCase()}: ${check.name}`));
            const isNonEmptyArray = Array.isArray(check.results) && check.results.length > 0;
            const resultsKeys = Object.keys((_a = check.results) !== null && _a !== void 0 ? _a : {});
            if (check.status === 'green' || (!isNonEmptyArray && resultsKeys.length === 0)) {
                return;
            }
            if (isNonEmptyArray) {
                const keys = Object.keys(check.results[0]);
                const cols = {};
                keys.forEach(key => {
                    cols[(0, util_1.capitalize)(key)] = {
                        get: (row) => row[key],
                    };
                });
                core_1.ux.table(check.results, cols);
            }
            else {
                const [key] = resultsKeys;
                core_1.ux.log(`${key.split('_')
                    .map(s => (0, util_1.capitalize)(s))
                    .join(' ')} ${check.results[key]}`);
            }
        });
    }
    async generateParams(url, db, dbName) {
        const base_params = {
            url,
            plan: db.plan.name.split(':')[1],
            app: db.app.name,
            database: dbName,
        };
        if (!(0, util_2.essentialPlan)(db)) {
            const { body: metrics } = await this.heroku.get(`/client/v11/databases/${db.id}/metrics`, { hostname: (0, host_1.default)() });
            base_params.metrics = metrics;
            const { body: burstData } = await this.heroku.get(`/client/v11/databases/${db.id}/burst_status`, { hostname: (0, host_1.default)() });
            if (burstData && Object.keys(burstData).length > 0) {
                base_params.burst_data_present = true;
                base_params.burst_status = burstData.burst_status;
            }
        }
        return base_params;
    }
    async generateReport(database, app) {
        const attachment = await (0, fetcher_1.getAttachment)(this.heroku, app, database);
        const { addon: db } = attachment;
        const { body: config } = await this.heroku.get(`/apps/${app}/config-vars`);
        const { url } = (0, util_2.getConnectionDetails)(attachment, config);
        const dbName = (0, util_2.getConfigVarNameFromAttachment)(attachment, config);
        const body = await this.generateParams(url, db, dbName);
        const { body: report } = await this.heroku.post('/reports', { hostname: PGDIAGNOSE_HOST, body });
        return report;
    }
}
exports.default = Diagnose;
Diagnose.topic = 'pg';
Diagnose.description = (0, tsheredoc_1.default)(`
    run or view diagnostics report
    defaults to DATABASE_URL database if no DATABASE is specified
    if REPORT_ID is specified instead, a previous report is displayed

    `);
Diagnose.flags = {
    json: command_1.flags.boolean({ description: 'format output as JSON' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Diagnose.args = {
    'DATABASE|REPORT_ID': core_1.Args.string({ description: 'config var exposed to the owning app containing the database URL or the report ID' }),
};
