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
    BottomBarPanel,
    EditorActionDropdown,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
} from 'vscode-uitests-tooling';
import {
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    waitUntilTerminalHasText,
    killTerminal,
    disconnectDebugger,
    isCamelVersionProductized,
} from '../utils';
import { CAMEL_RUN_DEBUG_FOLDER_ACTION_LABEL, CAMEL_RUN_DEBUG_WORKSPACE_ACTION_LABEL, CAMEL_RUN_FOLDER_ACTION_LABEL, CAMEL_RUN_WORKSPACE_ACTION_LABEL, TOP_ROUTE_1 } from '../variables';

describe('Camel file editor test', function () {

    describe('Camel Actions', function () {
        this.timeout(300000);

        let driver: WebDriver;
        let editorView: EditorView;

        beforeEach(async function () {
            driver = VSBrowser.instance.driver;
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources', 'actions'));

            await (await new ActivityBar().getViewControl('Explorer')).openView();

            const section = await new SideBarView().getContent().getSection('actions');
            await section.openItem('top', TOP_ROUTE_1);

            editorView = new EditorView();
            await driver.wait(async function () {
                return (await editorView.getOpenEditorTitles()).find(title => title === TOP_ROUTE_1);
            }, 5000);
        });

        afterEach(async function () {
            await editorView.closeAllEditors();
            await new BottomBarPanel().toggle(false);
        });

        it('Run actions are available', async function () {
            if (process.platform === "darwin"){
                this.skip();
            }
            await driver.sleep(500);
            const action = (await editorView.getAction("Run or Debug...")) as EditorActionDropdown;
            const menu = await action.open();
            expect(await menu.hasItem(CAMEL_RUN_ACTION_LABEL)).true;
            expect(await menu.hasItem(CAMEL_RUN_WORKSPACE_ACTION_LABEL)).true;
            expect(await menu.hasItem(CAMEL_RUN_FOLDER_ACTION_LABEL)).true;
            await menu.close();
        });

        it('Debug and Run actions are available', async function () {
            if (process.platform === "darwin"){
                this.skip();
            }
            await driver.sleep(500);
            const action = (await editorView.getAction("Run or Debug...")) as EditorActionDropdown;
            const menu = await action.open();
            expect(await menu.hasItem(CAMEL_RUN_DEBUG_ACTION_LABEL)).true;
            expect(await menu.hasItem(CAMEL_RUN_DEBUG_WORKSPACE_ACTION_LABEL)).true;
            expect(await menu.hasItem(CAMEL_RUN_DEBUG_FOLDER_ACTION_LABEL)).true;
            await menu.close();
        });

        const runActionLabels = [
            { label: CAMEL_RUN_ACTION_LABEL, terminalText: ['Hello Camel from top-route1'] },
            { label: CAMEL_RUN_WORKSPACE_ACTION_LABEL, terminalText:  ['Hello Camel from route1', 'Hello Camel from route2'],},
            { label: CAMEL_RUN_FOLDER_ACTION_LABEL, terminalText: ['Hello Camel from top-route1', 'Hello Camel from top-route2'] }
        ];

        runActionLabels.forEach(runActionLabels => {
            it(`Can execute '${runActionLabels.label}' action`, async function () {
                if (process.platform === "darwin") {
                    this.skip();
                }
                const action = (await editorView.getAction("Run or Debug...")) as EditorActionDropdown;
                const menu = await action.open();
                await menu.select(runActionLabels.label);
                await waitUntilTerminalHasText(driver, runActionLabels.terminalText, 2000, 120000);
                await killTerminal();
            });
        });

        const debugActionLabels = [
            { label: CAMEL_RUN_DEBUG_ACTION_LABEL, terminalText: ['Hello Camel from top-route1']},
            { label: CAMEL_RUN_DEBUG_WORKSPACE_ACTION_LABEL, terminalText: ['Hello Camel from route1', 'Hello Camel from route2'],},
            { label: CAMEL_RUN_DEBUG_FOLDER_ACTION_LABEL, terminalText: ['Hello Camel from top-route1', 'Hello Camel from top-route2']}
        ];

        debugActionLabels.forEach(debugActionLabels => {
            it(`Can execute '${debugActionLabels.label}' action`, async function () {
                if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
                    this.skip();
                }
                if (process.platform === "darwin"){
                    this.skip();
                }
                const action = (await editorView.getAction("Run or Debug...")) as EditorActionDropdown;
                const menu = await action.open();
                await menu.select(debugActionLabels.label);

                await waitUntilTerminalHasText(driver, debugActionLabels.terminalText, 2000, 120000);

                await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
                await disconnectDebugger(driver);
                await killTerminal();
            });
        });
    });
});
