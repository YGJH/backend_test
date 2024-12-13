import * as Heroku from '@heroku-cli/schema';
export declare function parsePorts(protocol: string, port?: string): number[];
export declare function displayRules(space: string, ruleset: Heroku.OutboundRuleset): void;
export declare function displayRulesAsJSON(ruleset: Heroku.OutboundRuleset): void;
