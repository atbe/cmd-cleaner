import { describe, it } from "bun:test";
import { OpenAiGpt } from "../classes/OpenAiGpt";
import OpenAI from "openai";

describe("OpenAI GPT", () => {
  it("should be able to return proper function calls", async () => {
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openaiGpt = new OpenAiGpt({
      openai: openaiClient,
    });

    const functionCall = await openaiGpt.evalFunctions({
      prompt: `Current directory contents:

      [
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
  "Workout_Routine.pdf",
  "Email_Drafts/",
  "Email_Drafts/Draft1.eml",
  "Email_Drafts/Draft2.eml",
  "Email_Drafts/Important.eml"
]
      `,
      functions: [
        {
          name: "organize_directory",
          description: `Given a list of files listed in the current directory, organize them like a professional organizer would to make everything easy to find and intuitive. The folders should have descriptive names, and the files should be placed in folders that make sense. If there are files or folders that are extremely ambiguous in nature, place them in a folder named "Unorganized." The response should be list of strings with a value in the format of "FROM:TO" that can be used as parameters to the "mv" unix command line utility where FROM is the first arg, which is the old path, and TO is the second arg which is the new path. Order the results in such a way that ensures that no files will be overwritten or lost.`,
          parameters: {
            moves: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      ],
      options: {
        model: "gpt-3.5-turbo-1106",
        maxTokens: 3_000,
        temperature: 0.5,
        topP: 1,
      },
    });

    console.log(functionCall);

    return true;
  });
});
