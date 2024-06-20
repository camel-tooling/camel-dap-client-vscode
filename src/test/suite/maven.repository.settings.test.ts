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

suite('Should run commands with Maven Repository specified in settings', () => {

	const RH_CAMEL_VERSION = '3.20.1.redhat-00026';
	const CAMEL_VERSION_SETTINGS_ID = 'camel.debugAdapter.CamelVersion';
	const REPOSITORY_SETTINGS_ID = 'camel.debugAdapter.RedHatMavenRepository';
	const GLOBAL_CAMEL_MAVEN_CONFIG_ID = 'camel.debugAdapter.redHatMavenRepository.global';

	let initialCamelVersion = '';
	let defaultMavenRepository = '';

	suiteSetup(async function () {
		initialCamelVersion = workspace.getConfiguration().get(CAMEL_VERSION_SETTINGS_ID) as string;
		defaultMavenRepository = workspace.getConfiguration().get(REPOSITORY_SETTINGS_ID) as string;
	});

	teardown(async function () {
		this.timeout(4000);
		await workspace.getConfiguration().update(CAMEL_VERSION_SETTINGS_ID, initialCamelVersion);
	});

	test('Default upstream Camel Version in commands is not using Red Hat Maven Repository', async function () {
		const camelRunTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunTask);
		expect(getTaskCommandArguments(camelRunTask)).to.not.includes(`--repos`);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask);
		expect(getTaskCommandArguments(camelRunAndDebugTask)).to.not.includes(`--repos`);
	});

	test('Productized Camel version is using RH Maven Repository in generated \'Run with JBang\' task', async function () {
		await workspace.getConfiguration().update(CAMEL_VERSION_SETTINGS_ID, RH_CAMEL_VERSION);

		const camelRunTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunTask);
		expect(getTaskCommandArguments(camelRunTask)).to.includes(`--repos=#repos,${defaultMavenRepository}`);
	});

	test('Productized Camel version is using RH Maven Repository in generated \'Run and Debug with JBang\' task', async function () {
		await workspace.getConfiguration().update(CAMEL_VERSION_SETTINGS_ID, RH_CAMEL_VERSION);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask);
		expect(getTaskCommandArguments(camelRunAndDebugTask)).to.includes(`--repos=#repos,${defaultMavenRepository}`);
	});

	test('Placeholder \'#repos\' is not used when Global Maven Repository is not set', async function () {
		await workspace.getConfiguration().update(CAMEL_VERSION_SETTINGS_ID, RH_CAMEL_VERSION);
		await workspace.getConfiguration().update(GLOBAL_CAMEL_MAVEN_CONFIG_ID, false);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask);
		expect(getTaskCommandArguments(camelRunAndDebugTask)).to.not.includes(`--repos=#repos`);
	});

});
