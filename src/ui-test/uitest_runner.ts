/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License", destination); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as variables from './variables';
import { ExTester, ReleaseQuality } from 'vscode-uitests-tooling';

export const storageFolder = variables.TEST_RESOURCES_DIR;
const releaseType: ReleaseQuality = process.env.CODE_TYPE === 'insider' ? ReleaseQuality.Insider : ReleaseQuality.Stable;
export const projectPath = path.resolve(__dirname, '..', '..');
const extensionFolder = variables.EXTENSION_DIR;
const coverage = process.argv[2] === 'coverage';
const deploy = process.argv[2] === 'deploy';

async function main(): Promise<void> {
	const tester = new ExTester(storageFolder, releaseType, extensionFolder, coverage);
	const tests = deploy ? 'out/ui-test/tests/deploy*.test.js' : [
		'out/ui-test/env/set.camel.version.js',
		'out/ui-test/tests/!(deploy)*.test.js', // run everything, except deployment tests
		'out/ui-test/env/check.camel.version.js'
	];

	await tester.setupAndRunTests(
		tests,
		process.env.CODE_VERSION,
		{
			'installDependencies': true
		},
		{
			'cleanup': true,
			'settings': './src/ui-test/resources/vscode-settings.json',
			resources: []
		}
	);
	fs.rmSync(extensionFolder, { recursive: true });
}

main().catch((error) => {
	throw Error('Unhandled promise rejection in main: ', error);
});
