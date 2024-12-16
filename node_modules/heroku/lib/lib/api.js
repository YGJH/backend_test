"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTestRun = exports.getTestNodes = exports.createTestRun = exports.setPipelineConfigVars = exports.getPipelineConfigVars = exports.getReleases = exports.updateCoupling = exports.removeCoupling = exports.patchCoupling = exports.listPipelineApps = exports.getAppSetup = exports.getAccountInfo = exports.getTeam = exports.updatePipeline = exports.getPipeline = exports.getCoupling = exports.findPipelineByName = exports.destroyPipeline = exports.createPipelineTransfer = exports.createPipeline = exports.createCoupling = exports.postCoupling = exports.createAppSetup = exports.PIPELINES_HEADER = exports.FILTERS_HEADER = exports.SDK_HEADER = exports.V3_HEADER = void 0;
exports.V3_HEADER = 'application/vnd.heroku+json; version=3';
exports.SDK_HEADER = 'application/vnd.heroku+json; version=3.sdk';
exports.FILTERS_HEADER = `${exports.V3_HEADER}.filters`;
exports.PIPELINES_HEADER = `${exports.V3_HEADER}.pipelines`;
const CI_HEADER = `${exports.V3_HEADER}.ci`;
function createAppSetup(heroku, body) {
    return heroku.post('/app-setups', { body });
}
exports.createAppSetup = createAppSetup;
function postCoupling(heroku, pipeline, app, stage) {
    return heroku.post('/pipeline-couplings', {
        body: { app, pipeline, stage },
    });
}
exports.postCoupling = postCoupling;
function createCoupling(heroku, pipeline, app, stage) {
    return postCoupling(heroku, pipeline.id, app, stage);
}
exports.createCoupling = createCoupling;
function createPipeline(heroku, name, owner) {
    return heroku.request('/pipelines', {
        method: 'POST',
        headers: { Accept: exports.PIPELINES_HEADER },
        body: { name, owner },
    });
}
exports.createPipeline = createPipeline;
function createPipelineTransfer(heroku, pipeline) {
    return heroku.post('/pipeline-transfers', {
        body: pipeline,
    });
}
exports.createPipelineTransfer = createPipelineTransfer;
function deleteCoupling(heroku, id) {
    return heroku.delete(`/pipeline-couplings/${id}`);
}
function destroyPipeline(heroku, name, pipelineId) {
    return heroku.request(`/pipelines/${pipelineId}`, {
        method: 'DELETE',
        headers: { Accept: exports.PIPELINES_HEADER },
        body: { name },
    });
}
exports.destroyPipeline = destroyPipeline;
function findPipelineByName(heroku, idOrName) {
    return heroku.request(`/pipelines?eq[name]=${idOrName}`, {
        method: 'GET',
        headers: { Accept: exports.PIPELINES_HEADER },
    });
}
exports.findPipelineByName = findPipelineByName;
function getCoupling(heroku, app) {
    return heroku.get(`/apps/${app}/pipeline-couplings`, {
        headers: { Accept: exports.SDK_HEADER },
    });
}
exports.getCoupling = getCoupling;
function getPipeline(heroku, id) {
    return heroku.request(`/pipelines/${id}`, {
        method: 'GET',
        headers: { Accept: exports.PIPELINES_HEADER },
    });
}
exports.getPipeline = getPipeline;
function updatePipeline(heroku, id, body) {
    return heroku.patch(`/pipelines/${id}`, {
        body,
    });
}
exports.updatePipeline = updatePipeline;
function getTeam(heroku, teamId) {
    return heroku.get(`/teams/${teamId}`);
}
exports.getTeam = getTeam;
function getAppFilter(heroku, appIds) {
    return heroku.request('/filters/apps', {
        method: 'POST',
        headers: { Accept: exports.FILTERS_HEADER, Range: 'id ..; max=1000;' },
        body: { in: { id: appIds } },
    });
}
function getAccountInfo(heroku, id = '~') {
    return heroku.get(`/users/${id}`);
}
exports.getAccountInfo = getAccountInfo;
function getAppSetup(heroku, buildId) {
    return heroku.get(`/app-setups/${buildId}`);
}
exports.getAppSetup = getAppSetup;
function listCouplings(heroku, pipelineId) {
    return heroku.get(`/pipelines/${pipelineId}/pipeline-couplings`, {
        headers: { Accept: exports.SDK_HEADER },
    });
}
async function listPipelineApps(heroku, pipelineId) {
    const { body: couplings } = await listCouplings(heroku, pipelineId);
    const appIds = couplings.map(coupling => coupling.app.id || '');
    const { body: apps } = await getAppFilter(heroku, appIds);
    return apps.map(app => {
        return Object.assign(Object.assign({}, app), { pipelineCoupling: couplings.find(coupling => coupling.app.id === app.id) });
    });
}
exports.listPipelineApps = listPipelineApps;
function patchCoupling(heroku, id, stage) {
    return heroku.patch(`/pipeline-couplings/${id}`, { body: { stage } });
}
exports.patchCoupling = patchCoupling;
function removeCoupling(heroku, app) {
    return getCoupling(heroku, app)
        .then(({ body }) => {
        return deleteCoupling(heroku, body.id);
    });
}
exports.removeCoupling = removeCoupling;
function updateCoupling(heroku, app, stage) {
    return getCoupling(heroku, app)
        .then(({ body: coupling }) => patchCoupling(heroku, coupling.id, stage));
}
exports.updateCoupling = updateCoupling;
function getReleases(heroku, appId) {
    return heroku.get(`/apps/${appId}/releases`, {
        headers: { Accept: exports.SDK_HEADER, Range: 'version ..; order=desc' },
        partial: true,
    });
}
exports.getReleases = getReleases;
function getPipelineConfigVars(heroku, pipelineID) {
    return heroku.request(`/pipelines/${pipelineID}/stage/test/config-vars`, {
        method: 'GET',
        headers: { Accept: exports.PIPELINES_HEADER },
    });
}
exports.getPipelineConfigVars = getPipelineConfigVars;
function setPipelineConfigVars(heroku, pipelineID, body) {
    return heroku.request(`/pipelines/${pipelineID}/stage/test/config-vars`, {
        method: 'PATCH',
        headers: { Accept: exports.PIPELINES_HEADER },
        path: `/pipelines/${pipelineID}/stage/test/config-vars`,
        body,
    });
}
exports.setPipelineConfigVars = setPipelineConfigVars;
async function createTestRun(heroku, body) {
    const headers = {
        Accept: CI_HEADER,
    };
    return heroku.request('/test-runs', {
        headers,
        method: 'POST',
        body,
    });
}
exports.createTestRun = createTestRun;
async function getTestNodes(heroku, testRunIdD) {
    return heroku.request(`/test-runs/${testRunIdD}/test-nodes`, {
        headers: {
            Authorization: `Bearer ${heroku.auth}`,
            Accept: CI_HEADER,
        },
    });
}
exports.getTestNodes = getTestNodes;
function updateTestRun(heroku, id, body) {
    return heroku.request(`/test-runs/${id}`, {
        body,
        method: 'PATCH',
        headers: {
            Accept: CI_HEADER,
        },
    });
}
exports.updateTestRun = updateTestRun;
