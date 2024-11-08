import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageTitle } from "@/features/page-header/page-header";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 pb-8">
      <PageHeader>
        <PageTitle>Seats</PageTitle>
        <div className="flex gap-8 justify-between">
          <Skeleton className="h-7 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-[250px]" />
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl container">
        <div className="grid grid-cols-4 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <div className="col-span-full flex flex-col gap-2">
            <Skeleton className="h-6" />
            <Skeleton className="h-4" />
            <Skeleton className="h-72" />
          </div>
        </div>
      </div>
    </main>
  );
}
