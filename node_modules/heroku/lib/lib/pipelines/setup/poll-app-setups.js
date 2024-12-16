"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../api");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function pollAppSetup(heroku, appSetup) {
    return api.getAppSetup(heroku, appSetup.id).then(({ body: setup }) => {
        if (setup.status === 'succeeded') {
            return setup;
        }
        if (setup.status === 'failed') {
            throw new Error(`Couldn't create application ${color_1.default.app(setup.app.name)}: ${setup.failure_message}`);
        }
        return wait(1000).then(() => pollAppSetup(heroku, appSetup));
    }).catch((error) => {
        return core_1.ux.error(error, { exit: 1 });
    });
}
function pollAppSetups(heroku, appSetups) {
    return Promise.all(appSetups.map((appSetup) => pollAppSetup(heroku, appSetup)));
}
exports.default = pollAppSetups;
