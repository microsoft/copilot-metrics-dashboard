import { ErrorPage } from "../common/error-page";
import { SeatsList } from "./seats-list";
import { DataProvider } from "./seats-state";
import { Header } from "./header";
import { Stats } from "./stats/stats";
import { getFeatures } from "@/utils/helpers";
import { cosmosConfiguration } from "@/services/cosmos-db-service";
import { getCopilotSeats, IFilter as SeatServiceFilter } from "@/services/copilot-seat-service";

export interface IProps {
  searchParams: SeatServiceFilter;
}

export default async function Dashboard(props: IProps) {
  const features = getFeatures();
  const isCosmosDb = cosmosConfiguration();

  if (!features.seats) {
    return <ErrorPage error="Feature not available"></ErrorPage>
  }

  const seatsPromise = getCopilotSeats(props.searchParams);
  const [seats] = await Promise.all([seatsPromise]);
  if (seats.status !== "OK") {
    return <ErrorPage error={seats.errors[0].message} />;
  }

  return (
    <DataProvider copilotSeats={seats.response}>
      <main className="flex flex-1 flex-col gap-4 md:gap-8 pb-8">
        <Header title="Seats" isCosmosDb={isCosmosDb} />
        <div className="mx-auto w-full max-w-6xl container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Stats />
            <div className="flex justify-end col-span-4" />
            <SeatsList />
          </div>
        </div>
      </main>
    </DataProvider>
  );
}