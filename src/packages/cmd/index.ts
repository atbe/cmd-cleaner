import asTable from "as-table";
import clc from "cli-color";
import { Command } from "commander";
import { mkdir } from "fs/promises";
import OpenAI from "openai";
import { homedir } from "os";
import { resolve } from "path";
import { LocalCleanPlanner } from "../core/classes/LocalCleanPlanner";
import { OpenAiCleaner } from "../core/classes/OpenAiCleaner";
import { OpenAiGpt } from "../core/classes/OpenAiGpt";
import { CleanPlanner } from "../core/interfaces/CleanPlanner";
import { Cleaner } from "../core/interfaces/Cleaner";
import { CleanResult } from "../core/types/CleanResult";
import { moveFiles } from "../core/utils/moveFiles";
import { copyFilesToNewDir } from "../core/utils/copyFilesToNewDir";
import { createFakePaths } from "../core/utils/test/createFakePaths";

const program = new Command();

program.allowExcessArguments(false);

const getParams = (program: Command) => {
  const options = program.opts();
  const args = program.args;
  const directory = ["copy", "move"].some((c) => args.includes(c))
    ? args[1]
    : args[0];
  const maxDepth = options.maxDepth;
  const dry: boolean = options.dry;
  const verbose: boolean = options.verbose;

  return {
    directory,
    maxDepth,
    dry,
    verbose,
  };
};

const getPlan = async () => {
  const { directory, maxDepth, dry, verbose } = getParams(program);
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

  if (verbose) {
    console.log(`Found ${pathsToClean.length} paths to clean`);
  }

  return pathsToClean;
};

const printPlan = async (result: CleanResult) => {
  const { directory, verbose } = getParams(program);
  const baseDir = resolve(directory);

  const allFiles = await getPlan();

  if (result.changes.length === 0) {
    console.log(
      "No changes to make, looks like your folder is already very clean!"
    );
    return Promise.resolve();
  }

  const filesThatWillNotBeMoved = allFiles.filter((file) => {
    return !result.changes.some((change) => change.from === file);
  });

  console.log(
    clc.yellowBright(
      `\nFound ${filesThatWillNotBeMoved.length} files that will not be moved:`
    )
  );
  console.log(
    asTable(
      filesThatWillNotBeMoved.map((file) => ({
        file: file.replace(baseDir, ""),
      }))
    )
  );

  console.log(
    clc.greenBright(`\nFound ${result.changes.length} items that can be moved:`)
  );
  console.log(
    asTable(
      result.changes.map((change) => ({
        from: change.from.replace(baseDir, ""),
        to: change.to.replace(baseDir, ""),
      }))
    )
  );
};

const executePlanWithOpenAi = async (pathsToClean: string[]) => {
  const configPath = resolve(homedir(), ".order", "config.json");
  const configFile = Bun.file(configPath);
  const config = await configFile.json();

  const openaiClient = new OpenAI({
    apiKey: config.openaiApiKey,
  });
  const openaiGpt = new OpenAiGpt({
    openai: openaiClient,
  });
  const openaiCleaner: Cleaner = new OpenAiCleaner(openaiGpt);
  const result = await openaiCleaner.clean({
    filePaths: pathsToClean,
  });

  if (!result) {
    throw new Error("No result, something went wrong");
  }

  const sample = result.changes[0];
  if (!sample || "from" in sample === false || "to" in sample === false) {
    throw new Error(
      "Samples are not valid, GPT likely halucinated, something went wrong, please try again"
    );
  }

  return {
    changes: result.changes.filter((change) => change.from && change.to),
  };
};

const confirm = async () => {
  // ask for confirmation to continue using stdin
  const prompt = `(y/n): `;
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
};

program
  .name("order")
  .version("0.0.1")
  .description("Bring order to a directory automagically");

program
  .command("copy")
  .description("Copy files instead of moving them")
  .argument("<string>", "Directory to clean")
  .argument("<destination>", "Destination to copy files to")
  .option("-d, --maxDepth <number>", "Maximum depth to clean to", "1")
  .option("--dry", "Dry run")
  .option("--verbose", "Verbose output")
  .action(async () => {
    const { dry, verbose, directory } = getParams(program);

    const toCopyToDir = program.args[2];
    if (verbose) {
      console.log(`Copying files to ${toCopyToDir}`);
    }

    const pathsToClean = await getPlan();
    const result = await executePlanWithOpenAi(pathsToClean);

    if (verbose || dry) {
      await printPlan(result);
    }

    if (dry) {
      return;
    }

    console.log("Are you sure you want to copy these files?");
    await confirm();
    await copyFilesToNewDir(result, directory, resolve(toCopyToDir));

    console.log("Directory has been cleaned :) 🪄");
    process.exit(0);
  });

program
  .command("move")
  .description(
    "(default) Move files within the target directory instead of copying them to a new directory"
  )
  .argument("<string>", "Directory to clean")
  .option("-d, --maxDepth <number>", "Maximum depth to clean to", "1")
  .option("--dry", "Dry run")
  .option("--verbose", "Verbose output")
  .action(async () => {
    const { dry, verbose } = getParams(program);
    const pathsToClean = await getPlan();

    const result = await executePlanWithOpenAi(pathsToClean);

    if (verbose || dry) {
      await printPlan(result);
    }

    if (dry) {
      return;
    }

    console.log("Are you sure you want to move these files?");
    await confirm();
    await moveFiles(result);

    console.log("Directory has been cleaned :) 🪄");
    process.exit(0);
  });

program
  .command("config")
  .option("--openai-api-key <string>", "OpenAI API key to set")
  .description("Set the config for the CLI")
  .action(async (options) => {
    if (options.openaiApiKey) {
      console.log("Setting OpenAI API key", options);

      const key = options.openaiApiKey;

      const configPath = resolve(homedir(), ".order");
      console.log("configPath", configPath);

      // write config to ~/.order/config.json
      await mkdir(configPath, { recursive: true });
      await Bun.write(
        resolve(homedir(), ".order", "config.json"),
        JSON.stringify(
          {
            openaiApiKey: key,
          },
          null,
          2
        )
      );
    }
  });

program
  .argument("<string>", "Directory to clean")
  .option("-d, --maxDepth <number>", "Maximum depth to clean to", "1")
  .option("--dry", "Dry run")
  .option("--verbose", "Verbose output")
  .action(async () => {
    const { dry } = getParams(program);
    const pathsToClean = await getPlan();

    const result = await executePlanWithOpenAi(pathsToClean);

    if (dry) {
      await printPlan(result);
      return;
    }

    await confirm();
    await moveFiles(result);

    console.log("Directory has been cleaned :) 🪄");
    process.exit(0);
  });

program
  .command("generate-test-folder")
  .arguments("<directory>")
  .action(async (directory) => {
    console.log("Generating test folder", directory);
    await createFakePaths(directory);
  });

program.parse(process.argv);
