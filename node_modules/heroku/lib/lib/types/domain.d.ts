export interface Domain {
    /**
     * status of this record's ACM
     */
    acm_status: null | string;
    /**
     * reason for the status of this record's ACM
     */
    acm_status_reason: null | string;
    /**
     * app that owns the domain
     */
    app: {
        /**
         * unique identifier of app
         */
        id: string;
        /**
         * unique name of app
         */
        name: string;
    };
    /**
     * canonical name record, the address to point a domain at
     */
    cname: null | string;
    /**
     * when domain was created
     */
    created_at: string;
    /**
     * full hostname
     */
    hostname: string;
    /**
     * unique identifier of this domain
     */
    id: string;
    /**
     * type of domain name
     */
    kind: 'heroku' | 'custom';
    sni_endpoint: null | {
        /**
         * unique identifier of this SNI endpoint
         */
        id: string;
        /**
         * unique name for SNI endpoint
         */
        name: string;
    };
    /**
     * status of this record's cname
     */
    status: string;
    /**
     * when domain was updated
     */
    updated_at: string;
}
