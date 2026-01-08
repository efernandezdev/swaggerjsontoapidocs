#!/usr/bin/env node

import { writeFile } from "fs";
import chalk from "chalk";
import * as readline from "node:readline/promises";
import path from "node:path";

import { initScript } from "./jsonToApiDocs";

async function main() {
  console.log(
    chalk.green(
      "To configure the script correctly, you must ensure that BE is running and you can view the Swagger page.".toUpperCase()
    )
  );
  console.log(
    chalk.red(
      "Have the PATH of the swagger.json and the BASEPATH which will determine how the endpoints will be returned."
    )
  );

  await promptConfigFile();

  initScript();
}

async function promptConfigFile() {
  return new Promise<void>((resolve) => {
    (async () => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      let pathInputValid = true;
      let basepathInputValid = true;

      let pathInput: string = "";
      let basepathInput: string = "";

      while (pathInputValid) {
        pathInput = await rl.question(
          "Copy the correct path to download the swagger.json file, e.g.: http://localhost:5033/swagger/v1/swagger.json: "
        );

        if (pathInput.trim().length > 0) {
          pathInputValid = false;
        }
      }

      while (basepathInputValid) {
        basepathInput = await rl.question(
          "Enter the basepath, e.g.: /api/ to deleted of path /api/Users/{id} => return export const Users_id = (id: any) => `Users/${id}`:"
        );

        if (basepathInput.trim().length > 0) {
          basepathInputValid = false;
        }
      }

      rl.close();

      writeFile(
        path.join(__dirname, "config.json"),
        `{"BASEPATH": "${basepathInput.trim()}","PATH": "${pathInput.trim()}"}`,
        "utf8",
        async (err) => {
          if (err) {
            console.error(err);
          } else {
            resolve();
          }
        }
      );
    })();
  });
}

main();
