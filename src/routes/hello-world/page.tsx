import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetHelloWorld } from "../../api/api.gen";

export const Route = createFileRoute("/hello-world/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useGetHelloWorld();

  const { t } = useTranslation(["common"]);

  useEffect(() => {
    console.log(query);
  }, [query]);

  return (
    <div>
      {query.data ? query.data.data.message : t(($) => $.helloWorldLoading)}
    </div>
  );
}
