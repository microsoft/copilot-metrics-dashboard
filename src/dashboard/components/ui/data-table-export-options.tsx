"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { stringify } from "csv-stringify/browser/esm";

interface DataTableExportOptionsProps<TData> {
    table: Table<TData>;
}

function exportData<TData>(table: Table<TData>) {
    const columns = table.getAllColumns().filter((column) => column.getIsVisible());
    const rows = table.getRowModel().rows;

    const records = rows.map((row) => columns.map((column) => row.getValue(column.id)));

    stringify(
        records,
        {
            columns: columns.map((column) => column.id),
            header: true,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            const blob = new Blob([data], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "data.csv";
            a.click();
            URL.revokeObjectURL(url);
        }
    );
}

export function DataTableExportOptions<TData>({ table }: DataTableExportOptionsProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="hidden h-8 lg:flex gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[200px]">
                <DropdownMenuLabel>Export data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => exportData(table)}>
                    Download CSV
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
