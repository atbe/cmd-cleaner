import { CleanResult } from "../types/CleanResult";

export interface Cleaner {
  clean(opt: { filePaths: string[] }): Promise<CleanResult>;
}
