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
import { expect } from 'chai';
import { Workbench, VSBrowser, EditorView, WebDriver, after, before, ActivityBar, SideBarView, BottomBarPanel } from 'vscode-uitests-tooling';
import * as path from 'path';
import { CAMEL_ROUTE_YAML_WITH_SPACE, CAMEL_RUN_ACTION_LABEL, HELLO_CAMEL_MESSAGE, TEST_ARRAY_RUN, activateTerminalView, executeCommand, killTerminal, waitUntilTerminalHasText } from '../utils';
import * as fs from 'node:fs';
import { storageFolder } from '../uitest_runner';

describe('Camel User Settings', function () {
    this.timeout(240000);

    let driver: WebDriver;
    let defaultCamelVersion: string = '';
    let defaultJBangVersion: string = '';

    const RESOURCES = path.resolve('src', 'ui-test', 'resources');

    before(async function () {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(path.join(RESOURCES));

        defaultCamelVersion = await getSettingsValue('Camel Version');
        defaultJBangVersion = await getSettingsValue('JBang Version');
    });

    after(async function () {
        if (defaultCamelVersion.length > 0) {
            await setCamelVersion(defaultCamelVersion);
        } else {
            resetUserSettings('camel.debugAdapter.CamelVersion');
        }

        resetUserSettings('camel.debugAdapter.JBangVersion');
    });

    describe('Update Camel Version', function () {

        const customCamelVersion = '3.20.1';

        before(async function () {
            await prepareEnvironment();
        });

        after(async function () {
            await cleanEnvironment();
        });

        it(`Should use '${customCamelVersion}' user defined Camel version`, async function () {
            await setCamelVersion(customCamelVersion);
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`--camel-version=${customCamelVersion}`]);
            expect(await (await activateTerminalView()).getText()).to.contain(`--camel-version=${customCamelVersion}`);

            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
            expect(await (await activateTerminalView()).getText()).to.contain(`Apache Camel ${customCamelVersion} (demo route) started`);
            expect(await (await activateTerminalView()).getText()).to.contain(HELLO_CAMEL_MESSAGE);
        });

    });

    describe('Update JBang Version', function () {

        const customJBangVersion = '3.20.5';

        beforeEach(async function () {
            await prepareEnvironment();
        });

        afterEach(async function () {
            await cleanEnvironment();
        });

        it(`Should use default JBang version`, async function () {
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`-Dcamel.jbang.version=${defaultJBangVersion}`]);
            expect(await (await activateTerminalView()).getText()).to.contain(`-Dcamel.jbang.version=${defaultJBangVersion}`);
        });

        it(`Should use user defined JBang version '${customJBangVersion}'`, async function () {
            await setJBangVersion(customJBangVersion);

            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`-Dcamel.jbang.version=${customJBangVersion}`]);
            expect(await (await activateTerminalView()).getText()).to.contain(`-Dcamel.jbang.version=${customJBangVersion}`);
        });

    });

    async function prepareEnvironment(): Promise<void> {
        await (await new ActivityBar().getViewControl('Explorer')).openView();
        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        await driver.wait(async function () {
            return (await new EditorView().getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    }

    async function cleanEnvironment(): Promise<void> {
        await killTerminal();
        await new EditorView().closeAllEditors();
        await new BottomBarPanel().toggle(false);
    }

    async function setCamelVersion(version: string): Promise<void> {
        await setSettingsValue(version, 'Camel Version');
    }

    async function setJBangVersion(version: string): Promise<void> {
        await setSettingsValue(version, 'JBang Version');
    }

    async function setSettingsValue(value: string, title: string): Promise<void> {
        const textField = await (await new Workbench().openSettings()).findSetting(title, 'Camel', 'Debug Adapter');
        await textField.setValue(value);
        await driver.sleep(500);
        await new EditorView().closeEditor('Settings');
    }

    async function getSettingsValue(title: string): Promise<string> {
        const textField = await (await new Workbench().openSettings()).findSetting(title, 'Camel', 'Debug Adapter');
        const value = await textField.getValue() as string;
        await new EditorView().closeEditor('Settings');
        return value;
    }

    function resetUserSettings(id: string) {
        const settingsPath = path.resolve(storageFolder, 'settings', 'User', 'settings.json');
        const reset = fs.readFileSync(settingsPath, 'utf-8').replace(new RegExp(`"${id}.*`), '').replace(/,(?=[^,]*$)/, '');
        fs.writeFileSync(settingsPath, reset, 'utf-8');
    }
});
