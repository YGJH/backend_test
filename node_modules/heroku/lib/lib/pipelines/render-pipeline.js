"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const ownership_1 = require("./ownership");
async function renderPipeline(heroku, pipeline, pipelineApps, 
// eslint-disable-next-line unicorn/no-object-as-default-parameter
{ withOwners, showOwnerWarning } = { withOwners: false, showOwnerWarning: false }) {
    core_1.ux.styledHeader(pipeline.name);
    let owner;
    if (pipeline.owner) {
        owner = await (0, ownership_1.getOwner)(heroku, pipelineApps, pipeline);
        core_1.ux.log(`owner: ${owner}`);
    }
    core_1.ux.log('');
    const columns = {
        name: {
            header: 'app name',
            get(row) {
                return color_1.default.app(row.name || '');
            },
        },
        'coupling.stage': {
            header: 'stage',
            get(row) {
                return row.pipelineCoupling.stage;
            },
        },
    };
    if (withOwners) {
        columns['owner.email'] = {
            header: 'owner',
            get(row) {
                const email = row.owner && row.owner.email;
                if (email) {
                    return email.endsWith('@herokumanager.com') ? `${email.split('@')[0]} (team)` : email;
                }
            },
        };
    }
    const developmentApps = (0, lodash_1.sortBy)(pipelineApps.filter(app => app.pipelineCoupling.stage === 'development'), ['name']);
    const reviewApps = (0, lodash_1.sortBy)(pipelineApps.filter(app => app.pipelineCoupling.stage === 'review'), ['name']);
    const stagingApps = (0, lodash_1.sortBy)(pipelineApps.filter(app => app.pipelineCoupling.stage === 'staging'), ['name']);
    const productionApps = (0, lodash_1.sortBy)(pipelineApps.filter(app => app.pipelineCoupling.stage === 'production'), ['name']);
    const apps = developmentApps.concat(reviewApps).concat(stagingApps).concat(productionApps);
    core_1.ux.table(apps, columns);
    if (showOwnerWarning && pipeline.owner) {
        (0, ownership_1.warnMixedOwnership)(pipelineApps, pipeline, owner);
    }
}
exports.default = renderPipeline;
