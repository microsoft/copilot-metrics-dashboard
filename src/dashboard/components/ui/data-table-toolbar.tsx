"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableExportOptions } from "./data-table-export-options";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    search?: { column: string; placeholder: string };
    filters?: { column: string; label: string }[];
    enableExport?: boolean;
}

export function DataTableToolbar<TData>({ table, search, filters, enableExport }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {search && (
                    <Input
                        placeholder={search.placeholder}
                        value={(table.getColumn(search.column)?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn(search.column)?.setFilterValue(event.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {filters?.map((filter) => (
                    <DataTableFacetedFilter
                        key={filter.column}
                        column={table.getColumn(filter.column)}
                        title={filter.label}
                    />
                ))}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3 gap-2">
                        Reset
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2 ml-auto">
                <DataTableViewOptions table={table} />
                {enableExport && <DataTableExportOptions table={table} />}
            </div>
        </div>
    );
}
