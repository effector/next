"use server";
import { createHash } from "crypto";

export const hashValue = async (value: string) => {

  /**
   * Simulates server-side activities like db queries, etc.
   */
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return createHash("sha256").update(value).digest("hex");
};
