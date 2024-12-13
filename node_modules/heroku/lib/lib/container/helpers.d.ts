import * as Heroku from '@heroku-cli/schema';
/**
 * Ensure that the given app is a container app.
 * @param app {Heroku.App} heroku app
 * @param cmd {String} command name
 * @returns {null} null
 */
export declare function ensureContainerStack(app: Heroku.App, cmd: string): void;
