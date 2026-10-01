import { readFile, mkdir, rm, writeFile, appendFile } from 'node:fs/promises';
import { move } from 'fs-extra';
import { join, resolve } from 'node:path';
import chalk from 'chalk';
import { format } from 'prettier';
import { params } from './interfaces/params';
import { apiEndpoints, methods } from './interfaces/apiEndpoints';

const folderName = 'api_docs';
const mainFolderOutPut = join(__dirname, folderName);

let urlSwaggerJson = '';
let basepath = '';

let paramsConfig: params = {
  skipFolder: false,
  output: undefined,
  functionNameLowercase: false,
  ext: '.ts',
  apiModel: false,
  openApi: false,
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

  const raw = await readFile(join(__dirname, 'config.json'), 'utf8');
  const config = await JSON.parse(raw);

  urlSwaggerJson = config.PATH;
  basepath = config.BASEPATH;

  try {
    const response = await fetch(urlSwaggerJson);
    const data = await response.json();

    try {
      await writeFile(
        join(__dirname, 'paths.json'),
        `${JSON.stringify(data, null, 2)}`,
        'utf8',
      );

      // Start created folder and files
      await filterPathsObject();
    } catch (err) {
      console.error(err);
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log(
        chalk.bgRed.white(' ERROR ') +
          chalk.red(
            'Could not connect: The server is off or the URL is incorrect.',
          ),
      );
    } else {
      console.log(chalk.red(`unknown error: ${error}`));
    }

    await cleanFileAndConfig();

    return null;
  }
}

async function filterPathsObject() {
  const raw = await readFile(join(__dirname, 'paths.json'), 'utf8');
  const pathsObj = await JSON.parse(raw);
  const regexStartWithSlash = /^\//;

  const apiEndpoints = Object.entries(pathsObj.paths).map(
    ([pathKey, pathValue]): apiEndpoints => {
      const endpoint = pathKey
        .replace(basepath, '')
        .replace(regexStartWithSlash, '');

      const methods = Object.entries(pathValue as Record<string, methods>).map(
        ([
          verb,
          { summary, responses, requestBody, parameters, deprecated },
        ]) => ({
          verb,
          summary,
          responses,
          requestBody,
          parameters,
          deprecated,
        }),
      );

      const apiEndpoint = pathKey;

      return { endpoint, methods, apiEndpoint };
    },
  );

  const endpoints = apiEndpoints.map(({ endpoint }) => endpoint);

  const foldersName = endpoints.map((endpoint: string) =>
    endpoint.split('/')[0].toLocaleLowerCase(),
  );

  await makeFolders(foldersName);

  await makeFileContainer(apiEndpoints, foldersName, pathsObj.components);

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

  console.log('Cleaned.');
}

async function cleanFile() {
  await rm(join(__dirname, 'paths.json'), { force: true });
}

async function cleanConfig() {
  await rm(join(__dirname, 'config.json'), { force: true });
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
  const ext = paramsConfig.ext ?? '.ts';

  return paramsConfig.skipFolder
    ? `${mainFolderOutPut}/${folder}${ext}`
    : `${mainFolderOutPut}/${folder}/${folder}${ext}`;
};

function normalizeEndpoint(endpoint: string, toLowercase: boolean): string {
  const endpointCleaned = endpoint.replace(/[^a-zA-Z0-9_$/]/g, '');

  const name = endpointCleaned
    .split('/')
    .map((value) => {
      if (value.startsWith('{')) {
        return value;
      } else {
        return toLowercase ? value.toLowerCase() : value;
      }
    })
    .join('_')
    .replace(/[/|{}]/g, '');

  return name;
}

const formatEndpointNames = (endpoint: string) => {
  const name = normalizeEndpoint(endpoint, paramsConfig.functionNameLowercase);

  const templatePath = endpoint.replace(/\{/g, '${');

  return { name, templatePath };
};

const findRefs = (
  obj: methods['requestBody'] | methods['responses'],
): { refs: Set<string>; type: Set<string> } => {
  const refs = new Set<string>();
  const type = new Set<string>();

  const traverse = (
    value: methods['requestBody'] | methods['responses'],
  ): void => {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach(traverse);
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (key === 'type' && typeof child === 'string') {
        type.add(child);
      }

      if (key === '$ref' && typeof child === 'string') {
        refs.add(child);
      }

      traverse(child);
    }
  };

  traverse(obj);

  return { refs, type };
};

const httpMethods = new Set([
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
  'QUERY',
  'PRI',
  'ACL',
  'BASELINE-CONTROL',
  'BIND',
  'CHECKIN',
  'CHECKOUT',
  'COPY',
  'LABEL',
  'LINK',
  'MKACTIVITY',
  'MKCALENDAR',
  'MKCOL',
  'MKREDIRECTREF',
  'MKWORKSPACE',
  'MOVE',
  'ORDERPATCH',
  'PROPFIND',
  'PROPPATCH',
  'REBIND',
  'REPORT',
  'SEARCH',
  'UNBIND',
  'UNCHECKOUT',
  'UNLINK',
  'UNLOCK',
  'UPDATE',
  'UPDATEREDIRECTREF',
  'VERSION-CONTROL',
]);

type responseComponents = {
  responses?: Record<string, methods['responses'] extends infer T ? T : never>;
};

type responseModel = {
  code: string;
  type?: string;
  ref?: string;
};

const getResponseModels = (
  responses: methods['responses'],
  components?: responseComponents,
): responseModel[] => {
  if (!responses) return [];

  return Object.entries(responses).flatMap(([code, response]) => {
    const responseRef = response?.$ref?.split('/').pop();

    const resolvedResponse = responseRef
      ? components?.responses?.[responseRef]
      : response;

    if (!resolvedResponse || Array.isArray(resolvedResponse)) return [];

    return Object.entries(resolvedResponse.content ?? {})
      .filter(([mediaType]) => mediaType.startsWith('application/'))
      .map(([, media]) => {
        const schema = media.schema;
        const ref = schema?.$ref ?? schema?.items?.$ref;

        return {
          code,
          type: schema?.type,
          ref: ref?.split('/').pop(),
        };
      });
  });
};

// --------------------------------------------------
// OpenAPI -> TypeScript mapping
// --------------------------------------------------
const primitiveType = (type: string): string => {
  switch (type) {
    case 'integer':
    case 'number':
      return 'number';

    case 'string':
      return 'string';

    case 'boolean':
      return 'boolean';

    case 'array':
      return '[]';

    default:
      return type;
  }
};

const formatResponseModels = (models: responseModel[]): string =>
  [
    ...new Map(
      models.map(({ code, type, ref }) => {
        const responseType = ref ?? type ?? 'unknown';
        const responseName =
          type === 'array' ? `${responseType}[]` : primitiveType(responseType);

        return [`${code}`, `\n* \t\t ${code}: ${responseName}`];
      }),
    ).values(),
  ].join('');

const responseDocumentation = (
  response: methods['responses'],
  components?: responseComponents,
): string => {
  const documentation = formatResponseModels(
    getResponseModels(response, components),
  );

  return documentation ? `\n*\n* - **Response**: \n* ${documentation}` : '';
};

const generateDocumentation = (
  endpoint: string,
  methods: methods[],
  apiEndpoint: string,
  components?: responseComponents,
) => {
  const paramsMatch = endpoint.match(/\{([^{}]+)\}/g) || [];

  const args = paramsMatch
    .map((p) => {
      const name = p.replace(/[{}]/g, '');

      return paramsConfig.ext === '.ts' ? `${name}: any` : name;
    })
    .join(', ');

  const paramsDoc = paramsMatch
    .map((p) => `* @param ${p.replace(/[{}]/g, '')} - any`)
    .join('\n');

  const endpointLine = apiEndpoint
    ? `*\n* ---\n* **Endpoint**: \`${apiEndpoint}\``
    : '*';

  const methodsDoc = methods
    .map((method, index) => {
      if (method.verb && !httpMethods.has(method.verb.toLocaleUpperCase()))
        return;

      let doc = method.deprecated ? '* @deprecated \n*\n' : '';

      doc += '* **' + method.verb.toUpperCase() + '**: ';

      doc += method.summary ? `${method.summary}` : `without summary`;

      if (
        (paramsConfig.ext === '.ts' && paramsConfig.apiModel) ||
        (paramsConfig.ext === '.ts' && paramsConfig.openApi)
      ) {
        const queryParameter = method.parameters?.find(
          (param) => param.in === 'query',
        );

        if (paramsConfig.apiModel) {
          doc += queryParameter
            ? `\n*\n* - **Query Parameter**: \n*\n* \t\t ${pascalCase(method.verb)}${pascalCase(endpoint.replace(/\/\{[^}]*\}/g, ''))}`
            : '';
        }

        const requestBody = findRefs(method.requestBody);

        doc += requestBody.refs.size
          ? `\n*\n* - **Request Body**: \n*\n* \t\t ${normalizePascalCase(requestBody)}`
          : '';

        doc += responseDocumentation(method.responses, components);
      }

      if (index + 1 !== methods.length) {
        doc += '\n*';
      }

      return doc;
    })
    .filter(Boolean)
    .join('\n');

  const methodsLine = methodsDoc ? `* ##### METHODS\n${methodsDoc}` : '*';

  const paramsLine = paramsDoc
    ? `*\n* ---\n* ##### PATH PARAMETERS\n${paramsDoc}`
    : '*';

  const jsDoc = `
/**
${methodsLine}
${endpointLine}
${paramsLine}
*/\n`;

  return {
    args,
    jsDoc,
  };
};

const normalizePascalCase = (data: {
  refs: Set<string>;
  type: Set<string>;
}): string | undefined =>
  [...data.refs][0]
    ?.split('/')
    .pop()
    ?.split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const pascalCase = (data: string) =>
  data
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

async function makeFileContainer(
  apiEndpoints: apiEndpoints[],
  foldersName: string[],
  components?: responseComponents,
) {
  // Step 1: Initialize files (Set handles uniqueness)
  for (const folder of new Set(foldersName)) {
    await appendFile(getFilePath(folder), '');
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
      components,
    );

    const line = `${jsDoc} export const ${name} = (${args}) => \`${templatePath}\`;\n`;

    try {
      await appendFile(filePath, line);

      await formatWithPrettier(filePath);

      console.log(`Generated: ${name}`);
    } catch (error) {
      console.error(`Error occurred while writing to ${filePath}:`, error);
    }
  }
}

async function destinationPath(fullPath: string) {
  console.log('show result --->', fullPath);
}

async function moveFolderToChoosePath() {
  await move(mainFolderOutPut, `${paramsConfig.output}${folderName}`, {
    overwrite: true,
  });
  await destinationPath(resolve(`${paramsConfig.output}${folderName}`));
}

async function formatWithPrettier(filePath: string) {
  const content = await readFile(filePath, 'utf8');

  const parser = filePath.endsWith('.ts') ? 'typescript' : 'babel';

  const formatted = await format(content, {
    parser,
    filepath: filePath,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'crlf',
  });

  await writeFile(filePath, formatted, 'utf8');
}
