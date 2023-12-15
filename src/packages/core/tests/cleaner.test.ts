import { describe, expect, it } from "bun:test";
import { resolve } from "path";
import { LocalCleanPlanner } from "../classes/LocalCleanPlanner";
import { CleanPlanner } from "../interfaces/CleanPlanner";
import {
  createFakePaths,
  fakePathsToCreate,
} from "../utils/test/createFakePaths";

describe("Cleaner", () => {
  const testDirectory = resolve("./", "test-directory");

  describe("Planner", () => {
    it("should be able to plan a clean", async () => {
      const cleaner: CleanPlanner = new LocalCleanPlanner();

      await createFakePaths(testDirectory);
      console.log("Created fake paths");

      const cases = [
        {
          depth: 1,
          length:
            fakePathsToCreate.filter(
              (p) => p.split("/").filter((p) => p.length).length === 1
            ).length - 1,
        },
        {
          depth: 2,
          length:
            fakePathsToCreate.filter(
              (p) => p.split("/").filter((p) => p.length).length <= 2
            ).length - 2,
        },
        {
          depth: 3,
          length: 41,
        },
        {
          depth: 4,
          length: 41,
        },
      ];

      for (const { depth, length } of cases) {
        const paths = await cleaner.collectPaths({
          directory: testDirectory,
          maxDepth: depth,
        });

        console.log(`Collected ${paths.length} paths`);

        expect(paths.length).toEqual(length);
      }
    });
  });

  it("should be able to clean a directory", async () => {});
});
