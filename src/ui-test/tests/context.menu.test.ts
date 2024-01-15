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
import * as path from 'path';
import {
    ActivityBar,
    after,
    before,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
} from 'vscode-uitests-tooling';
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    TEST_ARRAY_RUN,
    TEST_ARRAY_RUN_DEBUG,
    disconnectDebugger,
    isCamelVersionProductized,
    killTerminal,
    openContextMenu,
    selectContextMenuItem,
    waitUntilTerminalHasText
} from '../utils';

(process.platform === 'darwin' ? describe.skip : describe)('Camel file context menu test', function () {
    this.timeout(240000);

    let driver: WebDriver;

    before(async function () {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

        await (await new ActivityBar().getViewControl('Explorer')).openView();

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        await driver.wait(async function () {
            return (await new EditorView().getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    });

    after(async function () {
        await new EditorView().closeAllEditors();
    });

    it('Debug and Run menu item is available', async function () {
        const menu = await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE);
        const runAndDebugMenuItem = await menu.hasItem(CAMEL_RUN_DEBUG_ACTION_LABEL);

        expect(runAndDebugMenuItem).to.not.undefined;

        await menu.close();
    });

    it('Run menu item is available', async function () {
        const menu = await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE);
        const runItem = await menu.hasItem(CAMEL_RUN_ACTION_LABEL);

        expect(runItem).to.not.undefined;

        await menu.close();
    });

    it(`Execute command '${CAMEL_RUN_ACTION_LABEL}' in context menu`, async function () {
        await selectContextMenuItem(CAMEL_RUN_ACTION_LABEL, await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE));
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
        await killTerminal();
    });

    it(`Execute command '${CAMEL_RUN_DEBUG_ACTION_LABEL}' in context menu`, async function () {
        if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
            this.skip();
        }

        await selectContextMenuItem(CAMEL_RUN_DEBUG_ACTION_LABEL, await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE));
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG, 4000, 120000);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
        await disconnectDebugger(driver);
        await killTerminal();
    });
});
