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
import { Key } from 'selenium-webdriver';
import {
    ActivityBar,
    BottomBarPanel,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
} from 'vscode-extension-tester';
import {
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    activateEditor,
    waitUntilTerminalHasText,
    killTerminal,
    disconnectDebugger,
    isCamelVersionProductized,
} from '../utils';
import { CAMEL_RUN_DEBUG_FOLDER_ACTION_LABEL, CAMEL_RUN_DEBUG_WORKSPACE_ACTION_LABEL, CAMEL_RUN_FOLDER_ACTION_LABEL, CAMEL_RUN_WORKSPACE_ACTION_LABEL, TOP_ROUTE_1 } from '../variables';
import { clickOnEditorAction, openDropDownMenuEditorAction, selectDropDownMenuEditorAction } from './helper/Awaiters';
import { waitForPortToBeFreed } from './helper/PortHelper';

async function closeRunAndDebugView() {
    try {
        await (await new ActivityBar().getViewControl('Run and Debug'))?.closeView();
    } catch {
        // The debug view is not always opened in this suite.
    }
}

async function disconnectDebuggerIfRunning(driver: WebDriver) {
    try {
        await disconnectDebugger(driver);
    } catch {
        // The test may fail before a debugger session is attached.
    }
}

async function killTerminalIfRunning() {
    try {
        await killTerminal();
    } catch {
        // Some assertions fail before a terminal is created.
    }
}

async function closeOpenContextMenu(driver: WebDriver) {
    try {
        await driver.actions().sendKeys(Key.ESCAPE).perform();
    } catch {
        // Ignore when no menu is opened.
    }
}

describe('Camel file editor test', function () {

    describe('Camel Actions', function () {
        this.timeout(300000);

        let driver: WebDriver;
        let editorView: EditorView;

        beforeEach(async function () {
            driver = VSBrowser.instance.driver;
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources', 'actions'));

            await (await new ActivityBar().getViewControl('Explorer'))?.openView();

            const section = await new SideBarView().getContent().getSection('actions');
            await section.openItem('top', TOP_ROUTE_1);

            editorView = new EditorView();
            await driver.wait(async function () {
                return (await editorView.getOpenEditorTitles()).find(title => title === TOP_ROUTE_1);
            }, 5000);
            await activateEditor(driver, TOP_ROUTE_1);
            await waitForPortToBeFreed(1099);
        });

        afterEach(async function () {
            await closeOpenContextMenu(driver);
            await closeRunAndDebugView();
            await killTerminalIfRunning();
            await editorView.closeAllEditors();
            await new BottomBarPanel().toggle(false);
        });

        it('Run actions are available', async function () {
            if (process.platform === "darwin"){
                this.skip();
            }
            await verifyMenuContainsActions([
                CAMEL_RUN_ACTION_LABEL,
                CAMEL_RUN_WORKSPACE_ACTION_LABEL,
                CAMEL_RUN_FOLDER_ACTION_LABEL
            ]);
        });

        it('Debug and Run actions are available', async function () {
            if (process.platform === "darwin"){
                this.skip();
            }
            await verifyMenuContainsActions([
                CAMEL_RUN_DEBUG_WORKSPACE_ACTION_LABEL,
                CAMEL_RUN_DEBUG_FOLDER_ACTION_LABEL
            ]);
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
                try {
                    await selectDropDownMenuEditorAction(editorView, "Run or Debug...", runActionLabels.label);
                    await waitUntilTerminalHasText(driver, runActionLabels.terminalText, 2000, 120000);
                } finally {
                    await killTerminalIfRunning();
                }
            });
        });

        const debugActionLabels = [
            { label: CAMEL_RUN_DEBUG_ACTION_LABEL, terminalText: ['Hello Camel from top-route1'], directAction: true },
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
                try {
                    if (debugActionLabels.directAction) {
                        await activateEditor(driver, TOP_ROUTE_1);
                        if (!await hasEditorAction(debugActionLabels.label)) {
                            this.skip();
                        }
                        await clickOnEditorAction(editorView, debugActionLabels.label);
                    } else {
                        await selectDropDownMenuEditorAction(editorView, "Run or Debug...", debugActionLabels.label);
                    }

                    await waitUntilTerminalHasText(driver, debugActionLabels.terminalText, 2000, 120000);
                } finally {
                    await closeRunAndDebugView();
                    await disconnectDebuggerIfRunning(driver);
                    await killTerminalIfRunning();
                }
            });
        });

        async function verifyMenuContainsActions(actionLabels: string[]) {
            await activateEditor(driver, TOP_ROUTE_1);
            const menu = await openDropDownMenuEditorAction(editorView, 'Run or Debug...', 15000);
            expect(menu).to.not.be.undefined;

            try {
                const menuText = await menu?.getText();
                actionLabels.forEach(actionLabel => expect(menuText).to.contain(actionLabel));
            } finally {
                try {
                    await menu?.close();
                } catch {
                    await closeOpenContextMenu(driver);
                }
            }
        }

        async function hasEditorAction(actionLabel: string): Promise<boolean> {
            try {
                return await editorView.getAction(actionLabel) !== undefined;
            } catch {
                return false;
            }
        }
    });
});
