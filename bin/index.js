#! /usr/bin/env node
const prompt = require("prompt");
const colors = require("@colors/colors/safe");
const replace = require("replace-in-file");
const fse = require("fs-extra");
const emoji = require("node-emoji");
const fs = require("fs");

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

async function scaffoldCarbonField(fieldName) {
  const PLUGIN_ROOT_DIRECTORY = `${process.cwd()}/${fieldName}`;
  const camelCasedFieldName = fieldName
    .split("_")
    .map((field) => capitalizeWord(field))
    .join("");

  console.log(
    `- Creating a carbon field in ${colors.cyan(PLUGIN_ROOT_DIRECTORY)}...`
  );

  try {
    await fse.copy(`${__dirname}/template/`, `${process.cwd()}/${fieldName}`, {
      overwrite: true,
    });
  } catch (err) {
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    console.log(err);
    process.exit();
  }

  try {
    await replace({
      files: [`${PLUGIN_ROOT_DIRECTORY}/**/*.*`],
      from: /YourFieldName/g,
      to: camelCasedFieldName,
      countMatches: true,
    });
  } catch (error) {
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    console.log(error);
    fs.rm(`${PLUGIN_ROOT_DIRECTORY}/`, { recursive: true });
    process.exit();
  }

  try {
    await replace({
      files: [`${PLUGIN_ROOT_DIRECTORY}/.babelrc.js`],
      from: /YOURFIELDNAME/g,
      to: camelCasedFieldName,
      countMatches: true,
    });
  } catch (error) {
    console.log(error);
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    fs.rm(`${PLUGIN_ROOT_DIRECTORY}/`, { recursive: true });
    process.exit();
  }

  try {
    await replace({
      files: [`${PLUGIN_ROOT_DIRECTORY}/**/*.*`],
      from: /YOURFIELDNAME/g,
      to: camelCasedFieldName,
      countMatches: true,
    });
  } catch (error) {
    console.log(error);
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    fs.rm(`${PLUGIN_ROOT_DIRECTORY}/`, { recursive: true });
    process.exit();
  }

  try {
    await replace({
      files: [`${PLUGIN_ROOT_DIRECTORY}/**/*.*`],
      from: /yourfieldname/g,
      to: fieldName,
      countMatches: true,
    });
  } catch (error) {
    console.log(error);
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    fs.rm(`${PLUGIN_ROOT_DIRECTORY}/`, { recursive: true });
    process.exit();
  }

  fs.renameSync(
    `${PLUGIN_ROOT_DIRECTORY}/core/YOURFIELDNAME_Field.php`,
    `${PLUGIN_ROOT_DIRECTORY}/core/${camelCasedFieldName}_Field.php`
  );

  fs.renameSync(
    `${PLUGIN_ROOT_DIRECTORY}/languages/carbon-field-YOURFIELDNAME.pot`,
    `${PLUGIN_ROOT_DIRECTORY}/languages/carbon-field-${camelCasedFieldName}.pot`
  );
  console.log(`- All done! ${emoji.get("tada")}`);
}

var schema = {
  properties: {
    fieldName: {
      type: "string",
      description: colors.white(
        'Please enter the name of your field, must be lowercased, any spacing can be done with the "_" character (Ex:"image_opts").'
      ),
      pattern: /^[a-z\_]+$/g,
      message: colors.white(
        `Name of the field may only contains letters and underscores, please try again. ${emoji.get(
          "heavy_exclamation_mark"
        )}`
      ),
      required: true,
    },
  },
};
prompt.message = colors.blue("Carbon Fields");

prompt.start();
prompt.get(schema, function (err, result) {
  if (err) {
    console.log(
      "The following error occured while attempting to validate your input".red
    );
    console.log(err);
    process.exit();
  }
  scaffoldCarbonField(result.fieldName);
});
