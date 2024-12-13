"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const { version } = require('../../../package.json');
class ContainerIndex extends command_1.Command {
    async run() {
        core_1.ux.log(version);
    }
}
exports.default = ContainerIndex;
ContainerIndex.description = 'Use containers to build and deploy Heroku apps';
ContainerIndex.topic = 'container';
