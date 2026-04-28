import { apiJson } from "@/lib/api/client";
import type { DonationCreateRequest } from "@/types/api";
import type { CharityDonation } from "@/types/database";

export function createDonation(data: DonationCreateRequest) {
  return apiJson<CharityDonation, DonationCreateRequest>("/api/donations", "POST", data);
}
