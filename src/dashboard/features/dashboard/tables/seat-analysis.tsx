'use client'

import * as React from "react"
// import { useDashboard } from "../dashboard-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "../dashboard-state";
import { Seat } from "../services/copilot-seat-service";


export default function SeatAnalysis() {
  const { copilotSeats } = useDashboard();
  const [page, setPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  const totalSeats = copilotSeats.total_seats

  const totalPages = Math.ceil(totalSeats / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = copilotSeats.seats.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="pb-3">
        <CardTitle>All assigned seats</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">S.No</TableHead>
                <TableHead>Login</TableHead>
                <TableHead className="w-[100px]">GitHub ID</TableHead>
                <TableHead className="w-[150px]">Assigned time</TableHead>
                <TableHead className="w-[150px]">Last Activity At</TableHead>
                <TableHead>Last Activity Editor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((seat: Seat, index: number) => (
                <TableRow key={seat.assignee.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell className="font-medium">{seat.assignee.login}</TableCell>
                  <TableCell>{seat.assignee.id}</TableCell>
                  <TableCell>{formatDate(seat.created_at)}</TableCell>
                  <TableCell>{formatDate(seat.last_activity_at)}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{seat.last_activity_editor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue>{itemsPerPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">
              {startIndex + 1}-{Math.min(endIndex, totalSeats)} of {totalSeats}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}