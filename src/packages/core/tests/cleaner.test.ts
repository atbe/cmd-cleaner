import { describe, expect, it } from "bun:test";
import { mkdir, rm, stat, exists } from "fs/promises";
import { resolve } from "path";
import { LocalCleaner } from "../classes/LocalCleaner";
import { CleanPlanner } from "../interfaces/CleanPlanner";

describe("Cleaner", () => {
  const testDirectory = resolve("./", "test-directory");
  const fakePathsToCreate = [
    ".DS_Store",
    "New Folder/",
    "New Folder (2)/",
    "Untitled Document.docx",
    "Untitled Spreadsheet.xlsx",
    "Screenshot_20230102.png",
    "Screenshot_20230103.png",
    "Vacation_Photos/",
    "Vacation_Photos/IMG_1003.jpg",
    "Vacation_Photos/IMG_1004.jpg",
    "Vacation_Photos/RandomImage.png",
    "Old_Project.zip",
    "Backup_Old_Laptop/",
    "Backup_Old_Laptop/Photos/",
    "Backup_Old_Laptop/Photos/img1.jpg",
    "Backup_Old_Laptop/Photos/img2.jpg",
    "Backup_Old_Laptop/Documents/",
    "Backup_Old_Laptop/Documents/report_final_final.docx",
    "Backup_Old_Laptop/Documents/Untitled1.docx",
    "Recipe.pdf",
    "Grocery List.txt",
    "To Watch List.docx",
    "To Do List.xlsx",
    "Meeting_Notes_2023-01-08.docx",
    "Meeting_Notes_2023-01-15.docx",
    "Tax_Info_2022/",
    "Tax_Info_2022/W2.pdf",
    "Tax_Info_2022/Donations.xlsx",
    "Random Notes.txt",
    "Ideas for Blog.txt",
    "Invoice_Jan2023.pdf",
    "Invoice_Feb2023.pdf",
    "Old_Essays/",
    "Old_Essays/Essay1.docx",
    "Old_Essays/Essay2.docx",
    "Scripts/",
    "Scripts/script1.py",
    "Scripts/test_script.js",
    "Budget_2023.xlsx",
    "Party_Planning.docx",
    "Downloads/Workout_Routine.pdf",
    "Email_Drafts/",
    "Email_Drafts/Draft1.eml",
  ];

  const createFakePaths = async () => {
    console.log("Checking if test directory exists", testDirectory);
    const testDirectoryExists = await exists(testDirectory);

    console.log("Test directory exists?", testDirectoryExists);
    if (testDirectoryExists) {
      console.log("Removing test directory");
      await rm(testDirectory, { recursive: true, force: true });
    }

    console.log("Creating test directory");
    for (const path of fakePathsToCreate) {
      const fullyResolvedPath = resolve(testDirectory, path);
      if (path.endsWith("/")) {
        await mkdir(fullyResolvedPath, { recursive: true });
      } else {
        await Bun.write(fullyResolvedPath, "");
      }
    }
  };

  describe("Planner", () => {
    it("should be able to plan a clean", async () => {
      const cleaner: CleanPlanner = new LocalCleaner();

      await createFakePaths();
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
