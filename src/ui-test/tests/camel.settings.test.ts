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
import { Workbench, VSBrowser, EditorView, WebDriver, before, ActivityBar, SideBarView, BottomBarPanel, beforeEach, afterEach } from 'vscode-uitests-tooling';
import * as path from 'path';
import { CAMEL_ROUTE_YAML_WITH_SPACE, CAMEL_RUN_ACTION_LABEL, TEST_ARRAY_RUN, executeCommand, killTerminal, waitUntilTerminalHasText } from '../utils';
import * as fs from 'node:fs';
import { storageFolder } from '../uitest_runner';

describe('Camel User Settings', function () {
    this.timeout(240000);

    let driver: WebDriver;
    let defaultJBangVersion: string;
    let defaultMavenRepository: string;

    const RESOURCES = path.resolve('src', 'ui-test', 'resources');

    before(async function () {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(path.join(RESOURCES));

        defaultJBangVersion = await getSettingsValue('JBang Version') as string;
        defaultMavenRepository = await getSettingsValue('Red Hat Maven Repository') as string;
    });

    describe('Update Camel Version', function () {

        const customCamelVersion = '3.20.1';

        beforeEach(async function () {
            await prepareEnvironment();
        });

        afterEach(async function () {
            await cleanEnvironment();
            resetUserSettings('camel.debugAdapter.CamelVersion');
        });

        it(`Should use '${customCamelVersion}' user defined Camel version`, async function () {
            await setCamelVersion(customCamelVersion);
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`--camel-version=${customCamelVersion}`, ...TEST_ARRAY_RUN.concat([`Apache Camel ${customCamelVersion}`])], 15000, 180000);
        });

    });

    describe('Update JBang Version', function () {

        const customJBangVersion = '3.20.5';

        beforeEach(async function () {
            await prepareEnvironment();
        });

        afterEach(async function () {
            await cleanEnvironment();
            resetUserSettings('camel.debugAdapter.JBangVersion');
        });

        it(`Should use default JBang version`, async function () {
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`-Dcamel.jbang.version=${defaultJBangVersion}`, ...TEST_ARRAY_RUN.concat([`Apache Camel ${defaultJBangVersion}`])], 6000, 120000);
        });

        it(`Should use user defined JBang version '${customJBangVersion}'`, async function () {
            await setJBangVersion(customJBangVersion);
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`-Dcamel.jbang.version=${customJBangVersion}`, ...TEST_ARRAY_RUN.concat([`Apache Camel ${customJBangVersion}`])], 6000, 120000);
        });

    });

    describe.skip('Update Maven Repository', function () {

        const productizedCamelVersion = '3.20.1.redhat-00026';

        beforeEach(async function () {
            await prepareEnvironment();
        });

        afterEach(async function () {
            await cleanEnvironment();
            resetUserSettings('camel.debugAdapter.CamelVersion');
            resetUserSettings('camel.debugAdapter.redHatMavenRepository.global');
        });

        it(`Should use '${productizedCamelVersion}' user defined Camel Version and Red Hat Maven Repository`, async function () {
            await setCamelVersion(productizedCamelVersion);
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`--camel-version=${productizedCamelVersion} --repos=#repos,${defaultMavenRepository}`, ...TEST_ARRAY_RUN], 6000, 120000);
        });

        it(`Should not use '#repos' placeholder for global Camel JBang repository config`, async function () {
            await setCamelVersion(productizedCamelVersion);
            await setSettingsValue(false, 'Global', ['Camel', 'Debug Adapter', 'Red Hat Maven Repository']);
            await executeCommand(CAMEL_RUN_ACTION_LABEL);

            await waitUntilTerminalHasText(driver, [`--camel-version=${productizedCamelVersion} --repos=${defaultMavenRepository}`, ...TEST_ARRAY_RUN], 6000, 120000);
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

    async function setSettingsValue(value: string | boolean, title: string, path: string[] = ['Camel', 'Debug Adapter']): Promise<void> {
        const textField = await (await new Workbench().openSettings()).findSetting(title, ...path);
        await textField.setValue(value);
        await driver.sleep(500);
        await new EditorView().closeEditor('Settings');
    }

    async function getSettingsValue(title: string, path: string[] = ['Camel', 'Debug Adapter']): Promise<string | boolean> {
        const textField = await (await new Workbench().openSettings()).findSetting(title, ...path);
        const value = await textField.getValue();
        await new EditorView().closeEditor('Settings');
        return value;
    }

    function resetUserSettings(id: string): void {
        const settingsPath = path.resolve(storageFolder, 'settings', 'User', 'settings.json');
        const reset = fs.readFileSync(settingsPath, 'utf-8').replace(new RegExp(`"${id}.*`), '');
        fs.writeFileSync(settingsPath, reset, 'utf-8');
    }
});
