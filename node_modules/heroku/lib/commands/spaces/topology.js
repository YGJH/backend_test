"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const color_1 = require("@heroku-cli/color");
class Topology extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Topology);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Error: Missing 1 required arg:
        space
        See more help with --help
      `));
        }
        const { body: topology } = await this.heroku.get(`/spaces/${spaceName}/topology`);
        let appInfo = [];
        if (topology.apps) {
            appInfo = await Promise.all(topology.apps.map(async (topologyApp) => {
                const { body: app } = await this.heroku.get(`/apps/${topologyApp.id}`);
                return app;
            }));
        }
        this.render(topology, appInfo, flags.json);
    }
    render(topology, appInfo, json) {
        if (json) {
            core_1.ux.styledJSON(topology);
        }
        else if (topology.apps) {
            topology.apps.forEach(app => {
                const formations = [];
                const dynos = [];
                if (app.formations) {
                    app.formations.forEach(formation => {
                        formations.push(formation.process_type);
                        if (formation.dynos) {
                            formation.dynos.forEach(dyno => {
                                const dynoS = [`${formation.process_type}.${dyno.number}`, dyno.private_ip, dyno.hostname].filter(Boolean);
                                dynos.push(dynoS.join(' - '));
                            });
                        }
                    });
                }
                const domains = app.domains.sort();
                formations.sort();
                dynos.sort((a, b) => {
                    const apt = this.getProcessType(a);
                    const bpt = this.getProcessType(b);
                    if (apt > bpt) {
                        return 1;
                    }
                    if (apt < bpt) {
                        return -1;
                    }
                    return this.getProcessNum(a) - this.getProcessNum(b);
                });
                const info = appInfo.find(info => info.id === app.id);
                let header = info === null || info === void 0 ? void 0 : info.name;
                if (formations.length > 0) {
                    header += ` (${color_1.default.cyan(formations.join(', '))})`;
                }
                core_1.ux.styledHeader(header || '');
                core_1.ux.styledObject({
                    Domains: domains, Dynos: dynos,
                }, ['Domains', 'Dynos']);
                core_1.ux.log();
            });
        }
    }
    getProcessType(s) {
        return s.split('-', 2)[0].split('.', 2)[0];
    }
    getProcessNum(s) {
        return Number.parseInt(s.split('-', 2)[0].split('.', 2)[1], 10);
    }
}
exports.default = Topology;
Topology.topic = 'spaces';
Topology.description = 'show space topology';
Topology.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get topology of' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Topology.args = {
    space: core_1.Args.string({ hidden: true }),
};
