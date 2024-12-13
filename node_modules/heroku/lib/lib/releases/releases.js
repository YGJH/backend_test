"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByPreviousOrId = exports.findByLatestOrId = exports.getRelease = exports.findRelease = void 0;
const findRelease = async function (heroku, app, search) {
    const { body: releases } = await heroku.request(`/apps/${app}/releases`, {
        partial: true,
        headers: {
            Range: 'version ..; max=10, order=desc',
            Accept: 'application/vnd.heroku+json; version=3.sdk',
        },
    });
    return search(releases);
};
exports.findRelease = findRelease;
const getRelease = async function (heroku, app, release) {
    let id = release.toLowerCase();
    id = id.startsWith('v') ? id.slice(1) : id;
    const { body: releaseResponse } = await heroku.get(`/apps/${app}/releases/${id}`, {
        headers: {
            Accept: 'application/vnd.heroku+json; version=3.sdk',
        },
    });
    return releaseResponse;
};
exports.getRelease = getRelease;
const findByLatestOrId = async function (heroku, app, release = 'current') {
    if (release === 'current') {
        return (0, exports.findRelease)(heroku, app, releases => releases[0]);
    }
    return (0, exports.getRelease)(heroku, app, release);
};
exports.findByLatestOrId = findByLatestOrId;
const findByPreviousOrId = async function (heroku, app, release = 'previous') {
    if (release === 'previous') {
        return (0, exports.findRelease)(heroku, app, releases => releases.filter(r => r.eligible_for_rollback)[1]);
    }
    return (0, exports.getRelease)(heroku, app, release);
};
exports.findByPreviousOrId = findByPreviousOrId;
