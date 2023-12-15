export interface CleanPlanner {
  collectPaths(opt: { directory: string; maxDepth: number }): Promise<string[]>;
}
