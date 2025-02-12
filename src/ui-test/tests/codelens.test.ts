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
import * as variables from '../variables';
import {
    ActivityBar,
    after,
    before,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver
} from 'vscode-extension-tester';
import {
    disconnectDebugger,
    findCodelens,
    isCamelVersionProductized,
    killTerminal,
    waitUntilTerminalHasText
} from '../utils';

describe('JBang commands execution through command codelens', function () {
    this.timeout(800000);

    let driver: WebDriver;

    before(async function () {
        driver = VSBrowser.instance.driver;
    });

    after(async function () {
        await new EditorView().closeAllEditors();
    });

    beforeEach(async function () {
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

        await (await new ActivityBar().getViewControl('Explorer'))?.openView();

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(variables.CAMEL_ROUTE_YAML_WITH_SPACE);

        const editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === variables.CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 10000, `The test file ${variables.CAMEL_ROUTE_YAML_WITH_SPACE} was not opened`);
    });

    afterEach(async function () {
        await killTerminal();
    });

    it(`Execute command 'apache.camel.run.jbang' with codelens '${variables.CAMEL_RUN_CODELENS}'`, async function () {
        console.log('test starting...');
        try {
            const codelens = await findCodelens(driver, variables.CAMEL_RUN_CODELENS);
            console.log('codelens found');
            await codelens.click();
            console.log('codelens clicked');
        } catch {
            console.log('workaround happening');
            // Workaround: try another time as it seems that sometimes the codelens is recomputed and there is a stale reference error
            const codelens = await findCodelens(driver, variables.CAMEL_RUN_CODELENS);
            console.log('codelens found');
            await codelens.click();
            console.log('codelens clicked');
        }
        await waitUntilTerminalHasText(driver, variables.TEST_ARRAY_RUN, 4000, 350000);
    });

    it(`Execute command 'apache.camel.debug.jbang' with codelens '${variables.CAMEL_DEBUG_CODELENS}'`, async function () {
        if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
            this.skip();
        }

        const codelens = await findCodelens(driver, variables.CAMEL_DEBUG_CODELENS);
        await codelens.click();
        await waitUntilTerminalHasText(driver, variables.TEST_ARRAY_RUN_DEBUG, 4000, 350000);
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug'))?.closeView();
    });
});
