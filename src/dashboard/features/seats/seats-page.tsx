import { ErrorPage } from "../common/error-page";
import { SeatsList } from "./seats-list";
import { DataProvider } from "./seats-state";
import { Header } from "./header";
import { Stats } from "./stats/stats";

import {
  getCopilotSeats,
  IFilter,
} from "@/services/copilot-seat-service";

export interface IProps {
  searchParams: IFilter;
}

export default async function Dashboard(props: IProps) {
  const seatsPromise = getCopilotSeats(props.searchParams);
  const [seats] = await Promise.all([seatsPromise]);
  if (seats.status !== "OK") {
    return <ErrorPage error={seats.errors[0].message} />;
  }

  return (
    <DataProvider
      copilotSeats={seats.response}

    >
      <main className="flex flex-1 flex-col gap-4 md:gap-8 pb-8">
        <Header title="Seats" />

        <div className="mx-auto w-full max-w-6xl container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Stats />
            <div className="flex justify-end col-span-4">

            </div>
            <SeatsList />
          </div>
        </div>
      </main>
    </DataProvider>
  );
}
