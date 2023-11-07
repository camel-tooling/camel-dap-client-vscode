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
    BottomBarPanel,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
    WebElement,
} from 'vscode-uitests-tooling';
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    waitUntilTerminalHasText,
    killTerminal,
    disconnectDebugger,
    TEST_ARRAY_RUN
} from '../utils';

describe('Camel file editor test', function () {

    describe('Camel Actions', function () {
        this.timeout(240000);

        let driver: WebDriver;
        let editorView: EditorView;

        before(async function () {
            driver = VSBrowser.instance.driver;
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

            await (await new ActivityBar().getViewControl('Explorer')).openView();

            const section = await new SideBarView().getContent().getSection('resources');
            await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

            editorView = new EditorView();
            await driver.wait(async function () {
                return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
            }, 5000);
        });

        after(async function () {
            await editorView.closeAllEditors();
            await new BottomBarPanel().toggle(false);
        });

        it('Debug and Run action is available', async function () {
            await driver.sleep(500);
            const button = await editorView.getAction(CAMEL_RUN_DEBUG_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it('Run action is available', async function () {
            await driver.sleep(500);
            const button = await editorView.getAction(CAMEL_RUN_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it(`Can execute '${CAMEL_RUN_ACTION_LABEL}' action`, async function () {
            const run = await editorView.getAction(CAMEL_RUN_ACTION_LABEL) as WebElement;
            await run.click();

            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);

            await killTerminal();
        });

        it(`Can execute '${CAMEL_RUN_DEBUG_ACTION_LABEL}' action`, async function () {
            const run = await editorView.getAction(CAMEL_RUN_DEBUG_ACTION_LABEL) as WebElement;
            await run.click();

            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);

            await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
            await disconnectDebugger(driver);
            await killTerminal();
        });

    });

});
