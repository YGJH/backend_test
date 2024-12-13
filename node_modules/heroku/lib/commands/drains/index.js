"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const lodash_1 = require("lodash");
function styledDrain(id, name, drain) {
    let output = `${id} (${name})`;
    if (drain.extended)
        output += ` drain_id=${drain.extended.drain_id}`;
    core_1.ux.log(output);
}
class Drains extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Drains);
        let path = `/apps/${flags.app}/log-drains`;
        if (flags.extended) {
            path += '?extended=true';
        }
        const { body: drains } = await this.heroku.get(path);
        if (flags.json) {
            core_1.ux.styledJSON(drains);
        }
        else {
            const [drainsWithAddons, drainsWithoutAddons] = (0, lodash_1.partition)(drains, 'addon');
            if (drainsWithoutAddons.length > 0) {
                core_1.ux.styledHeader('Drains');
                drainsWithoutAddons.forEach((drain) => {
                    styledDrain(drain.url || '', color_1.default.green(drain.token || ''), drain);
                });
            }
            if (drainsWithAddons.length > 0) {
                const addons = await Promise.all(drainsWithAddons.map((d) => { var _a; return this.heroku.get(`/apps/${flags.app}/addons/${(_a = d.addon) === null || _a === void 0 ? void 0 : _a.name}`); }));
                core_1.ux.styledHeader('Add-on Drains');
                addons.forEach(({ body: addon }, i) => {
                    var _a;
                    styledDrain(color_1.default.yellow(((_a = addon.plan) === null || _a === void 0 ? void 0 : _a.name) || ''), color_1.default.green(addon.name || ''), drainsWithAddons[i]);
                });
            }
        }
    }
}
exports.default = Drains;
Drains.description = 'display the log drains of an app';
Drains.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    extended: command_1.flags.boolean({ char: 'x', hidden: true }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
