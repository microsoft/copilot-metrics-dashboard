"use client";
import { useDashboard } from "./seats-state";
import { ChartHeader } from "@/features/common/chart-header";
import { Card, CardContent } from "@/components/ui/card";
import { stringIsNullOrEmpty } from "@/utils/helpers";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface SeatData {
    user: string;
    organization: string | null;
    team: string | null;
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
    lastActivityEditor: string;
    planType: string;
    pendingCancellationDate: string;
}

function formatEditorName(editor: string): string {
    if (stringIsNullOrEmpty(editor)) {
        return editor;
    }
    const editorInfo = editor.split('/');
    const editorName = `${editorInfo[0]} (${editorInfo[1]})`;

    return editorName;
}

const arrayIncludes = (row: any, id: string, value: any[]) => {
    return value.includes(row.getValue(id));
};

const stringIncludes = (row: any, id: string, value: string) => {
    return row.getValue(id).includes(value);
};

const columns: ColumnDef<SeatData>[] = [
    { accessorKey: "user", title: "User", filter: stringIncludes },
    { accessorKey: "organization", title: "Organization", filter: arrayIncludes },
    { accessorKey: "team", title: "Team", filter: arrayIncludes },
    { accessorKey: "createdAt", title: "Create Date" },
    { accessorKey: "updatedAt", title: "Update Date" },
    { accessorKey: "lastActivityAt", title: "Last Activity Date" },
    { accessorKey: "lastActivityEditor", title: "Last Activity Editor" },
    { accessorKey: "planType", title: "Plan", filter: arrayIncludes },
    { accessorKey: "pendingCancellationDate", title: "Pending Cancellation" }
].map((col) => ({
    accessorKey: col.accessorKey,
    id: col.accessorKey,
    meta: { name: col.title },
    header: ({ column }) => (
        <DataTableColumnHeader
            column={column}
            title={col.title}
        />
    ),
    cell: ({ row }) => <div className="ml-2">{row.getValue(col.accessorKey)}</div>,
    filterFn: col.filter,
}));

export const SeatsList = () => {
    const { seatsData } = useDashboard();
    const hasOrganization = seatsData?.seats.some((seat) => seat.organization);
    const hasTeam = seatsData?.seats.some((seat) => seat.assigning_team);
    return (
        <Card className="col-span-4">
            <ChartHeader
                title="Assigned Seats"
                description=""
            />
            <CardContent>
                <DataTable
                    columns={columns.filter((col) => col.id !== "organization" || hasOrganization)}
                    data={(seatsData?.seats ?? []).map((seat) => ({
                        user: seat.assignee.login,
                        organization: seat.organization?.login,
                        team: seat.assigning_team?.name,
                        createdAt: new Date(seat.created_at).toLocaleDateString(),
                        updatedAt: new Date(seat.updated_at).toLocaleDateString(),
                        lastActivityAt: seat.last_activity_at ? new Date(seat.last_activity_at).toLocaleDateString() : "-",
                        lastActivityEditor: formatEditorName(seat.last_activity_editor),
                        planType: seat.plan_type,
                        pendingCancellationDate: seat.pending_cancellation_date ? new Date(seat.pending_cancellation_date).toLocaleDateString() : "N/A",
                    }))}
                    initialVisibleColumns={{
                        updatedAt: false,
                        planType: false,
                        pendingCancellationDate: false,
                    }}
                    search={{
                        column: "user",
                        placeholder: "Filter seats...",
                    }}
                    filters={[
                        ...(hasOrganization ? [{ column: "organization", label: "Organizations" }] : []), 
                        ...(hasTeam ? [{ column: "team", label: "Team" }] : []),
                        { column: "planType", label: "Plan Type" }
                    ]}
                    enableExport
                />
            </CardContent>
        </Card>
    );
};
