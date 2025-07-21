'use strict';

const dapServerVersion = '1.9.0';

const download = require('mvn-artifact-download').default;
const fs = require('fs');
const path = require('path');

// Released versions: https://repo1.maven.org/maven2/
// Snapshot versions: https://central.sonatype.com/repository/maven-snapshots/
const MAVEN_REPO_URL = 'https://repo1.maven.org/maven2/';

download('com.github.camel-tooling:camel-dap-server:' + dapServerVersion, './jars/', MAVEN_REPO_URL).then((filename)=>{
	fs.renameSync(filename, path.join('.', 'jars', 'camel-dap-server.jar'));
});

download('com.github.camel-tooling:camel-dap-server:json:cyclonedx:' + dapServerVersion, '.', MAVEN_REPO_URL).then((filename)=>{
	fs.renameSync(filename, path.join('.', 'camel-dap-sbom.json'));
});
