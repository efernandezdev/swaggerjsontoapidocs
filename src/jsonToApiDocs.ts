import { readFile, mkdir, rm, writeFile, appendFile } from "fs/promises";
import { move } from "fs-extra";
import { join, resolve } from "path";
import chalk from "chalk";
import { format } from "prettier";
import os from "os";
import { exec } from "child_process";
import { params } from "./interfaces/params";

const folderName = "api_docs";
const mainFolderOutPut = join(__dirname, folderName);

let urlSwaggerJson = "";
let basepath = "";

let paramsConfig: params = { skipFolder: false, output: undefined };

async function cleanFolderOutPut() {
  await rm(mainFolderOutPut, {
    recursive: true,
    force: true,
  });
}

export async function initScript(params: params) {
  paramsConfig = params;

  await cleanFolderOutPut();

  const raw = await readFile(join(__dirname, "config.json"), "utf8");
  const config = await JSON.parse(raw);

  urlSwaggerJson = config.PATH;
  basepath = config.BASEPATH;

  try {
    const response = await fetch(urlSwaggerJson);
    const data = await response.json();

    try {
      await writeFile(
        join(__dirname, "paths.json"),
        `${JSON.stringify(data, null, 2)}`,
        "utf8"
      );

      // Start created folder and files
      await filterPathsObject();
    } catch (err) {
      console.error(err);
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      console.log(
        chalk.bgRed.white(" ERROR ") +
          chalk.red(
            "Could not connect: The server is off or the URL is incorrect."
          )
      );
    } else {
      console.log(chalk.red(`✘ unknown error: ${error}`));
    }

    await cleanFileAndConfig();

    return null;
  }
}

async function filterPathsObject() {
  const raw = await readFile(join(__dirname, "paths.json"), "utf8");
  const pathsObj = await JSON.parse(raw);

  const endpoints = Object.keys(pathsObj.paths).map(
    (endpoint: string) => endpoint.split(basepath)[1]
  );

  const foldersName = endpoints.map(
    (endpoint: string) => endpoint.split("/")[0]
  );

  await makeFolders(foldersName);

  await makeFileContainer(endpoints, foldersName);

  if (paramsConfig.output) {
    await moveFolderToChoosePath();
  } else {
    await openFileManager(mainFolderOutPut);
  }

  await cleanFileAndConfig();
}

async function cleanFileAndConfig() {
  await cleanFile();
  await cleanConfig();

  console.log("🧹 Cleaned.");
}

async function cleanFile() {
  await rm(join(__dirname, "paths.json"), { force: true });
}

async function cleanConfig() {
  await rm(join(__dirname, "config.json"), { force: true });
}

async function makeFolders(foldersName: string[]) {
  await mkdir(mainFolderOutPut, { recursive: true });

  // Created or not folder for each files
  if (!paramsConfig.skipFolder) {
    for (const folder of [...new Set(foldersName)]) {
      const folderPath = join(mainFolderOutPut, folder);

      await mkdir(folderPath, { recursive: true });
    }
  }
}

async function makeFileContainer(endpoints: string[], foldersName: string[]) {
  for (const folder of [...new Set(foldersName)]) {
    if (paramsConfig.skipFolder) {
      await appendFile(`${mainFolderOutPut}/${folder}.ts`, "");
    } else {
      await appendFile(`${mainFolderOutPut}/${folder}/${folder}.ts`, "");
    }
  }

  for (const [index, folder] of foldersName.entries()) {
    const endpoint = endpoints[index];

    const filePath = paramsConfig.skipFolder
      ? `${mainFolderOutPut}/${folder}.ts`
      : `${mainFolderOutPut}/${folder}/${folder}.ts`;

    // 1. Extract arguments: from "Usuarios/{id}" extract "id"
    const paramsMatch = endpoint.match(/\{([^}]+)\}/g);

    const args = paramsMatch
      ? paramsMatch.map((p) => p.replace(/[{}]/g, "").concat(":any")).join(", ")
      : "";

    // Build jsDoc just adding @param
    let jsDoc = "";
    if (paramsMatch?.length) {
      const paramsDoc = paramsMatch
        .map((p) => ` * @param ${p.replace(/[{}]/g, "")}`)
        .join("\n");

      jsDoc = `/**\n${paramsDoc}\n */\n`;
    }

    // 2. Clean up the constant name:
    // Replaces special characters with _, collapses duplicates, and removes trailing hyphens
    const name = endpoint
      .replace(/[/|{}]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    // 3. Format the literal template content:
    // Change "{id}" to "${id}" to make it a valid JavaScript variable
    const templatePath = endpoint.replace(/\{/g, "${");

    // 4. Build the final function
    const line = `${jsDoc} export const ${name} = (${args}) => \`${templatePath}\`;\n`;

    try {
      await appendFile(filePath, line);

      await formatWithPrettier(filePath);

      console.log(`✅ Generated: ${name}`);
    } catch (error) {
      console.error(`❌ Error occurred while writing to ${filePath}:`, error);
    }
  }
}

async function openFileManager(fullPath: string) {
  const platform = os.platform();

  let command = "";

  switch (platform) {
    case "win32":
      command = `explorer`;
      break;
    case "darwin":
      command = `open`;
      break;
    case "linux":
      command = `xdg-open`;
      break;
    default:
      console.error(`Platform ${platform} is not supported.`);
      return;
  }

  // open window managger
  exec(`${command} "${fullPath}"`);

  console.log("💾 show result --->", fullPath);
}

async function moveFolderToChoosePath() {
  await move(mainFolderOutPut, `${paramsConfig.output}${folderName}`, {
    overwrite: true,
  });
  await openFileManager(resolve(`${paramsConfig.output}${folderName}`));
}

async function formatWithPrettier(filePath: string) {
  const content = await readFile(filePath, "utf8");

  const formatted = await format(content, {
    parser: "typescript",
    filepath: filePath,
    semi: true,
    singleQuote: true,
    trailingComma: "all",
  });

  await writeFile(filePath, formatted, "utf8");
}
