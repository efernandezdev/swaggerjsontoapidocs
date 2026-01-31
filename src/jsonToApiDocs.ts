import { readFile, mkdir, rm, writeFile, appendFile } from "node:fs/promises";
import { move } from "fs-extra";
import { join, resolve } from "node:path";
import chalk from "chalk";
import { format } from "prettier";
import { params } from "./interfaces/params";

const folderName = "api_docs";
const mainFolderOutPut = join(__dirname, folderName);

let urlSwaggerJson = "";
let basepath = "";

let paramsConfig: params = {
  skipFolder: false,
  output: undefined,
  functionNameLowercase: false,
};

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
        "utf8",
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
            "Could not connect: The server is off or the URL is incorrect.",
          ),
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
  const regexStartWithSlash = /^\//;

  const apiEndpoints = Object.entries(pathsObj.paths).map(
    (
      path: any,
    ): { endpoint: string; methods: string[]; apiEndpoint: string } => ({
      endpoint: path[0].replace(basepath, "").replace(regexStartWithSlash, ""),
      methods: Object.keys(path[1]),
      apiEndpoint: path[0],
    }),
  );

  const endpoints = apiEndpoints.map(({ endpoint }) => endpoint);

  const foldersName = endpoints.map((endpoint: string) =>
    endpoint.split("/")[0].toLocaleLowerCase(),
  );

  await makeFolders(foldersName);

  await makeFileContainer(apiEndpoints, foldersName);

  if (paramsConfig.output) {
    await moveFolderToChoosePath();
  } else {
    await destinationPath(mainFolderOutPut);
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
    for (const folder of new Set(foldersName)) {
      const folderPath = join(mainFolderOutPut, folder);

      await mkdir(folderPath, { recursive: true });
    }
  }
}

const getFilePath = (folder: string): string => {
  return paramsConfig.skipFolder
    ? `${mainFolderOutPut}/${folder}.ts`
    : `${mainFolderOutPut}/${folder}/${folder}.ts`;
};

function normalizeEndpoint(endpoint: string, toLowercase: boolean): string {
  let name = endpoint
    .replace(/[/|{}]/g, "_")
    .replace(/_+/g, "_")
    .replace(/(^_)|(_$)/g, "");

  return toLowercase ? name.toLowerCase() : name;
}

const formatEndpointNames = (endpoint: string) => {
  const name = normalizeEndpoint(endpoint, paramsConfig.functionNameLowercase);

  const templatePath = endpoint.replace(/\{/g, "${");

  return { name, templatePath };
};

const generateDocumentation = (
  endpoint: string,
  methods: string[],
  apiEndpoint: string,
) => {
  const paramsMatch = endpoint.match(/\{([^{}]+)\}/g) || [];

  const args = paramsMatch
    .map((p) => `${p.replace(/[{}]/g, "")}:any`)
    .join(", ");

  const paramsDoc = paramsMatch
    .map((p) => `* @param ${p.replace(/[{}]/g, "")}`)
    .join("\n");

  const endpointLine = apiEndpoint ? `\n* @endpoint ${apiEndpoint}\n` : "";

  const methodsLine = methods
    ? `* @methods ${methods.join(" - ").toUpperCase()}\n`
    : "";

  const paramsLine = paramsDoc ? `${paramsDoc}\n` : "";

  const jsDoc = `/**${endpointLine}${methodsLine}${paramsLine}*/\n`;

  return {
    args,
    jsDoc,
  };
};

async function makeFileContainer(
  apiEndpoints: { endpoint: string; methods: string[]; apiEndpoint: string }[],
  foldersName: string[],
) {
  // Step 1: Initialize files (Set handles uniqueness)
  for (const folder of new Set(foldersName)) {
    await appendFile(getFilePath(folder), "");
  }

  // Step 2: Process endpoints
  for (const [index, folder] of foldersName.entries()) {
    const { endpoint, methods, apiEndpoint } = apiEndpoints[index];

    // Resolves the destination file path based on configuration.
    const filePath = getFilePath(folder);

    // Formats the constant name and the URL template.
    const { name, templatePath } = formatEndpointNames(endpoint);

    // Generates the JSDoc and function arguments
    const { args, jsDoc } = generateDocumentation(
      endpoint,
      methods,
      apiEndpoint,
    );

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

async function destinationPath(fullPath: string) {
  console.log("💾 show result --->", fullPath);
}

async function moveFolderToChoosePath() {
  await move(mainFolderOutPut, `${paramsConfig.output}${folderName}`, {
    overwrite: true,
  });
  await destinationPath(resolve(`${paramsConfig.output}${folderName}`));
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
