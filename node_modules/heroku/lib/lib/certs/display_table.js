"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const format_date_1 = require("./format_date");
function type(endpoint) {
    if (endpoint.ssl_cert && endpoint.ssl_cert.acm) {
        return 'ACM';
    }
    return 'SNI';
}
function default_1(endpoints) {
    const mapped = endpoints
        .filter(endpoint => endpoint.ssl_cert)
        .map(endpoint => {
        const tableContents = {
            name: endpoint.name,
            expires_at: endpoint.ssl_cert.expires_at,
            ca_signed: endpoint.ssl_cert['ca_signed?'],
            type: type(endpoint),
            common_names: endpoint.ssl_cert.cert_domains.join(', '),
            display_name: endpoint.display_name,
        };
        // If they're using ACM it's not really worth showing the number of associated domains since
        // it'll always be 1 and is entirely outside the user's control
        if (!endpoint.ssl_cert.acm) {
            tableContents.associated_domains = endpoint.domains.length > 0 ? endpoint.domains.length : '0';
        }
        return tableContents;
    });
    const columns = {
        name: { header: 'Name' },
    };
    if (endpoints.some(endpoint => endpoint.display_name)) {
        columns.display_name = { header: 'Display Name' };
    }
    columns.common_names = { header: 'Common Name(s)' };
    columns.expires_at = {
        header: 'Expires',
        get: ({ expires_at }) => expires_at === undefined ? '' : (0, format_date_1.default)(expires_at),
    };
    columns.ca_signed = {
        header: 'Trusted',
        get: ({ ca_signed }) => ca_signed ? 'True' : 'False',
    };
    columns.type = { header: 'Type' };
    if (endpoints.some(endpoint => !endpoint.ssl_cert.acm)) {
        columns.associated_domains = { header: 'Domains' };
    }
    core_1.ux.table(mapped, columns);
}
exports.default = default_1;
