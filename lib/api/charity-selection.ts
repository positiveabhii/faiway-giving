import { apiJson } from "@/lib/api/client";
import type { CharitySelectionRequest } from "@/types/api";
import type { UserCharitySelection } from "@/types/database";

export function updateCharitySelection(data: CharitySelectionRequest) {
  return apiJson<UserCharitySelection, CharitySelectionRequest>("/api/charity-selection", "PATCH", data);
}
