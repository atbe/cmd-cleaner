import { Cleaner } from "../interfaces/Cleaner";
import { CleanResult } from "../types/CleanResult";
import { OpenAiGpt } from "./OpenAiGpt";

export class OpenAiCleaner implements Cleaner {
  private readonly openaiGpt: OpenAiGpt;

  constructor(openaiGpt: OpenAiGpt) {
    this.openaiGpt = openaiGpt;
  }

  public async clean(opt: { filePaths: string[] }): Promise<CleanResult> {
    const functionCall = await this.openaiGpt.evalFunctions({
      prompt: `Current directory contents:

${JSON.stringify(opt.filePaths, null, 2)}}`,
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
    if (functionCall.length === 0) {
      throw new Error("Failed to evaluate function.");
    }

    const functionParams = functionCall[0];
    const moves = functionParams.parameters.moves as string[];
    const changes: CleanResult = {
      changes: moves.map((move) => {
        const [from, to] = move.split(":");
        return {
          from,
          to,
        };
      }),
    };

    return changes;
  }
}
