'use strict';

const dapServerVersion = '1.6.0';

const download = require('mvn-artifact-download').default;
const fs = require('fs');
const path = require('path');

const MAVEN_REPO_URL = 'https://oss.sonatype.org/content/repositories/releases/';

download('com.github.camel-tooling:camel-dap-server:' + dapServerVersion, './jars/', MAVEN_REPO_URL).then((filename)=>{
	fs.renameSync(filename, path.join('.', 'jars', 'camel-dap-server.jar'));
});

download('com.github.camel-tooling:camel-dap-server:json:cyclonedx:' + dapServerVersion, '.', MAVEN_REPO_URL).then((filename)=>{
	fs.renameSync(filename, path.join('.', 'camel-dap-sbom.json'));
});
