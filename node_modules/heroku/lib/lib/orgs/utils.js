"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printGroupsJSON = exports.printGroups = void 0;
const core_1 = require("@oclif/core");
const _ = require("lodash");
const color_1 = require("@heroku-cli/color");
const printGroups = function (teams, type) {
    const typeLabel = type.label ? type.label : 'Team';
    teams = _.sortBy(teams, 'name');
    core_1.ux.table(teams, {
        name: {
            header: typeLabel,
            get: ({ name }) => color_1.default.green(name),
        },
        role: {
            get: ({ role }) => role,
        },
    });
};
exports.printGroups = printGroups;
const printGroupsJSON = function (teams) {
    core_1.ux.log(JSON.stringify(teams, null, 2));
};
exports.printGroupsJSON = printGroupsJSON;
