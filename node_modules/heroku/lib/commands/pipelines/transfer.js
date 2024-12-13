"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const api_1 = require("../../lib/api");
const disambiguate_1 = require("../../lib/pipelines/disambiguate");
const render_pipeline_1 = require("../../lib/pipelines/render-pipeline");
async function getTeamOwner(heroku, name) {
    const { body: team } = await (0, api_1.getTeam)(heroku, name);
    return { id: team.id, type: 'team' };
}
async function getAccountOwner(heroku, name) {
    const { body: account } = await (0, api_1.getAccountInfo)(heroku, name);
    return { id: account.id, type: 'user' };
}
function getOwner(heroku, name) {
    return getTeamOwner(heroku, name)
        .catch(() => {
        return getAccountOwner(heroku, name);
    })
        .catch(() => {
        throw new Error(`Cannot find a team or account for "${name}"`);
    });
}
class PipelinesTransfer extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(PipelinesTransfer);
        const pipeline = await (0, disambiguate_1.default)(this.heroku, flags.pipeline);
        const newOwner = await getOwner(this.heroku, args.owner);
        const apps = await (0, api_1.listPipelineApps)(this.heroku, pipeline.id);
        const displayType = newOwner.type === 'user' ? 'account' : newOwner.type;
        let confirmName = flags.confirm;
        if (!confirmName) {
            await (0, render_pipeline_1.default)(this.heroku, pipeline, apps);
            core_1.ux.log('');
            core_1.ux.warn(`This will transfer ${color_1.default.pipeline(pipeline.name)} and all of the listed apps to the ${args.owner} ${displayType}`);
            core_1.ux.warn(`to proceed, type ${color_1.default.red(pipeline.name)} or re-run this command with ${color_1.default.red('--confirm')} ${pipeline.name}`);
            confirmName = await core_1.ux.prompt('', {});
        }
        if (confirmName !== pipeline.name) {
            core_1.ux.warn(`Confirmation did not match ${color_1.default.red(pipeline.name)}. Aborted.`);
            return;
        }
        core_1.ux.action.start(`Transferring ${color_1.default.pipeline(pipeline.name)} pipeline to the ${args.owner} ${displayType}`);
        await (0, api_1.createPipelineTransfer)(this.heroku, { pipeline: { id: pipeline.id }, new_owner: newOwner });
        core_1.ux.action.stop();
    }
}
exports.default = PipelinesTransfer;
PipelinesTransfer.description = 'transfer ownership of a pipeline';
PipelinesTransfer.examples = [
    '$ heroku pipelines:transfer admin@example.com -p my-pipeline',
    '$ heroku pipelines:transfer admin-team -p my-pipeline',
];
PipelinesTransfer.args = {
    owner: core_1.Args.string({
        description: 'the owner to transfer the pipeline to',
        required: true,
    }),
};
PipelinesTransfer.flags = {
    pipeline: command_1.flags.pipeline({ required: true }),
    confirm: command_1.flags.string({ char: 'c' }),
};
