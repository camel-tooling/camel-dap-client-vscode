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
import { expect } from "chai";
import { activateEditor, closeEditor, getFileContent, openFileInEditor, selectFromCA } from "../utils";
import { ActivityBar, TextEditor, VSBrowser, WebDriver, afterEach } from "vscode-extension-tester";
import * as path from "path";
import { RESOURCES_DIR, RESOURCES_TASK_EXAMPLES_DIR, TASKS_TEST_FILE } from "../variables";

describe('Completion inside tasks.json', function () {
    this.timeout(120000);

    let driver: WebDriver;
    let textEditor: TextEditor | null;

    before(async function () {
        // Tested in main pipeline.
        if (process.env.CAMEL_VERSION) {
            this.skip();
        }
        
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
        await (await new ActivityBar().getViewControl('Explorer'))?.openView();
    });

    afterEach(async function () {
        await closeEditor(TASKS_TEST_FILE, false);
    });

    const PARAMS = [
        // command, filename 
        ['Launch Camel test with Maven with camel.debug profile', '01_launch_camel_debug_profile.json'],
        ['Run Camel application with JBang with camel-debug', '02_run_jbang_w_camel_debug.json'],
        ['Start Camel application with camel:debug Maven goal', '03_start_mvn_camel_debug_goal.json'],
        ['Start Camel application with Maven Quarkus Dev with camel.debug profile', '04_start_mvn_quarkus_dev_debug_profile.json'],
        ['Start Camel application with Maven with camel.debug profile', '05_start_mvn_camel_debug_profile.json'],
        ['Build a Camel Quarkus application as a Native executable debug-ready', '06_build_native_camel_quarkus_debug.json'],
        ['Start Camel native application debug-ready', '07_start_native_camel_quarkus_debug.json']
    ];

    PARAMS.forEach(function (params) {
        const command = params.at(0) as string;
        const file = params.at(1) as string;

        it(`${command}`, async function () {
            await openFileInEditor(driver, RESOURCES_DIR, TASKS_TEST_FILE);
            textEditor = await activateEditor(driver, TASKS_TEST_FILE);
            // workaround for https://github.com/redhat-developer/vscode-extension-tester/issues/931
            await textEditor?.setTextAtLine(6, "        ");
            await textEditor?.moveCursor(6, 9);
            await selectFromCA(command);
            const text = await textEditor?.getText();
            expect(text).equals(getFileContent(file, RESOURCES_TASK_EXAMPLES_DIR));
        });
    });
});
