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

import { ShellQuotedString, workspace } from 'vscode';
import { CamelJBangTaskProvider } from '../../task/CamelJBangTaskProvider';
import { expect } from 'chai';
import { getCamelTask, getTaskCommandArguments } from './util';

suite('Should run commands with Camel JBang version specified in settings', () => {

	const CAMEL_JBANG_VERSION = '3.20.2';
	const CAMEL_JBANG_VERSION_SETTINGS_ID = 'camel.debugAdapter.JBangVersion';

	let defaultJBangVersion = '';

	suiteSetup(function () {
		defaultJBangVersion = workspace.getConfiguration().get(CAMEL_JBANG_VERSION_SETTINGS_ID) as string;
	});

	teardown(async function () {
		await workspace.getConfiguration().update(CAMEL_JBANG_VERSION_SETTINGS_ID, defaultJBangVersion);
	});

	test('Default Camel JBang version is not empty', function () {
		expect(workspace.getConfiguration().get(CAMEL_JBANG_VERSION_SETTINGS_ID)).to.not.be.undefined;
	});

	test('Updated Camel JBang version is correct in generated \'Run with JBang\' task', async function () {
		const config = workspace.getConfiguration();
		expect(config.get(CAMEL_JBANG_VERSION_SETTINGS_ID)).to.not.be.equal(CAMEL_JBANG_VERSION);

		await config.update(CAMEL_JBANG_VERSION_SETTINGS_ID, CAMEL_JBANG_VERSION);

		const camelRunTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunTask);
		expect((getTaskCommandArguments(camelRunTask)![0] as ShellQuotedString).value).to.includes(CAMEL_JBANG_VERSION);
	});

	test('Updated Camel JBang version is correct in generated \'Run and Debug with JBang\' task', async function () {
		const config = workspace.getConfiguration();
		expect(config.get(CAMEL_JBANG_VERSION_SETTINGS_ID)).to.not.be.equal(CAMEL_JBANG_VERSION);

		await config.update(CAMEL_JBANG_VERSION_SETTINGS_ID, CAMEL_JBANG_VERSION);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask);
		expect((getTaskCommandArguments(camelRunAndDebugTask)![0] as ShellQuotedString).value).to.includes(CAMEL_JBANG_VERSION);
	});

});
