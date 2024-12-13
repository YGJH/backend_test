"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const time_1 = require("../../lib/time");
const getProcessNum = (s) => Number.parseInt(s.split('.', 2)[1], 10);
class Ps extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Ps);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            throw new Error('Space name required.\nUSAGE: heroku spaces:ps my-space');
        }
        const [{ body: spaceDynos }, { body: space }] = await Promise.all([
            this.heroku.get(`/spaces/${spaceName}/dynos`),
            this.heroku.get(`/spaces/${spaceName}`),
        ]);
        if (space.shield) {
            spaceDynos.forEach(spaceDyno => {
                spaceDyno.dynos.forEach(d => {
                    var _a;
                    if ((_a = d.size) === null || _a === void 0 ? void 0 : _a.startsWith('Private')) {
                        d.size = d.size.replace('Private-', 'Shield-');
                    }
                });
            });
        }
        if (flags.json) {
            core_1.ux.styledJSON(spaceDynos);
        }
        else {
            this.render(spaceDynos);
        }
    }
    render(spaceDynos) {
        spaceDynos === null || spaceDynos === void 0 ? void 0 : spaceDynos.forEach(spaceDyno => {
            this.printDynos(spaceDyno.app_name, spaceDyno.dynos);
        });
    }
    printDynos(appName, dynos) {
        var _a, _b;
        const dynosByCommand = new Map();
        for (const dyno of dynos) {
            const since = (0, time_1.ago)(new Date(dyno.updated_at));
            const size = (_a = dyno.size) !== null && _a !== void 0 ? _a : '1X';
            let key = '';
            let item = '';
            if (dyno.type === 'run') {
                key = 'run: one-off processes';
                item = `${dyno.name} (${size}): ${dyno.state} ${since}: ${dyno.command}`;
            }
            else {
                key = `${color_1.default.green(dyno.type)} (${color_1.default.cyan(size)}): ${dyno.command}`;
                const state = dyno.state === 'up' ? color_1.default.green(dyno.state) : color_1.default.yellow(dyno.state);
                item = `${dyno.name}: ${color_1.default.green(state)} ${color_1.default.dim(since)}`;
            }
            if (!dynosByCommand.has(key)) {
                dynosByCommand.set(key, []);
            }
            (_b = dynosByCommand.get(key)) === null || _b === void 0 ? void 0 : _b.push(item);
        }
        for (const [key, dynos] of dynosByCommand) {
            core_1.ux.styledHeader(`${appName} ${key} (${color_1.default.yellow(dynos.length)})`);
            dynos.sort((a, b) => getProcessNum(a) - getProcessNum(b));
            for (const dyno of dynos) {
                core_1.ux.log(dyno);
            }
            core_1.ux.log();
        }
    }
}
exports.default = Ps;
Ps.topic = 'spaces';
Ps.description = 'list dynos for a space';
Ps.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get dynos of' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Ps.args = {
    space: core_1.Args.string({ hidden: true }),
};
