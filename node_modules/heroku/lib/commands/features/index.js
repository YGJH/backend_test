"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const lodash_1 = require("lodash");
class Features extends command_1.Command {
    async run() {
        var _a;
        const { flags } = await this.parse(Features);
        const { app, json } = flags;
        let { body: features } = await this.heroku.get(`/apps/${app}/features`);
        features = features.filter(f => f.state === 'general');
        features = (0, lodash_1.sortBy)(features, 'name');
        if (json) {
            core_1.ux.styledJSON(features);
        }
        else {
            core_1.ux.styledHeader(`App Features ${color_1.default.app(app)}`);
            const longest = Math.max.apply(null, features.map(f => { var _a; return ((_a = f.name) === null || _a === void 0 ? void 0 : _a.length) || 0; }));
            for (const f of features) {
                let line = `${f.enabled ? '[+]' : '[ ]'} ${(_a = f.name) === null || _a === void 0 ? void 0 : _a.padEnd(longest)}`;
                if (f.enabled)
                    line = color_1.default.green(line);
                line = `${line}  ${f.description}`;
                core_1.ux.log(line);
            }
        }
    }
}
exports.default = Features;
Features.description = 'list available app features';
Features.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
