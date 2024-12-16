import { Peering, PeeringInfo } from '@heroku-cli/schema';
export declare function displayPeeringInfo(space: string, info: PeeringInfo): void;
export declare function displayPeeringsAsJSON(peerings: Peering[]): void;
export declare function displayPeerings(space: string, peerings: Peering[]): void;
