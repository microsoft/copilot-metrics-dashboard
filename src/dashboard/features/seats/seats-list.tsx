"use client";
import { useDashboard } from "./seats-state";
import { ChartHeader } from "@/features/common/chart-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { stringIsNullOrEmpty } from "@/utils/helpers";
//add function to format editor name from this string vscode/1.96.0-insider/copilot-chat/0.23.2024110503
function formatEditorName(editor: string): string {
    if(stringIsNullOrEmpty(editor)){
        return editor;
    }
    const editorInfo = editor.split('/');
    const editorName = `${editorInfo[0]} (${editorInfo[1]})`;

    return editorName;
}

export const SeatsList = () => {
    const { filteredData } = useDashboard();
    const currentData = filteredData;

    return (
        <Card className="col-span-4">
            <ChartHeader
                title="Assigned Seats"
                description=""
            />
            <CardContent>
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Create Date</TableHead>
                            <TableHead>Update Date</TableHead>
                            <TableHead>Last Activity Date</TableHead>
                            <TableHead>Last Activity Editor</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Pending Cancellation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            currentData?.seats?.map((data, index) => {
                                const createdAt = new Date(data.created_at);
                                const updatedAt = new Date(data.updated_at);
                                const lastActivityAt = new Date(data.last_activity_at);
                                const pendingCancellationDate = data.pending_cancellation_date ? new Date(data.pending_cancellation_date) : null;

                                return (
                                    <TableRow key={index}>
                                        <TableCell>{data.assignee.login}</TableCell>
                                        <TableCell>{createdAt.toLocaleDateString()}</TableCell>
                                        <TableCell>{updatedAt.toLocaleDateString()}</TableCell>
                                        <TableCell>{lastActivityAt.toLocaleDateString()}</TableCell>
                                        <TableCell>{formatEditorName(data.last_activity_editor)}</TableCell>
                                        <TableCell>{data.plan_type}</TableCell>
                                        <TableCell>{pendingCancellationDate ? pendingCancellationDate.toLocaleDateString() : 'N/A'}</TableCell>
                                    </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
