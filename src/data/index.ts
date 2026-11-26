/**
 * Factory chọn adapter theo DATA_SOURCE=json|api (nguyên tắc D trong SOLID).
 * Page/component chỉ gọi `repos.<tên>.<hàm>()`.
 */
import type { Repositories } from "./repositories";
import { createJsonRepositories } from "./adapters/json";

let cached: Repositories | undefined;

export async function getRepositories(): Promise<Repositories> {
  if (cached) return cached;
  if (process.env.DATA_SOURCE === "api") {
    const { createApiRepositories } = await import("./adapters/api");
    cached = createApiRepositories();
  } else {
    cached = createJsonRepositories();
  }
  return cached;
}

export type * from "./repositories";
