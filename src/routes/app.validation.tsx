import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DataValidation } from "@/components/app/DataValidation";

export const Route = createFileRoute("/app/validation")({
  component: ValidationRoute,
});

function ValidationRoute() {
  const navigate = useNavigate();
  return <DataValidation onBack={() => navigate({ to: "/app/prove" })} />;
}
