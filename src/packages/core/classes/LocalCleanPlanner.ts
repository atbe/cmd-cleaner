import { Dirent, promises as fsPromises } from "fs";
import { exists } from "fs/promises";
import { resolve } from "path";
import { CleanPlanner } from "../interfaces/CleanPlanner";

export class LocalCleanPlanner implements CleanPlanner {
  async readDirRecursive(dirPath: string, maxDepth: number): Promise<string[]> {
    const queue: { path: string; depth: number }[] = [
      { path: dirPath, depth: 1 },
    ];
    const result: string[] = [];

    while (queue.length > 0) {
      const { path: currentPath, depth: currentDepth } = queue.shift()!;

      if (currentDepth > maxDepth) {
        continue;
      }

      try {
        const dirents: Dirent[] = await fsPromises.readdir(currentPath, {
          withFileTypes: true,
        });
        dirents.sort((a, b) => a.name.localeCompare(b.name)); // Sort for determinism

        for (const dirent of dirents) {
          const res = resolve(currentPath, dirent.name);
          if (dirent.isDirectory()) {
            queue.push({ path: res, depth: currentDepth + 1 });
            result.push(res.endsWith("/") ? res : res + "/");
          } else {
            result.push(res);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${currentPath}:`, error);
        throw error; // or handle the error as needed
      }
    }

    return result.sort();
  }

  async collectPaths({
    directory,
    maxDepth,
  }: {
    directory: string;
    maxDepth: number;
  }): Promise<string[]> {
    const directoryExists = exists(directory);
    if (!directoryExists) {
      throw new Error(`Directory ${directory} does not exist.`);
    }

    const filePaths = await this.readDirRecursive(directory, maxDepth);

    return filePaths;
  }
}
