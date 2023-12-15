import { cp } from "fs/promises";
import { resolve } from "path";
import { CleanResult } from "../types/CleanResult";

export async function copyFilesToNewDir(
  changeResult: CleanResult,
  baseDir: string,
  newDir: string
) {
  const base = resolve(baseDir) + "/";

  for (const change of changeResult.changes) {
    const filePath = change.to.replace(base, "");
    const newPath = resolve(newDir, filePath);
    await cp(change.from, newPath, {
      recursive: true,
      errorOnExist: false,
    });
  }
}
