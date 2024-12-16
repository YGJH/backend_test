import * as Heroku from '@heroku-cli/schema';
import { SpaceNat } from '../types/fir';
import { SpaceWithOutboundIps } from '../types/spaces';
export declare function displayShieldState(space: Heroku.Space): "on" | "off";
export declare function displayNat(nat?: Required<SpaceNat>): string | undefined;
export declare function renderInfo(space: SpaceWithOutboundIps, json: boolean): void;
