// Disable "The keyword 'const' is reserved" es5 parsing error
/* eslint-env es6 */
/* eslint-disable no-console */

"use strict";

const fs = require("fs");
const gutil = require("gulp-util");
// Note that the environment command is also used in the SPFx pipeline.
// If you use deployment via pipeline and want to alter these configured environments,
// please beware that you will most likely have to alter these in the pipeline as well.
const environments = ["production", "uat", "test", "development"];
const updateAppSettingsUponEnvironmentSwitch = true;
const updatePackageJsonUponEnvironmentSwitch = false;

var UpdateSettings = {
  execute: (config) => {
    return new Promise((resolve, reject) => {
      try {
        // Determine whether an environment was specified
        let environmentArgs = environments.map((environment) => {
          return config.args[environment] !== undefined
            ? config.args[environment]
            : false;
        });
        let isEnvironmentSpecified = environmentArgs.includes(true);

        // If an environment was not specified
        if (!isEnvironmentSpecified) {
          // Not specifying an environment is not code breaking. The webpart will use the current AppSettings.json environment values.
          // Therefore, a warning is printed, informing the user, and the gulp-process will continue onwards
          gutil.log(
            gutil.colors.yellow(
              `Expected environment argument '--{ENVIRONMENT}', but got an invalid value. The following environments are configured: ${environments.join(
                ", "
              )}. The webpart will use the current AppSettings.json environment values.`
            )
          );
          resolve();
        }

        // If an environment was specified
        else {
          const targetEnv = environments[environmentArgs.indexOf(true)];
          gutil.log(
            gutil.colors.magenta(`Switching to environment: ${targetEnv}`)
          );

          // Read all environment appSettings
          let inputFile = fs.readFileSync("./src/AppSettings.all.json");
          let inputJson = JSON.parse(inputFile);

          gutil.log(
            gutil.colors.magenta(
              `Updating AppSettings.json and package-solution.json with ${targetEnv} values...`
            )
          );

          // Log target environment values to the console
          gutil.log(
            gutil.colors.yellow(
              `Using config list title: ${inputJson.environments[targetEnv].ConfigListTitle}`
            )
          );
          gutil.log(
            gutil.colors.yellow(
              `Using flow button display limit: ${inputJson.environments[targetEnv].FlowButtonDisplayLimit}`
            )
          );

          /* UPDATE APPSETTINGS.JSON */
          if (updateAppSettingsUponEnvironmentSwitch) {
            // Read appSettings json file
            let appSettingsIsUpdated = false;
            let appSettings = JSON.parse(
              fs.readFileSync("./src/AppSettings.json")
            );

            // Update settings to target environment values from the appSettings.all.json file if this is
            // not already the current value in the AppSettings.json file.
            if (
              appSettings.ConfigListTitle !==
              inputJson.environments[targetEnv].ConfigListTitle
            ) {
              appSettings.ConfigListTitle =
                inputJson.environments[targetEnv].ConfigListTitle;
              appSettingsIsUpdated = true;
            }

            if (
              appSettings.FlowButtonDisplayLimit !==
              inputJson.environments[targetEnv].FlowButtonDisplayLimit
            ) {
              appSettings.FlowButtonDisplayLimit =
                inputJson.environments[targetEnv].FlowButtonDisplayLimit;
              appSettingsIsUpdated = true;
            }

            // This prevents the function from unnecessarily updating the AppSettings.json file,
            // which, during gulp serve, will cause an annoying infinite rebuild loop
            if (appSettingsIsUpdated) {
              fs.writeFileSync(
                "./src/AppSettings.json",
                JSON.stringify(appSettings, null, 2)
              );
            }
          }

          /* UPDATE PACKAGE-SOLUTION.JSON */
          if (updatePackageJsonUponEnvironmentSwitch) {
            // Read package-solution json file (unnecessary for this webpart,
            // but so you can see how in case it is required for your use case)
            let packageJsonIsUpdated = false;
            let packageJson = JSON.parse(
              fs.readFileSync("./config/package-solution.json")
            );

            // Update settings to stage values from the appSettings.all.json file
            if (
              packageJson.solution.webApiPermissionRequests[0].resource !==
              inputJson.environments[targetEnv].AppResourceName
            ) {
              packageJson.solution.webApiPermissionRequests[0].resource =
                inputJson.environments[targetEnv].AppResourceName;
              packageJsonIsUpdated = true;
            }

            // This prevents the function from unnecessarily updating the AppSettings.json file,
            // which, during gulp serve, will cause an annoying infinite rebuild loop
            if (packageJsonIsUpdated) {
              fs.writeFileSync(
                "./config/package-solution.json",
                JSON.stringify(packageJson, null, 2)
              );
            }
          }

          gutil.log(
            gutil.colors.green(
              `Successfully switched environments to ${targetEnv}`
            )
          );

          resolve();
        }
      } catch (err) {
        gutil.log(gutil.colors.red(err));
        reject(err);
      }
    });
  },
};

exports.default = UpdateSettings;
