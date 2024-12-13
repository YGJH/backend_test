import { APIClient } from '@heroku-cli/command';
export declare const addMemberToTeam: (email: string, role: string, groupName: string, heroku: APIClient, method?: string) => Promise<void>;
