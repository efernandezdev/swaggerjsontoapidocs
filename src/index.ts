#!/usr/bin/env node

import { writeFile } from "node:fs";
import chalk from "chalk";
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { initScript } from "./jsonToApiDocs";
import { params } from "./interfaces/params";

const argv = yargs(hideBin(process.argv))
  .options({
    swagger: {
      alias: "s",
      type: "string",
      demandOption: true,
      describe:
        "URL of the swagger.json file, e.g.: http://localhost:5033/swagger/v1/swagger.json",
    },
    bp: {
      type: "string",
      demandOption: true,
      describe: "Basepath to remove from endpoints, e.g.: /api/",
    },
    output: {
      alias: "o",
      type: "string",
      describe:
        "Path to the output folder destination, e.g.: -o /example/dir/ -> /example/dir/api_docs",
    },
    "skip-folder": {
      type: "boolean",
      describe: "Flat files",
      default: false,
    },
  })
  .version()
  .help()
  .alias("help", "h")
  .strict()
  .parseSync();

async function main() {
  console.log(
    chalk.green("CONFIGURING THE SCRIPT WITH THE PROVIDED ARGUMENTS..."),
  );

  const swaggerPath = argv.swagger;
  const basePath = argv.bp;
  const skipFolder = argv.skipFolder;
  const output = argv.output;

  // Just show console.log
  console.log(chalk.blue(`Swagger Path: ${swaggerPath}`));
  console.log(chalk.blue(`Basepath: ${basePath}`));
  if (skipFolder) {
    console.log(chalk.blue(`skipFolder: ${skipFolder}`));
  }
  if (output) {
    console.log(chalk.blue(`output folder: ${output}api_docs`));
  }
  //

  // Write the configuration to a JSON file
  writeFile(
    path.join(__dirname, "config.json"),
    `{"BASEPATH": "${basePath.trim()}","PATH": "${swaggerPath.trim()}"}`,
    "utf8",
    (err) => {
      if (err) {
        console.error(chalk.red("Error writing the configuration file:"), err);
      } else {
        console.log(chalk.green("Configuration file created successfully."));

        // Object with all flats
        const params: params = { skipFolder, output };

        initScript(params);
      }
    },
  );
}

main();
