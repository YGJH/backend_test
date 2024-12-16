"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const tsheredoc_1 = require("tsheredoc");
const COST_MONTHLY = {
    Free: 0,
    Eco: 0,
    Hobby: 7,
    Basic: 7,
    'Standard-1X': 25,
    'Standard-2X': 50,
    'Performance-M': 250,
    Performance: 500,
    'Performance-L': 500,
    '1X': 36,
    '2X': 72,
    PX: 576,
    'Performance-L-RAM': 500,
    'Performance-XL': 750,
    'Performance-2XL': 1500,
};
const calculateHourly = (size) => COST_MONTHLY[size] / 720;
const emptyFormationErr = (app) => {
    return new Error(`No process types on ${app}.\nUpload a Procfile to add process types.\nhttps://devcenter.heroku.com/articles/procfile`);
};
const displayFormation = async (heroku, app) => {
    const { body: formation } = await heroku.get(`/apps/${app}/formation`);
    const { body: appProps } = await heroku.get(`/apps/${app}`);
    const shielded = appProps.space && appProps.space.shield;
    const dynoTotals = {};
    let isShowingEcoCostMessage = false;
    const formationTableData = (0, lodash_1.sortBy)(formation, 'type')
        // this filter shouldn't be necessary, but it makes TS happy
        .filter((f) => typeof f.size === 'string' && typeof f.quantity === 'number')
        .map((d => {
        if (d.size === 'Eco') {
            isShowingEcoCostMessage = true;
        }
        if (shielded) {
            d.size = d.size.replace('Private-', 'Shield-');
        }
        if (d.size in dynoTotals) {
            dynoTotals[d.size] += d.quantity;
        }
        else {
            dynoTotals[d.size] = d.quantity;
        }
        return {
            // this rule does not realize `size` isn't used on an array
            type: color_1.default.green(d.type || ''),
            size: color_1.default.cyan(d.size),
            qty: color_1.default.yellow(`${d.quantity}`),
            'cost/hour': calculateHourly(d.size) ?
                '~$' + (calculateHourly(d.size) * (d.quantity || 1)).toFixed(3)
                    .toString() :
                '',
            'max cost/month': COST_MONTHLY[d.size] ?
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                '$' + (COST_MONTHLY[d.size] * d.quantity).toString() :
                '',
        };
    }));
    const dynoTotalsTableData = Object.keys(dynoTotals)
        .map(k => ({
        type: color_1.default.green(k), total: color_1.default.yellow((dynoTotals[k]).toString()),
    }));
    if (formation.length === 0) {
        throw emptyFormationErr(app);
    }
    core_1.ux.styledHeader('Process Types');
    core_1.ux.table(formationTableData, {
        type: {},
        size: {},
        qty: {},
        'cost/hour': {},
        'max cost/month': {},
    });
    core_1.ux.log();
    core_1.ux.styledHeader('Dyno Totals');
    core_1.ux.table(dynoTotalsTableData, {
        type: {},
        total: {},
    });
    if (isShowingEcoCostMessage) {
        core_1.ux.log('\n$5 (flat monthly fee, shared across all Eco dynos)');
    }
};
class Type extends command_1.Command {
    async run() {
        const _a = await this.parse(Type), { flags } = _a, restParse = tslib_1.__rest(_a, ["flags"]);
        const argv = restParse.argv;
        const { app } = flags;
        const parse = async () => {
            if (!argv || argv.length === 0)
                return [];
            const { body: formation } = await this.heroku.get(`/apps/${app}/formation`);
            if (argv.some(a => a.match(/=/))) {
                return (0, lodash_1.compact)(argv.map(arg => {
                    const match = arg.match(/^([a-zA-Z0-9_]+)=([\w-]+)$/);
                    const type = match && match[1];
                    const size = match && match[2];
                    if (!type || !size || !formation.some(p => p.type === type)) {
                        throw new Error(`Type ${color_1.default.red(type || '')} not found in process formation.\nTypes: ${color_1.default.yellow(formation.map(f => f.type)
                            .join(', '))}`);
                    }
                    return { type, size };
                }));
            }
            return formation.map(p => ({ type: p.type, size: argv[0] }));
        };
        const changes = await parse();
        if (changes.length > 0) {
            core_1.ux.action.start(`Scaling dynos on ${color_1.default.magenta(app)}`);
            await this.heroku.patch(`/apps/${app}/formation`, { body: { updates: changes } });
            core_1.ux.action.stop();
        }
        await displayFormation(this.heroku, app);
    }
}
exports.default = Type;
Type.strict = false;
Type.description = (0, tsheredoc_1.default) `
    manage dyno sizes
    Called with no arguments shows the current dyno size.

    Called with one argument sets the size.
    Where SIZE is one of eco|basic|standard-1x|standard-2x|performance

    Called with 1..n TYPE=SIZE arguments sets the quantity per type.
  `;
Type.aliases = ['ps:resize', 'dyno:resize'];
Type.hiddenAliases = ['resize', 'dyno:type'];
Type.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
