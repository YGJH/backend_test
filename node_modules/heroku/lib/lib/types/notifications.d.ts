declare type FollowUp = {
    created_at: string;
    body: string;
};
export declare type Notification = {
    id: string;
    created_at: string;
    title: string;
    read: boolean;
    body: string;
    target: {
        type: string;
        id: string;
    };
    followup: FollowUp[];
    resource_name: string;
    type: string;
};
export declare type Notifications = Notification[];
export {};
