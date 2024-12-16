"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayCertificateDetails = void 0;
const format_date_1 = require("./format_date");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const displayCertificateDetails = function (sniEndpoint, message = 'Certificate details:') {
    const now = new Date();
    const autoRenewsAt = new Date(sniEndpoint.ssl_cert.expires_at);
    autoRenewsAt.setMonth(autoRenewsAt.getMonth() - 1);
    if (sniEndpoint.app && sniEndpoint.ssl_cert.acm && autoRenewsAt > now) {
        core_1.ux.log(`Renewal scheduled for ${color_1.color.green((0, format_date_1.default)(autoRenewsAt.toString()))}.\n`);
    }
    core_1.ux.log(message);
    const tableObject = {
        'Common Name(s)': sniEndpoint.ssl_cert.cert_domains,
        'Expires At': (0, format_date_1.default)(sniEndpoint.ssl_cert.expires_at),
        Issuer: sniEndpoint.ssl_cert.issuer,
        'Starts At': (0, format_date_1.default)(sniEndpoint.ssl_cert.starts_at),
        Subject: sniEndpoint.ssl_cert.subject,
    };
    // Only displays domains when the list of ids was replaced by the list of hostnames
    if (sniEndpoint.domains.length > 0 && !sniEndpoint.domains.some(domain => domain.match('^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}'))) {
        tableObject['Domain(s)'] = sniEndpoint.domains;
    }
    core_1.ux.styledObject(tableObject);
    if (sniEndpoint.ssl_cert['ca_signed?']) {
        core_1.ux.log('SSL certificate is verified by a root authority.');
    }
    else if (sniEndpoint.ssl_cert.issuer === sniEndpoint.ssl_cert.subject) {
        core_1.ux.log('SSL certificate is self signed.');
    }
    else {
        core_1.ux.log('SSL certificate is not trusted.');
    }
};
exports.displayCertificateDetails = displayCertificateDetails;
