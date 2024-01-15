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
    CAMEL_RUN_ACTION_QUICKPICKS_LABEL,
    CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL,
    waitUntilTerminalHasText,
    TEST_ARRAY_RUN,
    TEST_ARRAY_RUN_DEBUG,
    executeCommand,
    disconnectDebugger,
    killTerminal,
    CAMEL_ROUTE_YAML_WITH_SPACE,
    isCamelVersionProductized
} from '../utils';

describe('JBang commands execution through command palette', function () {
    this.timeout(240000);

    let driver: WebDriver;

    before(async function () {
        driver = VSBrowser.instance.driver;
    });

    after(async function () {
        await new EditorView().closeAllEditors();
    });

    beforeEach(async function () {
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

        await (await new ActivityBar().getViewControl('Explorer')).openView();

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        const editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    });

    afterEach(async function () {
        await killTerminal();
    });

    it(`Execute command '${CAMEL_RUN_ACTION_QUICKPICKS_LABEL}' in command palette`, async function () {
        await executeCommand(CAMEL_RUN_ACTION_QUICKPICKS_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
    });

    it(`Execute command '${CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL}' in command palette`, async function () {
        if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
            this.skip();
        }

        await executeCommand(CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG, 4000, 120000);
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
    });
});
