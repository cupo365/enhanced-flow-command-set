// This file is inspired by https://gist.github.com/estruyf/fb444cfd0de7b3aabe4cb4711ad2118b

// Disable "The keyword 'const' is reserved" es5 parsing error
/* eslint-env es6 */
/* eslint-disable no-console */

// This script uses .env variables. These variables will only be accessable to runtime
// once gulp bundle has been executed at least once

"use strict";

const build = require("@microsoft/sp-build-web");
const gutil = require("gulp-util");
const fs = require("fs");

const elementsPath = "./sharepoint/assets/elements.xml";
const elementsListTemplateIdSearchString = 'RegistrationId="';
const elementsComponentIdSearchString = 'ClientSideComponentId="';
const clientSideInstancePath = "./sharepoint/assets/ClientSideInstance.xml";
const clientSideInstanceListTemplateIdSearchString = 'ListTemplateId="';
const clientSideInstanceComponentIdSearchString = 'ComponentId="';
const packageSolutionJsonPath = "./config/package-solution.json";
const serveJsonPath = "./config/serve.json";
const yoRcJsonPath = "./.yo-rc.json";
const enhancedPowerAutomateTriggerCommandSetManifestJsonPath =
  "./src/extensions/enhancedPowerAutomateTrigger/EnhancedPowerAutomateTriggerCommandSet.manifest.json";
const listTemplateIdLength = 3;
const guidLength = 36;
const customListId = 100;
const docLibListId = 101;
const validListTypes = ["doc", "list"];

build.task("switch-list-type", {
  execute: (config) => {
    return new Promise((resolve, reject) => {
      try {
        /* PREPARE */
        const listType = config.args["list"] || "list";
        let packageSolutionJson = fs.existsSync(packageSolutionJsonPath)
          ? JSON.parse(fs.readFileSync(packageSolutionJsonPath))
          : undefined;
        let yoRcJson = fs.existsSync(yoRcJsonPath)
          ? JSON.parse(fs.readFileSync(yoRcJsonPath))
          : undefined;
        let enhancedPowerAutomateTriggerCommandSetManifestJson = fs.existsSync(
          enhancedPowerAutomateTriggerCommandSetManifestJsonPath
        )
          ? JSON.parse(
              fs.readFileSync(
                enhancedPowerAutomateTriggerCommandSetManifestJsonPath
              )
            )
          : undefined;
        let serveJson = fs.existsSync(serveJsonPath)
          ? JSON.parse(fs.readFileSync(serveJsonPath))
          : undefined;
        let elementsXML = fs.existsSync(elementsPath)
          ? fs.readFileSync(elementsPath).toString()
          : undefined;
        let clientSideInstanceXML = fs.existsSync(clientSideInstancePath)
          ? fs.readFileSync(clientSideInstancePath).toString()
          : undefined;

        if (!packageSolutionJson) {
          throw "Could not fetch the package-solution JSON file content. Check the packageSolutionJson file path.";
        }

        if (!yoRcJson) {
          throw "Could not fetch the yo-rc JSON file content. Check the yoRcJson file path.";
        }

        if (!enhancedPowerAutomateTriggerCommandSetManifestJson) {
          throw "Could not fetch the enhancedPowerAutomateTriggerCommandSet Manifest JSON file content. Check the enhancedPowerAutomateTriggerCommandSetManifestJson file path.";
        }

        if (!serveJson) {
          throw "Could not fetch the serve JSON file content. Check the serveJson file path.";
        }

        if (!elementsXML) {
          throw "Could not fetch the elements XML file content. Check the elementsXml file path.";
        }

        if (!clientSideInstanceXML) {
          throw "Could not fetch the client side instance XML file content. Check the clientSideInstanceXML file path.";
        }

        if (validListTypes.includes(listType.toLowerCase()) === false) {
          throw `Invalid argument. Please choose one of the following as your argumtent: ${validListTypes.join(
            ", "
          )}.`;
        }

        if (
          listType === "doc" &&
          (!process.env.SPFX_DOC_COMMAND_SOLUTION_NAME ||
            !process.env.SPFX_DOC_COMMAND_SOLUTION_ID ||
            !process.env.SPFX_DOC_COMMAND_SOLUTION_PACKAGE_PATH ||
            !process.env.SPFX_DOC_COMMAND_SOLUTION_LIBRARY_NAME ||
            !process.env.SPFX_DOC_COMMAND_FEATURE_ID ||
            !process.env.SPFX_DOC_COMMAND_COMPONENT_ID)
        ) {
          throw "Could not fetch the required .env variables for list type 'doc'.";
        }

        if (
          listType === "list" &&
          (!process.env.SPFX_LIST_COMMAND_SOLUTION_NAME ||
            !process.env.SPFX_LIST_COMMAND_SOLUTION_ID ||
            !process.env.SPFX_LIST_COMMAND_SOLUTION_PACKAGE_PATH ||
            !process.env.SPFX_LIST_COMMAND_SOLUTION_LIBRARY_NAME ||
            !process.env.SPFX_LIST_COMMAND_FEATURE_ID ||
            !process.env.SPFX_LIST_COMMAND_COMPONENT_ID)
        ) {
          throw "Could not fetch the required .env variables for list type 'doc'.";
        }

        /* INFORM USER OF CHANGES */
        gutil.log(
          gutil.colors.magenta(
            `Switching list type to: ${
              listType === "doc" ? "Document library" : "Custom list"
            }`
          )
        );

        gutil.log(gutil.colors.yellow("Using the following values:"));
        gutil.log(
          gutil.colors.yellow(
            `List template ID: ${
              listType === "doc" ? docLibListId : customListId
            }`
          )
        );
        gutil.log(
          gutil.colors.yellow(
            `Solution ID: ${
              listType === "doc"
                ? process.env.SPFX_DOC_COMMAND_SOLUTION_ID
                : process.env.SPFX_LIST_COMMAND_SOLUTION_ID
            }`
          )
        );
        gutil.log(
          gutil.colors.yellow(
            `Solution name: ${
              listType === "doc"
                ? process.env.SPFX_DOC_COMMAND_SOLUTION_NAME
                : process.env.SPFX_LIST_COMMAND_SOLUTION_NAME
            }`
          )
        );
        gutil.log(
          gutil.colors.yellow(
            `Package path: ${
              listType === "doc"
                ? process.env.SPFX_DOC_COMMAND_SOLUTION_PACKAGE_PATH
                : process.env.SPFX_LIST_COMMAND_SOLUTION_PACKAGE_PATH
            }`
          )
        );
        gutil.log(
          gutil.colors.yellow(
            `Library name: ${
              listType === "doc"
                ? process.env.SPFX_DOC_COMMAND_SOLUTION_LIBRARY_NAME
                : process.env.SPFX_LIST_COMMAND_SOLUTION_LIBRARY_NAME
            }`
          )
        );
        gutil.log(
          gutil.colors.yellow(
            `Feature ID: ${
              listType === "doc"
                ? process.env.SPFX_DOC_COMMAND_FEATURE_ID
                : process.env.SPFX_LIST_COMMAND_FEATURE_ID
            }`
          )
        );
        gutil.log(
          gutil.colors.yellow(
            `Component ID: ${
              listType === "doc"
                ? process.env.SPFX_DOC_COMMAND_COMPONENT_ID
                : process.env.SPFX_LIST_COMMAND_COMPONENT_ID
            }`
          )
        );

        /* SWITCH LIST TYPE */
        // PACKAGE-SOLUTION.JSON
        gutil.log(gutil.colors.magenta("Updating package-solution.json..."));
        packageSolutionJson.solution.name =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_SOLUTION_NAME
            : process.env.SPFX_LIST_COMMAND_SOLUTION_NAME;

        packageSolutionJson.solution.id =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_SOLUTION_ID
            : process.env.SPFX_LIST_COMMAND_SOLUTION_ID;

        packageSolutionJson.solution.features[0].id =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_FEATURE_ID
            : process.env.SPFX_LIST_COMMAND_FEATURE_ID;

        packageSolutionJson.paths.zippedPackage =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_SOLUTION_PACKAGE_PATH
            : process.env.SPFX_LIST_COMMAND_SOLUTION_PACKAGE_PATH;

        // Update package-solution.json
        fs.writeFileSync(
          packageSolutionJsonPath,
          JSON.stringify(packageSolutionJson, null, 2)
        );

        // .YO-RC.JSON
        gutil.log(gutil.colors.magenta("Updating .yo-rc.json..."));
        let newSolutionId =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_SOLUTION_ID
            : process.env.SPFX_LIST_COMMAND_SOLUTION_ID;
        let newLibraryName =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_SOLUTION_LIBRARY_NAME
            : process.env.SPFX_LIST_COMMAND_SOLUTION_LIBRARY_NAME;

        yoRcJson = JSON.parse(
          JSON.stringify(yoRcJson)
            .replace(process.env.SPFX_DOC_COMMAND_SOLUTION_ID, newSolutionId)
            .replace(process.env.SPFX_LIST_COMMAND_SOLUTION_ID, newSolutionId)
            .replace(process.env.SPFX_DEV_COMMAND_SOLUTION_ID, newSolutionId)
        );

        yoRcJson = JSON.parse(
          JSON.stringify(yoRcJson)
            .replace(
              process.env.SPFX_DOC_COMMAND_SOLUTION_LIBRARY_NAME,
              newLibraryName
            )
            .replace(
              process.env.SPFX_LIST_COMMAND_SOLUTION_LIBRARY_NAME,
              newLibraryName
            )
            .replace(
              process.env.SPFX_DEV_COMMAND_SOLUTION_LIBRARY_NAME,
              newLibraryName
            )
        );

        yoRcJson = JSON.parse(
          JSON.stringify(yoRcJson)
            .replace(
              process.env.SPFX_DOC_COMMAND_SOLUTION_LIBRARY_NAME,
              newLibraryName
            )
            .replace(
              process.env.SPFX_LIST_COMMAND_SOLUTION_LIBRARY_NAME,
              newLibraryName
            )
            .replace(
              process.env.SPFX_DEV_COMMAND_SOLUTION_LIBRARY_NAME,
              newLibraryName
            )
        );

        // Update .yo-rc.json
        fs.writeFileSync(yoRcJsonPath, JSON.stringify(yoRcJson, null, 2));

        // EnhancedPowerAutomateTriggerCommandSet.manifest.json
        gutil.log(
          gutil.colors.magenta(
            "Updating EnhancedPowerAutomateTriggerCommandSet.manifest.json..."
          )
        );
        enhancedPowerAutomateTriggerCommandSetManifestJson.id =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_COMPONENT_ID
            : process.env.SPFX_LIST_COMMAND_COMPONENT_ID;

        // Update EnhancedPowerAutomateTriggerCommandSet.manifest.json
        fs.writeFileSync(
          enhancedPowerAutomateTriggerCommandSetManifestJsonPath,
          JSON.stringify(
            enhancedPowerAutomateTriggerCommandSetManifestJson,
            null,
            2
          )
        );

        // SERVE.JSON
        gutil.log(gutil.colors.magenta("Updating serve.json..."));
        let newComponentId =
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_COMPONENT_ID
            : process.env.SPFX_LIST_COMMAND_COMPONENT_ID;
        serveJson.serveConfigurations.default.customActions = JSON.parse(
          JSON.stringify(serveJson.serveConfigurations.default.customActions)
            .replace(process.env.SPFX_DOC_COMMAND_COMPONENT_ID, newComponentId)
            .replace(process.env.SPFX_LIST_COMMAND_COMPONENT_ID, newComponentId)
            .replace(process.env.SPFX_DOC_COMMAND_COMPONENT_ID, newComponentId)
            .replace(process.env.SPFX_DEV_COMMAND_COMPONENT_ID, newComponentId)
        );
        serveJson.serveConfigurations.enhancedPowerAutomateTrigger.customActions =
          JSON.parse(
            JSON.stringify(serveJson.serveConfigurations.default.customActions)
              .replace(
                process.env.SPFX_DOC_COMMAND_COMPONENT_ID,
                newComponentId
              )
              .replace(
                process.env.SPFX_LIST_COMMAND_COMPONENT_ID,
                newComponentId
              )
              .replace(
                process.env.SPFX_DOC_COMMAND_COMPONENT_ID,
                newComponentId
              )
              .replace(
                process.env.SPFX_DEV_COMMAND_COMPONENT_ID,
                newComponentId
              )
          );

        // Update serve.json
        fs.writeFileSync(serveJsonPath, JSON.stringify(serveJson, null, 2));

        // ELEMENTS.XML
        gutil.log(gutil.colors.magenta("Updating elements.xml..."));

        // Switch list template ID
        let registrationIdStart =
          elementsXML.indexOf(elementsListTemplateIdSearchString) +
          elementsListTemplateIdSearchString.length;
        let currentRegistrationId = `${elementsListTemplateIdSearchString}${elementsXML.substring(
          registrationIdStart,
          registrationIdStart + listTemplateIdLength
        )}`;
        let newRegistrationId = `${elementsListTemplateIdSearchString}${
          listType === "doc" ? docLibListId : customListId
        }`;

        elementsXML = elementsXML.replace(
          currentRegistrationId,
          newRegistrationId
        );

        // Switch component ID
        let listClientComponentIdStart =
          elementsXML.indexOf(elementsComponentIdSearchString) +
          elementsComponentIdSearchString.length;
        let currentClientListComponentId = `${elementsComponentIdSearchString}${elementsXML.substring(
          listClientComponentIdStart,
          listClientComponentIdStart + guidLength
        )}`;
        let newListClientComponentId = `${elementsComponentIdSearchString}${
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_COMPONENT_ID
            : process.env.SPFX_LIST_COMMAND_COMPONENT_ID
        }`;

        elementsXML = elementsXML.replace(
          currentClientListComponentId,
          newListClientComponentId
        );

        // Update elements.xml
        fs.writeFileSync(elementsPath, elementsXML);

        // CLIENTSIDEINSTANCE.XML
        gutil.log(gutil.colors.magenta("Updating clientSideInstance.xml..."));

        // Switch list template ID
        let listTemplateIdStart =
          clientSideInstanceXML.indexOf(
            clientSideInstanceListTemplateIdSearchString
          ) + clientSideInstanceListTemplateIdSearchString.length;
        let currentListTemplateId = `${clientSideInstanceListTemplateIdSearchString}${clientSideInstanceXML.substring(
          listTemplateIdStart,
          listTemplateIdStart + listTemplateIdLength
        )}`;
        let newListTemplateId = `${clientSideInstanceListTemplateIdSearchString}${
          listType === "doc" ? docLibListId : customListId
        }`;

        clientSideInstanceXML = clientSideInstanceXML.replace(
          currentListTemplateId,
          newListTemplateId
        );

        // Switch component ID
        let listComponentIdStart =
          clientSideInstanceXML.indexOf(
            clientSideInstanceComponentIdSearchString
          ) + clientSideInstanceComponentIdSearchString.length;
        let currentListComponentId = `${clientSideInstanceComponentIdSearchString}${clientSideInstanceXML.substring(
          listComponentIdStart,
          listComponentIdStart + guidLength
        )}`;
        let newListComponentId = `${clientSideInstanceComponentIdSearchString}${
          listType === "doc"
            ? process.env.SPFX_DOC_COMMAND_COMPONENT_ID
            : process.env.SPFX_LIST_COMMAND_COMPONENT_ID
        }`;

        clientSideInstanceXML = clientSideInstanceXML.replace(
          currentListComponentId,
          newListComponentId
        );

        // Update clientSideInstance.xml
        fs.writeFileSync(clientSideInstancePath, clientSideInstanceXML);

        gutil.log(
          gutil.colors.green(
            `Successfully switched list type to: ${
              listType === "doc" ? "Document library" : "Custom list"
            }!`
          )
        );

        resolve();
      } catch (err) {
        gutil.log(gutil.colors.red(err));

        reject();
      }
    });
  },
});
