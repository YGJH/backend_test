import * as Heroku from '@heroku-cli/schema';
export declare const trapConfirmationRequired: <T>(app: string, confirm: string | undefined, fn: (confirmed?: string) => Promise<T>) => Promise<T>;
export declare const formatPrice: ({ price, hourly }: {
    price: Heroku.AddOn['price'] | number;
    hourly?: boolean | undefined;
}) => any;
export declare const formatPriceText: (price: Heroku.AddOn['price']) => string;
export declare const grandfatheredPrice: (addon: Heroku.AddOn) => any;
export declare const formatState: (state: string) => string;
