export declare type Host = {
    host_id: string;
    state: string;
    available_capacity_percentage: number;
    allocated_at: string;
    released_at: string;
};
export declare function displayHosts(space: string, hosts: Host[]): void;
export declare function displayHostsAsJSON(hosts: Host[]): void;
