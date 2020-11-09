const request = require('../../node_modules/request');
const core = require('../../node_modules/@actions/core');
const yaml = require('../../node_modules/js-yaml')

const tag = core.getInput('image-tag'); // Tag set on the image in dockerhub
const kpsApiKey = core.getInput('kps-api-key'); // KPS API key
const kpsAppId = core.getInput('kps-app-id'); // KPS App ID
const image = core.getInput('image'); // Image repository and name

// Set Request options for fetching application configuration
var options = {
  'method': 'GET',
  'url': 'https://karbon.nutanix.com/v1.0/applications/' + kpsAppId,
  'headers': {
    'Authorization': 'Bearer ' + kpsApiKey,
    'Content-Type': 'application/json'
  }
}
// Request current application configuration
request(options, function (error, response) {
  if (error) throw new Error(error);
    var applicationConfiguration = JSON.parse(response.body); // Parse response to JSON
    var applicationManifest = yaml.load(applicationConfiguration.appManifest); // Parse applicationManifest from YAML to JSON
    applicationManifest.spec.template.spec.containers[0].image = image + ":" + tag; // Set the new image and tag
    applicationConfiguration.appManifest = '---\n' + yaml.safeDump(applicationManifest); // Dump applicationManifest to YAML

    // Set Request options for updating application configuration
    var options = {
      'method': 'PUT',
      'url': 'https://karbon.nutanix.com/v1.0/applications/' + kpsAppId,
      'headers': {
        'Authorization': 'Bearer ' + kpsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationConfiguration)
    }

    // Send PUT request to KPS API to update application configuration
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log("Successfully updated deployment in KPS.");
      console.log(response.body)
    });

});

