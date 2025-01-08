export type ListingArgsType<T> = {
    filter: Record<string, T>;
    limit: number;
    number_page: number;
};