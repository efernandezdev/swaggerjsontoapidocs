import { writeFile } from "fs";
import { readFile, mkdir, appendFile, rm } from "fs/promises";
import * as path from "path";
import chalk from "chalk";

const mainFolderOutPut = path.join(__dirname, "api_docs");

let urlSwaggerJson = "";
let basepath = "";

async function cleanFolderOutPut() {
  await rm(mainFolderOutPut, {
    recursive: true,
    force: true,
  });
}

export async function initScript() {
  await cleanFolderOutPut();

  const raw = await readFile(path.join(__dirname, "config.json"), "utf8");
  const config = await JSON.parse(raw);

  urlSwaggerJson = config.PATH;
  basepath = config.BASEPATH;

  try {
    const response = await fetch(urlSwaggerJson);
    const data = await response.json();

    writeFile(
      path.join(__dirname, "paths.json"),
      `${JSON.stringify(data, null, 2)}`,
      "utf8",
      async (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Saved paths.json");

          await filterPathsObject();
        }
      }
    );
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.log(
        chalk.bgRed.white(" ERROR ") +
          chalk.red(
            "Could not connect: The server is off or the URL is incorrect."
          )
      );
    } else {
      console.log(chalk.red(`✘ unknown error: ${error.message}`));
    }

    await cleanFileAndConfig();

    return null;
  }
}

async function filterPathsObject() {
  const raw = await readFile(path.join(__dirname, "paths.json"), "utf8");
  const pathsObj = await JSON.parse(raw);

  const endpoints = Object.keys(pathsObj.paths).map(
    (endpoint: string) => endpoint.split(basepath)[1]
  );

  const foldersName = endpoints.map(
    (endpoint: string) => endpoint.split("/")[0]
  );

  await makeFolders(foldersName);

  await makeFileContainer(endpoints, foldersName);

  await cleanFileAndConfig();
}

async function cleanFileAndConfig() {
  await cleanFile();
  await cleanConfig();
}

async function cleanFile() {
  await rm(path.join(__dirname, "paths.json"), { force: true });
}

async function cleanConfig() {
  writeFile(
    path.join(__dirname, "config.json"),
    `{"BASEPATH": "","PATH": ""}`,
    "utf8",
    async (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Cleaned config");
      }
    }
  );
}

async function makeFolders(foldersName: string[]) {
  await mkdir(mainFolderOutPut, { recursive: true });

  for (const folder of [...new Set(foldersName)]) {
    const folderPath = path.join(mainFolderOutPut, folder);
    await mkdir(folderPath, { recursive: true });
    console.log(`Folder created: ${folderPath}`);
  }
}

async function makeFileContainer(endpoints: string[], foldersName: string[]) {
  for (const folder of [...new Set(foldersName)]) {
    await appendFile(`${mainFolderOutPut}/${folder}/${folder}.ts`, "");
    console.log(`File created: ${mainFolderOutPut}/${folder}/${folder}.ts`);
  }

  for (const [index, folder] of foldersName.entries()) {
    const endpoint = endpoints[index];
    const filePath = `${mainFolderOutPut}/${folder}/${folder}.ts`;

    // 1. Extract arguments: from "Usuarios/{id}" extract "id"
    const paramsMatch = endpoint.match(/\{([^}]+)\}/g);

    const args = paramsMatch
      ? paramsMatch.map((p) => p.replace(/[{}]/g, "").concat(":any")).join(", ")
      : "";

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
    const line = `export const ${name} = (${args}) => \`${templatePath}\`;\n\n`;

    try {
      await appendFile(filePath, line);
      console.log(`✅ Generated: ${name}`);
    } catch (error) {
      console.error(`❌ Error occurred while writing to ${filePath}:`, error);
    }
  }
}
