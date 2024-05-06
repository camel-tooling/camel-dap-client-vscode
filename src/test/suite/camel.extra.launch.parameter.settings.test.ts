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

import { expect } from 'chai';
import { workspace } from 'vscode';
import { CamelJBangTaskProvider } from '../../task/CamelJBangTaskProvider';
import { getCamelTask, getTaskCommandArguments } from './util';

suite('Should run commands with the extra launch parameter specified in settings', () => {

	const EXTRA_LAUNCH_PARAMETER = ['--fresh'];
	const EXTRA_LAUNCH_PARAMETER_ID = 'camel.debugAdapter.ExtraLaunchParameter';

	let defaultExtraLaunchParameter = [''];

	suiteSetup(function () {
		defaultExtraLaunchParameter = workspace.getConfiguration().get(EXTRA_LAUNCH_PARAMETER_ID) as string[];
	});

	teardown(async function () {
		await workspace.getConfiguration().update(EXTRA_LAUNCH_PARAMETER_ID, defaultExtraLaunchParameter);
	});

	test('Default extra launch parameter is not empty', function () {
		expect(workspace.getConfiguration().get(EXTRA_LAUNCH_PARAMETER_ID)).to.not.be.undefined;
	});

	test('Updated extra launch parameter is correct in generated \'Run with JBang\' task', async function () {
		const config = workspace.getConfiguration();
		expect(config.get(EXTRA_LAUNCH_PARAMETER_ID)).to.not.be.equal(EXTRA_LAUNCH_PARAMETER);

		await config.update(EXTRA_LAUNCH_PARAMETER_ID, EXTRA_LAUNCH_PARAMETER);

		const camelRunTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedRunTask);
		const extraLaunchParameterPosition = 8;
		
		expect((getTaskCommandArguments(camelRunTask)![extraLaunchParameterPosition] as string)).to.includes(EXTRA_LAUNCH_PARAMETER[0]);
	});

	test('Updated extra launch parameter is correct in generated \'Run and Debug with JBang\' task', async function () {
		const config = workspace.getConfiguration();
		expect(config.get(EXTRA_LAUNCH_PARAMETER_ID)).to.not.be.equal(EXTRA_LAUNCH_PARAMETER);

		await config.update(EXTRA_LAUNCH_PARAMETER_ID, EXTRA_LAUNCH_PARAMETER);

		const camelRunAndDebugTask = await getCamelTask(CamelJBangTaskProvider.labelProvidedTask);
		const extraLaunchParameterPosition = 10;
		expect((getTaskCommandArguments(camelRunAndDebugTask)![extraLaunchParameterPosition] as string)).to.includes(EXTRA_LAUNCH_PARAMETER[0]);
	});

});
