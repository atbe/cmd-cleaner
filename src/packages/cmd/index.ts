import clc from "cli-color";
import { Command } from "commander";
import OpenAI from "openai";
import { resolve } from "path";
import { LocalCleanPlanner } from "../core/classes/LocalCleanPlanner";
import { OpenAiCleaner } from "../core/classes/OpenAiCleaner";
import { OpenAiGpt } from "../core/classes/OpenAiGpt";
import { CleanPlanner } from "../core/interfaces/CleanPlanner";
import { Cleaner } from "../core/interfaces/Cleaner";
import { CleanResult } from "../core/types/CleanResult";
import asTable from "as-table";
import { moveFiles } from "../core/utils/moveFiles";

const program = new Command();

program
  .name("order")
  .version("0.0.1")
  .description("Bring order to a directory automagically");

program
  .argument("<string>", "Directory to clean")
  .option("-d, --maxDepth <number>", "Maximum depth to clean to", "1")
  .option("--dry", "Dry run")
  .option("--verbose", "Verbose output");

program.parse();

const options = program.opts();
const args = program.args;
const directory = args[0];
const maxDepth = options.maxDepth;
const dry: boolean = options.dry;
const verbose: boolean = options.verbose;

if (dry) {
  console.log("Dry run");
}

if (verbose) {
  console.log(`Cleaning ${directory} to depth ${maxDepth}`);
}

const cleanerPlanner: CleanPlanner = new LocalCleanPlanner();
const pathsToClean = await cleanerPlanner.collectPaths({
  directory,
  maxDepth,
});
console.log(`Found ${pathsToClean.length} paths to clean`);

let result: CleanResult | undefined;
const cleanUsingOpenAi = async (dryRun: boolean) => {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openaiGpt = new OpenAiGpt({
    openai: openaiClient,
  });
  const openaiCleaner: Cleaner = new OpenAiCleaner(openaiGpt);
  result = await openaiCleaner.clean({
    filePaths: pathsToClean,
    dry: dryRun,
  });
};

// allows for switching to something like a local model
if (true) {
  await cleanUsingOpenAi(dry);
}

if (!result) {
  throw new Error("No result, something went wrong");
}

if (dry || verbose) {
  console.log("Raw result:", JSON.stringify(result));

  const baseDir = resolve(directory);
  console.log("Changes:");
  console.log(
    asTable(
      result.changes.map((change) => ({
        from: change.from.replace(baseDir, ""),
        to: change.to.replace(baseDir, ""),
      }))
    )
  );

  // ask for confirmation to continue using stdin
  const prompt = `Would you like to continue? (y/n)`;
  process.stdout.write(clc.greenBright(prompt));
  const answer = await new Promise<string>((resolve) => {
    process.stdin.on("data", (data) => {
      resolve(data.toString());
    });
  });
  if (!answer.toLowerCase().startsWith("y")) {
    console.log("Aborting");
    process.exit(0);
  }

  await moveFiles(result);
}

console.log("Directory has been cleaned :) 🪄");
process.exit(0);
