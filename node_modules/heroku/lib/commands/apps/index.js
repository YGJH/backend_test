"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
const _ = require("lodash");
const color_1 = require("@heroku-cli/color");
const completions_1 = require("@heroku-cli/command/lib/completions");
function annotateAppName(app) {
    let name = `${app.name}`;
    if (app.locked && app.internal_routing) {
        name = `${app.name} [internal/locked]`;
    }
    else if (app.locked) {
        name = `${app.name} [locked]`;
    }
    else if (app.internal_routing) {
        name = `${app.name} [internal]`;
    }
    return name;
}
function regionizeAppName(app) {
    const name = annotateAppName(app);
    if (app.region && app.region.name !== 'us') {
        return `${name} (${color_1.default.green(app.region.name)})`;
    }
    return name;
}
function listApps(apps) {
    apps.forEach((app) => core_1.ux.log(regionizeAppName(app)));
}
function print(apps, user, space, team) {
    if (apps.length === 0) {
        if (space)
            core_1.ux.log(`There are no apps in space ${color_1.default.green(space)}.`);
        else if (team)
            core_1.ux.log(`There are no apps in team ${color_1.default.magenta(team)}.`);
        else
            core_1.ux.log('You have no apps.');
    }
    else if (space) {
        core_1.ux.styledHeader(`Apps in space ${color_1.default.green(space)}`);
        listApps(apps);
    }
    else if (team) {
        core_1.ux.styledHeader(`Apps in team ${color_1.default.magenta(team)}`);
        listApps(apps);
    }
    else {
        apps = _.partition(apps, (app) => app.owner.email === user.email);
        if (apps[0].length > 0) {
            core_1.ux.styledHeader(`${color_1.default.cyan(user.email)} Apps`);
            listApps(apps[0]);
        }
        const columns = {
            name: { get: regionizeAppName },
            email: { get: ({ owner }) => owner.email },
        };
        if (apps[1].length > 0) {
            core_1.ux.styledHeader('Collaborated Apps');
            core_1.ux.table(apps[1], columns, { 'no-header': true });
        }
    }
}
class AppsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(AppsIndex);
        const teamIdentifier = flags.team;
        let team = (!flags.personal && teamIdentifier) ? teamIdentifier : null;
        const space = flags.space;
        const internalRouting = flags['internal-routing'];
        if (space) {
            const teamResponse = await this.heroku.get(`/spaces/${space}`);
            team = teamResponse.body.team.name;
        }
        let path = '/users/~/apps';
        if (team)
            path = `/teams/${team}/apps`;
        else if (flags.all)
            path = '/apps';
        const [appsResponse, userResponse] = await Promise.all([
            this.heroku.get(path),
            this.heroku.get('/account'),
        ]);
        let apps = appsResponse.body;
        const user = userResponse.body;
        apps = _.sortBy(apps, 'name');
        if (space) {
            apps = apps.filter((a) => a.space && (a.space.name === space || a.space.id === space));
        }
        if (internalRouting) {
            apps = apps.filter((a) => a.internal_routing);
        }
        if (flags.json) {
            core_1.ux.styledJSON(apps);
        }
        else {
            print(apps, user, space, team);
        }
    }
}
exports.default = AppsIndex;
AppsIndex.description = 'list your apps';
AppsIndex.topic = 'apps';
AppsIndex.hiddenAliases = ['list', 'apps:list'];
AppsIndex.examples = [
    '$ heroku apps',
];
AppsIndex.flags = {
    all: command_1.flags.boolean({ char: 'A', description: 'include apps in all teams' }),
    json: command_1.flags.boolean({ char: 'j', description: 'output in json format' }),
    space: command_1.flags.string({
        char: 's',
        description: 'filter by space',
        completion: completions_1.SpaceCompletion,
    }),
    personal: command_1.flags.boolean({ char: 'p', description: 'list apps in personal account when a default team is set' }),
    'internal-routing': command_1.flags.boolean({ char: 'i', description: 'filter to Internal Web Apps', hidden: true }),
    team: command_1.flags.team(),
};
