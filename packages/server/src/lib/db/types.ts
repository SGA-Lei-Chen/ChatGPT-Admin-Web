// import type { ColumnSort, Row } from "@tanstack/react-table";
import type { SQL } from "drizzle-orm";
import { z } from "zod";

import {
  type DataTableConfig,
  dataTableConfig,
} from "@server/config/data-table";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type StringKeyOf<TData> = Extract<keyof TData, string>;

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  type: z.enum(dataTableConfig.columnTypes),
  operator: z.enum(dataTableConfig.globalOperators),
  rowId: z.string(),
});

export type ColumnType = DataTableConfig["columnTypes"][number];

export type FilterOperator = DataTableConfig["globalOperators"][number];

export type JoinOperator = DataTableConfig["joinOperators"][number]["value"];

// export interface DataTableFilterField<TData> {
// 	id: StringKeyOf<TData>;
// 	label: string;
// 	placeholder?: string;
// 	options?: Option[];
// }

// export interface DataTableAdvancedFilterField<TData>
// 	extends DataTableFilterField<TData> {
// 	type: ColumnType;
// }

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, "id"> & {
    id: StringKeyOf<TData>;
  }
>;

// export interface DataTableRowAction<TData> {
// 	row: Row<TData>;
// 	type: "update" | "delete";
// }

export interface QueryBuilderOpts {
  where?: SQL;
  orderBy?: SQL;
  distinct?: boolean;
  nullish?: boolean;
}

export const dataTableSchema = z
  .object({
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).default(10),
    sort: z.array(z.object({ id: z.string(), desc: z.boolean() })),
    filter: filterSchema.array(),
  })
  .partial();
