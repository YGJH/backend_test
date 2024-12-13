/// <reference types="node" />
import type { PathLike } from 'node:fs';
export declare function getCertAndKey(args: {
    CRT: PathLike;
    KEY: PathLike;
}): Promise<{
    crt: string;
    key: string;
}>;
