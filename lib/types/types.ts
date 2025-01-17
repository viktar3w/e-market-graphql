import { ReactNode } from "react";
import {dbType} from "@/lib/db";

export type CheckboxFilterType = {
  text: string;
  value: string;
  endAdornment?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  name?: string;
}

export type ItemVariation<T> = {
  text: string
  value: T
}

export type CountButtonType = {
  className?: string;
  value?: number;
  size?: "sm" | "lg";
  onClick?: (type: "plus" | "minus") => void;
  disabled?: boolean
};

export type ResultResponse = {
  success: boolean;
};

export type ContextGraphql = {
  prisma: dbType;
  userId?: string;
  cartId?: string;
};

export type MutationCommonProps = {
  _parent: unknown;
  context: ContextGraphql;
};