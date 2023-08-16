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

import { workspace } from 'vscode';
import { CamelJBangTaskProvider } from '../../task/CamelJBangTaskProvider';
import { expect } from 'chai';
import { getCamelTask, getTaskCommandArguments } from './util';

suite('Should run commands with Camel version specified in settings', () => {

	const CAMEL_VERSION = '3.20.1';
	const CAMEL_VERSION_SETTINGS_ID = 'camel.debugAdapter.CamelVersion';

	let initialCamelVersion = '';

	suiteSetup(function () {
		initialCamelVersion = workspace.getConfiguration().get(CAMEL_VERSION_SETTINGS_ID) as string;
	});

	teardown(async function () {
		await workspace.getConfiguration().update(CAMEL_VERSION_SETTINGS_ID, initialCamelVersion);
	});

	test('Default Camel version is empty', function () {
		expect(workspace.getConfiguration().get(CAMEL_VERSION_SETTINGS_ID)).to.be.empty;
	});

	test('Default Camel version in commands is same as Camel JBang CLI default version', async function () {
		const defaultJBangVersion = workspace.getConfiguration().get('camel.debugAdapter.JBangVersion') as string;

		const camelRunTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunTask);
		expect(getTaskCommandArguments(camelRunTask)).to.not.includes(`--camel-version=${defaultJBangVersion}`);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedTask);
		expect(getTaskCommandArguments(camelRunAndDebugTask)).to.not.includes(`--camel-version=${defaultJBangVersion}`);
	});

	test('Updated Camel version is correct in generated \'Run with JBang\' task', async function () {
		const config = workspace.getConfiguration();
		expect(config.get(CAMEL_VERSION_SETTINGS_ID)).to.not.be.equal(CAMEL_VERSION);

		await config.update(CAMEL_VERSION_SETTINGS_ID, CAMEL_VERSION);

		const camelRunTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunTask);
		expect(getTaskCommandArguments(camelRunTask)).to.includes(`--camel-version=${CAMEL_VERSION}`);
	});

	test('Updated Camel version is correct in generated \'Run and Debug with JBang\' task', async function () {
		const config = workspace.getConfiguration();
		expect(config.get(CAMEL_VERSION_SETTINGS_ID)).to.not.be.equal(CAMEL_VERSION);

		await config.update(CAMEL_VERSION_SETTINGS_ID, CAMEL_VERSION);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedTask);
		expect(getTaskCommandArguments(camelRunAndDebugTask)).to.includes(`--camel-version=${CAMEL_VERSION}`);
	});

});
