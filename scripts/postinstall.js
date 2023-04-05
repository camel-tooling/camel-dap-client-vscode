'use strict';

const dapServerVersion = '0.6.0';

const download = require('mvn-artifact-download').default;
const fs = require('fs');
const path = require('path');

download('com.github.camel-tooling:camel-dap-server:' + dapServerVersion, './jars/', 'https://oss.sonatype.org/content/repositories/releases/').then((filename)=>{
	fs.renameSync(filename, path.join('.', 'jars', 'camel-dap-server.jar'));
});
