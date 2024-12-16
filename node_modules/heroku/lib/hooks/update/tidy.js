"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const deps_1 = require("../../deps");
const tidy = async function () {
    const cleanupPlugins = async () => {
        const pluginsDir = path.join(this.config.dataDir, 'plugins');
        if (await deps_1.default.file.exists(path.join(pluginsDir, 'plugins.json')))
            return;
        let pjson;
        try {
            pjson = await deps_1.default.file.readJSON(path.join(pluginsDir, 'package.json'));
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
            return;
        }
        if (!pjson.dependencies || Object.keys(pjson.dependencies).length === 0) {
            await deps_1.default.file.remove(path.join(pluginsDir));
        }
    };
    await deps_1.default.file.removeEmptyDirs(path.join(this.config.dataDir, 'tmp'));
    if (this.config.configDir !== this.config.dataDir) {
        await deps_1.default.file.removeEmptyDirs(this.config.configDir);
    }
    if (this.config.cacheDir !== this.config.dataDir) {
        await cleanupPlugins();
    }
};
exports.default = tidy;
