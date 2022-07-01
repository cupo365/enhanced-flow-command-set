// This file is based on https://gist.github.com/estruyf/fb444cfd0de7b3aabe4cb4711ad2118b

"use strict";

const build = require("@microsoft/sp-build-web");
const gutil = require("gulp-util");
const fs = require("fs");

const elementsPath = "./sharepoint/assets/elements.xml";
const elementsSearchString = 'RegistrationId="';
const clientSideInstancePath = "./sharepoint/assets/ClientSideInstance.xml";
const clientSideInstanceSearchString = 'ListTemplateId="';
const listIdLength = 3;
const customListId = 100;
const docLibListId = 101;

build.task("switch-list-type", {
  execute: (config) => {
    return new Promise((resolve, reject) => {
      try {
        // Prepare
        const listType = config.args["list"] || "list";
        let elementsXML = fs.existsSync(elementsPath)
          ? fs.readFileSync(elementsPath).toString()
          : undefined;
        let clientSideInstanceXML = fs.existsSync(clientSideInstancePath)
          ? fs.readFileSync(clientSideInstancePath).toString()
          : undefined;

        if (!elementsXML) {
          throw "Could not fetch the elements XML file content. Check the elements file path.";
        }

        if (!clientSideInstanceXML) {
          throw "Could not fetch the client side instance XML file content. Check the client side instance file path.";
        }

        if (
          listType.toLowerCase() !== "doc" &&
          listType.toLowerCase() !== "list"
        ) {
          throw "Invalid argument. Please choose either 'doc' or 'list' as an argument.";
        }

        // Switch list type
        gutil.log(
          gutil.colors.magenta(
            `Switching list type to: ${
              listType === "doc" ? "Document library" : "Custom list"
            }`
          )
        );

        gutil.log(
          gutil.colors.yellow(
            `Using list template ID: ${
              listType === "doc" ? docLibListId : customListId
            }`
          )
        );
        let registrationIdStart =
          elementsXML.indexOf(elementsSearchString) +
          elementsSearchString.length;
        let currentRegistrationId = elementsXML.substring(
          registrationIdStart,
          registrationIdStart + listIdLength
        );
        let newRegistrationId = `${elementsSearchString}${
          listType === "doc" ? docLibListId : customListId
        }`;

        elementsXML = elementsXML.replace(
          elementsSearchString + currentRegistrationId,
          newRegistrationId
        );

        fs.writeFileSync(elementsPath, elementsXML);

        let listTemplateIdStart =
          clientSideInstanceXML.indexOf(clientSideInstanceSearchString) +
          clientSideInstanceSearchString.length;
        let currentListTemplateId = clientSideInstanceXML.substring(
          listTemplateIdStart,
          listTemplateIdStart + listIdLength
        );
        let newListTemplateId = `${clientSideInstanceSearchString}${
          listType === "doc" ? docLibListId : customListId
        }`;

        clientSideInstanceXML = clientSideInstanceXML.replace(
          clientSideInstanceSearchString + currentListTemplateId,
          newListTemplateId
        );

        fs.writeFileSync(clientSideInstancePath, clientSideInstanceXML);

        gutil.log(
          gutil.colors.green(
            `Successfully switched list type to: ${
              listType === "doc" ? "Document library" : "Custom list"
            }!`
          )
        );

        resolve();
      } catch (ex) {
        gutil.log(gutil.colors.red(ex));

        reject();
      }
    });
  },
});
