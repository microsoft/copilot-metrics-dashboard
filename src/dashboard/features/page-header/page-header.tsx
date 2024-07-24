import { FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {}

export const PageHeader = (props: Props) => {
  return (
    <div className="bg-background py-8 border-b ">
      <div className="mx-auto flex flex-col w-full max-w-6xl gap-8 container ">
        {props.children}
      </div>
    </div>
  );
};

export const PageTitle: FC<PropsWithChildren> = (props) => {
  return (
    <h1 className="text-3xl font-semibold tracking-tighter">
      {props.children}
    </h1>
  );
};
