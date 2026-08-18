import { Badge } from "@/components/ui/badge";
import {
  accommodationStatusLabels,
  type AccommodationStatus,
} from "@/features/accommodations/shared";

type AccommodationStatusBadgeProps = {
  status: AccommodationStatus;
};

export function AccommodationStatusBadge({
  status,
}: AccommodationStatusBadgeProps) {
  const variant =
    status === "published"
      ? "success"
      : status === "archived"
        ? "outline"
        : "warning";

  return (
    <Badge variant={variant}>{accommodationStatusLabels[status]}</Badge>
  );
}
