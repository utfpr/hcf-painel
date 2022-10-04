export type TOption = {
    label: string;
    value: unknown;
}

export type TRequestParam = {
    page: number;
    limit: number;
    text: string;
    [property: string]: unknown;
};

export type TRequestFn = (params: TRequestParam) => Promise<TOption[]>;
