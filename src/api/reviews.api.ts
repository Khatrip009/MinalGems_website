// src/api/reviews.api.ts
import { apiFetch } from "./client";

export async function getReviews(productId: string) {
  return apiFetch(`/reviews?about_type=product&about_id=${productId}`);
}

export async function submitReview(data: any) {
  return apiFetch("/reviews", {
    method: "POST",
    body: data,
  });
}

export async function getReviewStats(productId: string) {
  return apiFetch(
    `/reviews/stats?about_type=product&about_id=${productId}`
  );
}
