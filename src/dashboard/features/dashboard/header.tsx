import { PageHeader, PageTitle } from "../page-header/page-header";
import { DateFilter } from "./filter/date-filter";
import { Filters } from "./filter/header-filter";

export const Header = () => {
  return (
    <PageHeader>
      <PageTitle>GitHub Copilot Metrics</PageTitle>
      <div className="flex gap-8 justify-between flex-col md:flex-row">
        <Filters />
        <div className="flex gap-2">
          <DateFilter />
        </div>
      </div>
    </PageHeader>
  );
};
