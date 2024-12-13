"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const spaces_1 = require("../../lib/spaces/spaces");
const completions_1 = require("../../lib/autocomplete/completions");
const parsers_1 = require("../../lib/spaces/parsers");
class Create extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Create);
        const { channel, region, features, generation, 'log-drain-url': logDrainUrl, shield, cidr, 'kpi-url': kpiUrl, 'data-cidr': dataCidr, team } = flags;
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default) `
        Space name required.
        USAGE: heroku spaces:create --space my-space --team my-team
      `);
        }
        const dollarAmountMonthly = shield ? '$3000' : '$1000';
        const dollarAmountHourly = shield ? '$4.17' : '$1.39';
        const spaceType = shield ? 'Shield' : 'Standard';
        if (generation === 'fir') {
            core_1.ux.warn((0, tsheredoc_1.default) `
        Fir Pilot Features
        Fir is currently a pilot service that is subject to the Beta Services Terms
        (https://www.salesforce.com/company/legal/) or a written Unified Pilot Agreement
        if executed by Customer, and applicable terms in the Product Terms Directory
        (https://ptd.salesforce.com/?_ga=2.247987783.1372150065.1709219475-629000709.1639001992).
        Use of this pilot or beta service is at the Customer's sole discretion.

        Please note that we’re actively developing and adding new features, and not all
        existing features are currently available. See the Dev Center
        (https://devcenter.heroku.com/articles/generations) for more info.
      `);
        }
        core_1.ux.action.start(`Creating space ${color_1.default.green(spaceName)} in team ${color_1.default.cyan(team)}`);
        const { body: space } = await this.heroku.post('/spaces', {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
            body: {
                channel_name: channel,
                cidr,
                data_cidr: dataCidr,
                features: (0, parsers_1.splitCsv)(features),
                generation,
                kpi_url: kpiUrl,
                log_drain_url: logDrainUrl,
                name: spaceName,
                region,
                shield,
                team,
            },
        });
        core_1.ux.action.stop();
        core_1.ux.warn(`${color_1.default.bold('Spend Alert.')} During the limited GA period, each Heroku ${spaceType} Private Space costs ~${dollarAmountHourly}/hour (max ${dollarAmountMonthly}/month), pro-rated to the second.`);
        core_1.ux.warn(`Use ${color_1.default.cmd('heroku spaces:wait')} to track allocation.`);
        core_1.ux.styledHeader(space.name);
        core_1.ux.styledObject({
            ID: space.id, Team: space.team.name, Region: space.region.name, CIDR: space.cidr, 'Data CIDR': space.data_cidr, State: space.state, Shield: (0, spaces_1.displayShieldState)(space), Generation: space.generation, 'Created at': space.created_at,
        }, ['ID', 'Team', 'Region', 'CIDR', 'Data CIDR', 'State', 'Shield', 'Generation', 'Created at']);
    }
}
exports.default = Create;
Create.topic = 'spaces';
Create.description = (0, tsheredoc_1.default) `
    create a new space
  `;
Create.examples = [(0, tsheredoc_1.default) `
    Example:

    $ heroku spaces:create --space my-space --team my-team --region oregon
    Creating space my-space in team my-team... done
    === my-space
    ID:         e7b99e37-69b3-4475-ad47-a5cc5d75fd9f
    Team:       my-team
    Region:     oregon
    CIDR:       10.0.0.0/16
    Data CIDR:  172.23.0.0/20
    State:      allocating
    Generation: cedar
    Created at: 2016-01-06T03:23:13Z
  `];
Create.flags = {
    channel: command_1.flags.string({ hidden: true }),
    cidr: command_1.flags.string({ description: 'RFC-1918 CIDR the space will use' }),
    'data-cidr': command_1.flags.string({ description: 'RFC-1918 CIDR used by Heroku Data resources for the space' }),
    features: command_1.flags.string({ hidden: true, description: 'a list of features separated by commas' }),
    generation: command_1.flags.string({ description: 'generation for space', default: 'cedar', options: ['cedar', 'fir'] }),
    'kpi-url': command_1.flags.string({ hidden: true, description: 'self-managed KPI endpoint to use' }),
    'log-drain-url': command_1.flags.string({ hidden: true, description: 'direct log drain url' }),
    region: command_1.flags.string({ description: 'region name', completion: completions_1.RegionCompletion }),
    shield: command_1.flags.boolean({ hidden: true, description: 'create a Shield space' }),
    space: command_1.flags.string({ char: 's', description: 'name of space to create' }),
    team: command_1.flags.team({ required: true }),
};
Create.args = {
    space: core_1.Args.string({ hidden: true }),
};
