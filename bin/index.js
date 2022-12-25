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
async function bootstrap_php_files(
  root_directory,
  underscroeSeperatedFieldName
) {
  // Edit the php files text
  try {
    await replace({
      files: [
        `${root_directory}/field.php`,
        `${root_directory}/core/YOURFIELDNAME_Field.php`,
      ],
      from: /YOURFIELDNAME/g,
      to: underscroeSeperatedFieldName,
      countMatches: true,
    });
  } catch (error) {
    console.log(error);
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    fs.rm(`${root_directory}/`, { recursive: true });
    process.exit();
  }
  // Rename files
  fs.renameSync(
    `${root_directory}/core/YOURFIELDNAME_Field.php`,
    `${root_directory}/core/${underscroeSeperatedFieldName}_Field.php`
  );
}
async function boostrap_js_and_config_files(
  root_directory,
  cebabCasedFieldName,
  camelCasedFieldName,
  underscroeSeperatedFieldName
) {
  // Edit the js files text
  try {
    // The react files
    await replace({
      files: [`${root_directory}/src/index.js`],
      from: /YourFieldNameField/g,
      to: `${camelCasedFieldName}Field`,
      countMatches: true,
    });
    await replace({
      files: [`${root_directory}/src/index.js`],
      from: /yourfieldname/g,
      to: cebabCasedFieldName,
      countMatches: true,
    });
    await replace({
      files: [`${root_directory}/src/main.js`],
      from: /YOURFIELDNAMEField/g,
      to: `${camelCasedFieldName}Field`,
      countMatches: true,
    });

    // The config files
    await replace({
      files: [`${root_directory}/package.json`],
      from: /carbon-field-YOURFIELDNAME/g,
      to: `carbon-field-${cebabCasedFieldName}`,
      countMatches: true,
    });
    await replace({
      files: [`${root_directory}/languages/carbon-field-YOURFIELDNAME.pot`],
      from: /YOURFIELDNAME/g,
      to: `${camelCasedFieldName}`,
      countMatches: true,
    });

    // composer.json
    await replace({
      files: [`${root_directory}/composer.json`],
      from: /Carbon_Field_YOURFIELDNAME/g,
      to: `Carbon_Field_${underscroeSeperatedFieldName}`,
      countMatches: true,
    });
    await replace({
      files: [`${root_directory}/composer.json`],
      from: /carbon-field-YOURFIELDNAME/g,
      to: `carbon-field-${cebabCasedFieldName}`,
      countMatches: true,
    });
    await replace({
      files: [`${root_directory}/composer.json`],
      from: /YOURFIELDNAME/g,
      to: `${camelCasedFieldName}`,
      countMatches: true,
    });

    // Babel config
    await replace({
      files: [`${root_directory}/.babelrc.js`],
      from: /carbon-fields-YOURFIELDNAME/g,
      to: `carbon-field-${cebabCasedFieldName}`,
      countMatches: true,
    });
  } catch (error) {
    console.log(error);
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    fs.rm(`${root_directory}/`, { recursive: true });
    process.exit();
  }

  // Rename files
  fs.renameSync(
    `${root_directory}/languages/carbon-field-YOURFIELDNAME.pot`,
    `${root_directory}/languages/carbon-field-${cebabCasedFieldName}.pot`
  );
}
async function move_template_to_directory(root_directory) {
  try {
    await fse.copy(`${__dirname}/template/`, root_directory, {
      overwrite: true,
    });
  } catch (err) {
    console.log(
      "An error occured while attempting to scaffold your plugin, the error is most likely due to a problem with the scaffolder itself."
    );
    console.log(err);
    process.exit();
  }
}
async function scaffoldCarbonField(fieldName) {
  const PLUGIN_ROOT_DIRECTORY = `${process.cwd()}/${fieldName}`;
  const camelCasedFieldName = fieldName
    .split("_")
    .map((field) => capitalizeWord(field))
    .join("");

  const underscroeSeperatedFieldName = fieldName
    .split("_")
    .map((field) => capitalizeWord(field))
    .join("_");

  const cebabCasedFieldName = fieldName.split("_").join("-");

  console.log(
    `- Creating a carbon field in ${colors.cyan(
      `~/${PLUGIN_ROOT_DIRECTORY}`
    )}...`
  );
  await move_template_to_directory(PLUGIN_ROOT_DIRECTORY);
  await bootstrap_php_files(
    PLUGIN_ROOT_DIRECTORY,
    underscroeSeperatedFieldName
  );
  await boostrap_js_and_config_files(
    PLUGIN_ROOT_DIRECTORY,
    cebabCasedFieldName,
    camelCasedFieldName,
    underscroeSeperatedFieldName
  );

  console.log(`- All done! ${emoji.get("tada")}`);
  console.log(
    `- Now type ${colors.cyan(`cd ${PLUGIN_ROOT_DIRECTORY}`)} and get to work!`
  );
}

const schema = {
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
