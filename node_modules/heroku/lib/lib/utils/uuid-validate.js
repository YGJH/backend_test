"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidValidate = void 0;
const uuidValidate = (uuid) => {
    return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(uuid);
};
exports.uuidValidate = uuidValidate;
