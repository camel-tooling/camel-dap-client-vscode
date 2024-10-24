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
import { Context } from 'mocha';
import * as fs from 'node:fs';
import * as path from 'path';
import { ActivityBar, ArraySetting, ArraySettingItem, BottomBarPanel, EditorView, SideBarView, VSBrowser, WebDriver, Workbench, afterEach, before, beforeEach } from 'vscode-uitests-tooling';
import { storageFolder } from '../uitest_runner';
import { CAMEL_ROUTE_YAML_WITH_SPACE, CAMEL_RUN_ACTION_QUICKPICKS_LABEL, CATALOG_VERSION_ID, JBANG_VERSION_ID, RH_MAVEN_REPOSITORY_GLOBAL, TEST_ARRAY_RUN, executeCommand, killTerminal, waitUntilTerminalHasText } from '../utils';

describe.only('Camel User Settings', function () {
    this.timeout(240000);

    let driver: WebDriver;
    let defaultJBangVersion: string;
    let defaultMavenRepository: string;
    let defaultExtraLaunchParameterSetting: string;

    const RESOURCES = path.resolve('src', 'ui-test', 'resources');

    before(async function (this: Context) {
        // Tested in main pipeline.
        if (process.env.CAMEL_VERSION) {
            this.skip();
        }

        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(path.join(RESOURCES));

        defaultJBangVersion = await getSettingsValue('JBang Version') as string;
        defaultMavenRepository = await getSettingsValue('Red Hat Maven Repository') as string;
        defaultExtraLaunchParameterSetting = await getArraySettingsValueAtRow(0, 'Extra Launch Parameter', ['Camel', 'Debug Adapter']) as string;
    });

    describe('Update Camel Version', function () {

        const customCamelVersion = '3.20.1';

        beforeEach(async function () {
            await prepareEnvironment();
        });

        afterEach(async function () {
            await cleanEnvironment();
            resetUserSettings(CATALOG_VERSION_ID);
        });

        it(`Should use '${customCamelVersion}' user defined Camel version`, async function () {
            await setCamelVersion(customCamelVersion);
            await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);

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
            resetUserSettings(JBANG_VERSION_ID);
        });

        it(`Should use default JBang version`, async function () {
            await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);

            await waitUntilTerminalHasText(driver, [`-Dcamel.jbang.version=${defaultJBangVersion}`, ...TEST_ARRAY_RUN.concat([`Apache Camel ${defaultJBangVersion}`])], 6000, 120000);
        });

        it(`Should use user defined JBang version '${customJBangVersion}'`, async function () {
            await setJBangVersion(customJBangVersion);
            await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);

            await waitUntilTerminalHasText(driver, [`-Dcamel.jbang.version=${customJBangVersion}`, ...TEST_ARRAY_RUN.concat([`Apache Camel ${customJBangVersion}`])], 6000, 120000);
        });

    });

    describe('Update Maven Repository', function () {

        const productizedCamelVersion = '3.20.1.redhat-00026';

        beforeEach(async function () {
            await prepareEnvironment();
        });

        afterEach(async function () {
            await cleanEnvironment();
            resetUserSettings(CATALOG_VERSION_ID);
            resetUserSettings(RH_MAVEN_REPOSITORY_GLOBAL);
        });

        it(`Should use '${productizedCamelVersion}' user defined Camel Version and Red Hat Maven Repository`, async function () {
            await setCamelVersion(productizedCamelVersion);
            await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);

            await waitUntilTerminalHasText(driver, [`--camel-version=${productizedCamelVersion} --repos=#repos,${defaultMavenRepository}`, ...TEST_ARRAY_RUN], 6000, 120000);
        });

        it(`Should not use '#repos' placeholder for global Camel JBang repository config`, async function () {
            await setCamelVersion(productizedCamelVersion);
            await setSettingsValue(false, 'Global', ['Camel', 'Debug Adapter', 'Red Hat Maven Repository']);
            await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);

            await waitUntilTerminalHasText(driver, [`--camel-version=${productizedCamelVersion} --repos=${defaultMavenRepository}`, ...TEST_ARRAY_RUN], 6000, 120000);
        });

    });

    describe('Update Extra Launch Parameter setting', function () {
        const newParameter = '--trace';

        it('Should add another parameter', async function () {
            this.timeout(20000);
            const arraySetting = await (await new Workbench().openSettings()).findSetting('Extra Launch Parameter', 'Camel', 'Debug Adapter') as ArraySetting;
            const add1 = await arraySetting.add();
            await add1.setValue(newParameter);
            await add1.ok();
            await waitUntilItemExists(newParameter, arraySetting);

            const newValue = await arraySetting.getItem(newParameter);
            expect(await newValue?.getValue()).is.equal(newParameter);

            const items = await arraySetting.getItems();
            expect(items).is.not.empty;
            expect(items.length).is.equal(3);
        });

        it('Should influence result of "run with JBang" task', async function () {
            await prepareEnvironment();

            await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);
            await waitUntilTerminalHasText(driver, [defaultExtraLaunchParameterSetting, newParameter, `Tracing is enabled on CamelContext`], 15000, 180000);

        });

        it('Should remove parameter', async function () {
            this.timeout(15000);
            const arraySetting = await (await new Workbench().openSettings()).findSetting('Extra Launch Parameter', 'Camel', 'Debug Adapter') as ArraySetting;
            const toRemove = await arraySetting.getItem(newParameter);
            await toRemove?.remove();
            await waitUntilItemNotExists(newParameter, arraySetting);

            const values = await arraySetting.getValues();
            expect(values.length).is.lessThan(3);
            expect(values).not.includes(newParameter);
            await cleanEnvironment();
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

    async function getArraySettingsValueAtRow(row: number, title: string, path: string[] = ['Camel', 'Debug Adapter']): Promise<string | boolean> {
        const arraySetting = await (await new Workbench().openSettings()).findSetting(title, ...path) as ArraySetting;
        const arrayItem = await arraySetting.getItem(row) as ArraySettingItem;
        const itemValue = await arrayItem.getValue() as string;
        await new EditorView().closeEditor('Settings');
        return itemValue;
    }

    function resetUserSettings(id: string): void {
        const settingsPath = path.resolve(storageFolder, 'settings', 'User', 'settings.json');
        const reset = fs.readFileSync(settingsPath, 'utf-8').replace(new RegExp(`"${id}.*`), '');
        fs.writeFileSync(settingsPath, reset, 'utf-8');
    }

    async function waitUntilItemExists(item: string, setting: ArraySetting, timeout: number = 10_000): Promise<void> {
        let values: string[] = [];
        await setting.getDriver().wait(async function () {
            values = await setting.getValues();
            return values.includes(item);
        }, timeout, `Expected item - '${item}' was not found in list of: ${values}`);
    }

    async function waitUntilItemNotExists(item: string, setting: ArraySetting, timeout: number = 10_000): Promise<void> {
        let values: string[] = [];
        await setting.getDriver().wait(async function () {
            values = await setting.getValues();
            return !values.includes(item);
        }, timeout, `Expected item - '${item}' was found in list of: ${values}`);
    }
});
