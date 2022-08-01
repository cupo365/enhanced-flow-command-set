// Disable "The keyword 'const' is reserved" es5 parsing error
/* eslint-env es6 */
/* eslint-disable no-console */

"use strict";

/* DEFAULT GULPFILE */
const build = require("@microsoft/sp-build-web");

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set("serve", result.get("serve-deprecated"));

  return result;
};

/* CUSTOM GULPFILE */
// Disable deprecated tslint (for PnP...and its also deprecated)
build.tslintCmd.enabled = false;

// Integrate .env files
// See also: https://digitalworkplace365.wordpress.com/2020/03/05/using-env-files-in-sharepoint-framework-development/
const webpack = require("webpack");
const gutil = require("gulp-util");
const getClientEnvironment = require("./gulp-tasks/process-env");

build.configureWebpack.mergeConfig({
  additionalConfiguration: (cfg) => {
    try {
      // Inform the user of action
      gutil.log(gutil.colors.magenta("Integrating .env variables..."));

      let pluginDefine = null;
      for (var i = 0; i < cfg.plugins.length; i++) {
        var plugin = cfg.plugins[i];
        if (plugin instanceof webpack.DefinePlugin) {
          pluginDefine = plugin;
        }
      }

      const currentEnv = getClientEnvironment().stringified;

      if (pluginDefine) {
        // The parsing error is false alarm. Annoying es6 thingy,
        // and i do not want to install babel eslint just to get rid of this error. You can ignore it for now
        pluginDefine.definitions = {
          ...pluginDefine.definitions,
          ...currentEnv,
        };
      } else {
        cfg.plugins.push(new webpack.DefinePlugin(currentEnv));
      }

      gutil.log(gutil.colors.green("Successfully integrated .env variables!"));

      return cfg;
    } catch (err) {
      gutil.log(
        gutil.colors.red(
          `Failed to integrate .env variables. An error occurred: ${err}`
        )
      );
      return cfg;
    }
  },
});

// Add gulp task switch-list-type
require("./gulp-tasks/switch-list-type");

// Add pre-build task updateSettings
const updateSettings = require("./gulp-tasks/update-settings");
build.rig.addPreBuildTask(updateSettings);

/* DEFAULT GULPFILE */
// Execute gulp
build.initialize(require("gulp"));
