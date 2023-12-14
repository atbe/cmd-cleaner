import { Cleaner } from "../interfaces/Cleaner";
import { Gpt } from "../interfaces/Gpt.1";
import { CleanResult } from "../types/CleanResult";

export class LocalCleaner implements Cleaner {
  gpt: Gpt;
  clean(opt: {
    directory: string;
    maxDepth: number;
    dry: boolean;
  }): Promise<CleanResult> {
    throw new Error("Method not implemented.");
  }
}
