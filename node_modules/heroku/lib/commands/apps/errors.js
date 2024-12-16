"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const error_info_1 = require("../../lib/apps/error_info");
const colorize = (level, s) => {
    switch (level) {
        case 'critical':
            return color_1.default.red(s);
        case 'warning':
            return color_1.default.yellow(s);
        case 'info':
            return color_1.default.cyan(s);
        default:
            return s;
    }
};
function buildErrorTable(errors, source) {
    return Object.keys(errors).map(name => {
        const count = errors[name];
        const info = error_info_1.default.find(e => e.name === name);
        if (info) {
            return { name, count, source, level: info.level, title: info.title };
        }
        return { name, count, source, level: 'critical', title: 'unknown error' };
    });
}
const sumErrors = (errors) => {
    const summed = {};
    Object.keys(errors.data).forEach(key => {
        summed[key] = (0, lodash_1.sum)(errors.data[key]);
    });
    return summed;
};
class Errors extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Errors);
        const hours = Number.parseInt(flags.hours, 10);
        const NOW = new Date().toISOString();
        const YESTERDAY = new Date(Date.now() - (hours * 60 * 60 * 1000)).toISOString();
        const DATE_QUERY = `start_time=${YESTERDAY}&end_time=${NOW}&step=1h`;
        async function getAllDynoErrors(types) {
            const values = await Promise.all(types.map(dynoErrors));
            const memo = {};
            types.forEach((key, index) => {
                memo[key] = values[index];
            });
            return memo;
        }
        const routerErrors = () => {
            return this.heroku.get(`/apps/${flags.app}/router-metrics/errors?${DATE_QUERY}&process_type=web`, {
                hostname: 'api.metrics.herokai.com',
            }).then(({ body }) => sumErrors(body));
        };
        const dynoErrors = (type) => {
            return this.heroku.get(`/apps/${flags.app}/formation/${type}/metrics/errors?${DATE_QUERY}`, {
                hostname: 'api.metrics.herokai.com',
            }).catch(error => {
                const { http } = error;
                // eslint-disable-next-line prefer-regex-literals
                const match = new RegExp('^invalid process_type provided', 'i');
                if (http && http.statusCode === 400 && http.body && http.body.message && match.test(http.body.message)) {
                    return { body: { data: {} } };
                }
                throw error;
            }).then(rsp => {
                const { body } = rsp;
                return sumErrors(body);
            });
        };
        const { body: formation } = await this.heroku.get(`/apps/${flags.app}/formation`);
        const types = formation.map((p) => p.type);
        const showDyno = flags.dyno || !flags.router;
        const showRouter = flags.router || !flags.dyno;
        const noDynoEmpty = Promise.resolve({});
        const noRouterEmpty = Promise.resolve({});
        const [dyno, router] = await Promise.all([
            showDyno ? getAllDynoErrors(types) : noDynoEmpty,
            showRouter ? routerErrors() : noRouterEmpty,
        ]);
        const errors = {
            dyno,
            router,
        };
        if (flags.json) {
            core_1.ux.styledJSON(errors);
        }
        else {
            let t = buildErrorTable(errors.router, 'router');
            for (const type of Object.keys(errors.dyno)) {
                t = t.concat(buildErrorTable(dyno[type], type));
            }
            if (t.length === 0) {
                core_1.ux.log(`No errors on ${color_1.default.app(flags.app)} in the last ${hours} hours`);
            }
            else {
                core_1.ux.styledHeader(`Errors on ${color_1.default.app(flags.app)} in the last ${hours} hours`);
                core_1.ux.table(t, {
                    source: {},
                    name: { get: ({ name, level }) => colorize(level, name) },
                    level: { get: ({ level }) => colorize(level, level) },
                    title: { header: 'Desc' },
                    count: {},
                });
            }
        }
    }
}
exports.default = Errors;
Errors.description = 'view app errors';
Errors.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ description: 'output in json format' }),
    hours: command_1.flags.string({ description: 'number of hours to look back (default 24)', default: '24' }),
    router: command_1.flags.boolean({ description: 'show only router errors' }),
    dyno: command_1.flags.boolean({ description: 'show only dyno errors' }),
};
