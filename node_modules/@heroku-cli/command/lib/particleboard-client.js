"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleboardClient = void 0;
const tslib_1 = require("tslib");
const url = tslib_1.__importStar(require("url"));
const deps_1 = tslib_1.__importDefault(require("./deps"));
const request_id_1 = require("./request-id");
const vars_1 = require("./vars");
class ParticleboardClient {
    constructor(config) {
        this.config = config;
        this.config = config;
        const particleboardUrl = url.URL ? new url.URL(vars_1.vars.particleboardUrl) : url.parse(vars_1.vars.particleboardUrl);
        const self = this;
        const envParticleboardHeaders = JSON.parse(process.env.HEROKU_PARTICLEBOARD_HEADERS || '{}');
        const particleboardOpts = {
            host: particleboardUrl.hostname,
            port: particleboardUrl.port,
            protocol: particleboardUrl.protocol,
            headers: Object.assign({ accept: 'application/vnd.heroku+json; version=3', 'user-agent': `heroku-cli/${self.config.version} ${self.config.platform}` }, envParticleboardHeaders),
        };
        this.http = class ParticleboardHTTPClient extends deps_1.default.HTTP.HTTP.create(particleboardOpts) {
            static trackRequestIds(response) {
                const responseRequestIdHeader = response.headers[request_id_1.requestIdHeader];
                if (responseRequestIdHeader) {
                    const requestIds = Array.isArray(responseRequestIdHeader) ? responseRequestIdHeader : responseRequestIdHeader.split(',');
                    request_id_1.RequestId.track(...requestIds);
                }
            }
            static async request(url, opts = {}) {
                opts.headers = opts.headers || {};
                opts.headers[request_id_1.requestIdHeader] = request_id_1.RequestId.create() && request_id_1.RequestId.headerValue;
                if (!Object.keys(opts.headers).some(h => h.toLowerCase() === 'authorization')) {
                    opts.headers.authorization = `Bearer ${self.auth}`;
                }
                const response = await super.request(url, opts);
                this.trackRequestIds(response);
                return response;
            }
        };
    }
    get auth() {
        return this._auth;
    }
    set auth(token) {
        this._auth = token;
    }
    get(url, options = {}) {
        return this.http.get(url, options);
    }
    get defaults() {
        return this.http.defaults;
    }
}
exports.ParticleboardClient = ParticleboardClient;
