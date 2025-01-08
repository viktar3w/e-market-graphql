import { CategoryParent } from "@/lib/types/product";
import {ListingArgsType} from "@/lib/types/common";

export type CategoryArgsType<T> = ListingArgsType<T>;

export type CategorySearchResponse = {
  items: CategoryParent[];
  total_count: number;
  page_info: {
    current_page: number;
    page_size: number;
    total_pages: number;
  };
};
