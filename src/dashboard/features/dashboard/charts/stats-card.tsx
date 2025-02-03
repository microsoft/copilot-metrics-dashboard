import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChartHeader } from "./chart-header";

interface StatsCardProps {
  title: string;
  description: string;
  tip?: string;
  value: string;
}

export default function StatsCard(props: StatsCardProps) {
  return (
    <Card className="flex flex-col">
      <ChartHeader title={props.title} description={props.description} tip={props.tip} />
      <CardContent className="flex items-center justify-center flex-1 py-0">
        <CardTitle className="text-[2.8rem] flex-1 tracking-tighter font-bold">
          {props.value}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
