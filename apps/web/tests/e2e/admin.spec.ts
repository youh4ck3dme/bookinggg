import { expect, test } from "@playwright/test";

test("admin dashboard renders core sections", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByText("Revenue")).toBeVisible();
  await expect(page.getByText("Bookings Today")).toBeVisible();
  await expect(page.getByText("Live Feed")).toBeVisible();
  await expect(page.getByText("Revenue Trend")).toBeVisible();
});
