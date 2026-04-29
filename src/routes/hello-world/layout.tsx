import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/hello-world")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Home Layout</div>
      <Outlet />
    </>
  );
}
