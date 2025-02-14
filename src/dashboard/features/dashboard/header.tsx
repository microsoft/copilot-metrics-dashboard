import { PageHeader, PageTitle } from "../page-header/page-header";
import { WeekendFilter } from "./filter/weekend-filter";
import { DateFilter } from "./filter/date-filter";
import { Filters } from "./filter/header-filter";

interface HeaderProps {
  isCosmosDb?: boolean;
}

export const Header = ({ isCosmosDb }: HeaderProps) => {
  return (
    <PageHeader>
      <PageTitle>GitHub Copilot Metrics</PageTitle>
      <div className="flex gap-8 justify-between flex-col md:flex-row">
        <Filters />
        <div className="flex gap-2">
          <WeekendFilter />
          <DateFilter limited={!isCosmosDb} />
        </div>
      </div>
    </PageHeader>
  );
};
