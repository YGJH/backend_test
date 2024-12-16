"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatState = exports.grandfatheredPrice = exports.formatPriceText = exports.formatPrice = exports.trapConfirmationRequired = void 0;
const confirmCommand_1 = require("../confirmCommand");
const color_1 = require("@heroku-cli/color");
const printf = require('printf');
const trapConfirmationRequired = async function (app, confirm, fn) {
    return await fn(confirm)
        .catch((error) => {
        if (!error.body || error.body.id !== 'confirmation_required')
            throw error;
        return (0, confirmCommand_1.default)(app, confirm, error.body.message)
            .then(() => fn(app));
    });
};
exports.trapConfirmationRequired = trapConfirmationRequired;
// This function assumes that price.cents will reflect price per month.
// If the API returns any unit other than month
// this function will need to be updated.
const formatPrice = function ({ price, hourly }) {
    if (!price)
        return;
    if (price.contract)
        return 'contract';
    if (price.cents === 0)
        return 'free';
    // we are using a standardized 720 hours/month
    if (hourly)
        return `~$${((price.cents / 100) / 720).toFixed(3)}/hour`;
    const fmt = price.cents % 100 === 0 ? '$%.0f/%s' : '$%.02f/%s';
    return printf(fmt, price.cents / 100, price.unit);
};
exports.formatPrice = formatPrice;
const formatPriceText = function (price) {
    const priceHourly = (0, exports.formatPrice)({ price, hourly: true });
    const priceMonthly = (0, exports.formatPrice)({ price, hourly: false });
    if (!priceHourly)
        return '';
    if (priceHourly === 'free' || priceHourly === 'contract')
        return `${color_1.default.green(priceHourly)}`;
    return `${color_1.default.green(priceHourly)} (max ${priceMonthly})`;
};
exports.formatPriceText = formatPriceText;
const grandfatheredPrice = function (addon) {
    var _a, _b, _c;
    const price = (_a = addon.plan) === null || _a === void 0 ? void 0 : _a.price;
    return Object.assign({}, price, {
        cents: (_b = addon.billed_price) === null || _b === void 0 ? void 0 : _b.cents,
        contract: (_c = addon.billed_price) === null || _c === void 0 ? void 0 : _c.contract,
    });
};
exports.grandfatheredPrice = grandfatheredPrice;
const formatState = function (state) {
    switch (state) {
        case 'provisioned':
            state = 'created';
            break;
        case 'provisioning':
            state = 'creating';
            break;
        case 'deprovisioning':
            state = 'destroying';
            break;
        case 'deprovisioned':
            state = 'errored';
            break;
        default:
            state = '';
    }
    return state;
};
exports.formatState = formatState;
