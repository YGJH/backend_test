"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
function printJSON(features) {
    core_1.ux.log(JSON.stringify(features, null, 2));
}
function printFeatures(features) {
    var _a, _b;
    const groupedFeatures = (0, lodash_1.sortBy)(features, 'name');
    const longest = Math.max(...groupedFeatures.map(f => f.name.length));
    for (const f of groupedFeatures) {
        let line = `${f.enabled ? '[+]' : '[ ]'} ${(_b = (_a = f.name) === null || _a === void 0 ? void 0 : _a.padEnd(longest)) !== null && _b !== void 0 ? _b : ''}`;
        if (f.enabled)
            line = color_1.default.green(line);
        line = `${line}  ${f.description}`;
        core_1.ux.log(line);
    }
}
class LabsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(LabsIndex);
        const [currentUserResponse, userResponse, appResponse] = await Promise.all([
            this.heroku.get('/account'),
            this.heroku.get('/account/features'),
            (flags.app ? this.heroku.get(`/apps/${flags.app}/features`) : null),
        ]);
        let app = null;
        const currentUser = currentUserResponse.body;
        const user = userResponse.body;
        const features = {
            currentUser,
            user,
        };
        // makes sure app isn't added to json object if null
        // eslint-disable-next-line no-negated-condition
        if (appResponse !== null) {
            app = appResponse === null || appResponse === void 0 ? void 0 : appResponse.body;
            features.app = app;
        }
        else {
            features.app = app;
        }
        // general features are managed via `features` not `labs`
        features.user = features.user.filter((f) => f.state !== 'general');
        if (features.app)
            features.app = features.app.filter((f) => f.state !== 'general');
        if (flags.json) {
            printJSON({ app, user });
        }
        else {
            core_1.ux.styledHeader(`User Features ${color_1.default.cyan(features.currentUser.email)}`);
            printFeatures(features.user);
            if (features.app) {
                core_1.ux.log();
                core_1.ux.styledHeader(`App Features ${color_1.default.app(flags.app)}`);
                printFeatures(features.app);
            }
        }
    }
}
exports.default = LabsIndex;
LabsIndex.description = 'list experimental features';
LabsIndex.topic = 'labs';
LabsIndex.flags = {
    app: command_1.flags.app({ required: false }),
    remote: command_1.flags.remote(),
    json: command_1.flags.boolean({ description: 'display as json', required: false }),
};
