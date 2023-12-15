import { CleanResult } from "../types/CleanResult";
import { rename, exists, mkdir } from "fs/promises";

export async function moveFiles(changeResult: CleanResult) {
  for (const change of changeResult.changes) {
    console.log(`Moving ${change.from} to ${change.to}`);

    const path = change.to.split("/").slice(0, -1).join("/");
    const pathExists = await exists(path);
    if (!pathExists) {
      console.log(`Creating directory ${path}`);
      await mkdir(path, { recursive: true });
    }

    await rename(change.from, change.to);
  }
}
