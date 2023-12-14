import { CleanResult } from "../types/CleanResult";
import { Gpt } from "./Gpt.1";

export interface Cleaner {
  gpt: Gpt;

  clean(opt: {
    directory: string;
    maxDepth: number;
    dry: boolean;
  }): Promise<CleanResult>;
}
