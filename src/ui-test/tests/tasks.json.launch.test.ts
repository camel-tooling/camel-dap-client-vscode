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
import { ActivityBar, EditorView, InputBox, TextEditor, VSBrowser, WebDriver } from "vscode-uitests-tooling";
import { activateEditor, activateTerminalView, createFile, createFolder, deleteResource, executeCommand, executeCommandInTerminal, getFileContent, killTerminal, openFileInEditor, selectFromCA, waitUntilTerminalHasText } from "../utils";
import { MAIN_CAMEL_EXAMPLE_DIR, MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR, MVN_BUILD_SUCCESS, MVN_CLEAN, MVN_COMPILE, RESOURCES_DIR, RESOURCES_DOT_VSCODE_DIR, TASKS_TEST_FILE, TASKS_TEST_FILE_CAMEL_XML } from "../variables";
import * as path from 'path';
import { assert } from "chai";

describe('Launch configuration from tasks.json autocompletion', function () {
    this.timeout(240000);

    let driver: WebDriver;
    let textEditor: TextEditor | null;

    async function setupEnvironment(resourceDir: string, vscodeDir: string) {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(resourceDir);
        await (await new ActivityBar().getViewControl('Explorer')).openView();

        await deleteResource(vscodeDir);
        await createFolder(vscodeDir);
        await createFile(TASKS_TEST_FILE, vscodeDir);
    }

    async function tearDownEnvironment(vscodeDir: string) {
        await killTerminal();
        await new EditorView().closeAllEditors();
        await deleteResource(vscodeDir);
    }

    async function createTaksJsonConfiguration(taskName: string, resourceDir: string) {
        await openFileInEditor(driver, resourceDir, TASKS_TEST_FILE);
        textEditor = await activateEditor(driver, TASKS_TEST_FILE);
        await textEditor?.setText(getFileContent(TASKS_TEST_FILE, RESOURCES_DIR));
        // workaround for https://github.com/redhat-developer/vscode-extension-tester/issues/931
        await textEditor?.setTextAtLine(6, "        ");
        await textEditor?.moveCursor(6, 9);
        await selectFromCA(taskName);
        await textEditor?.save();
    }

    describe('Run Camel application with JBang with camel-debug', function () {

        before(async function () {
            await setupEnvironment(RESOURCES_DIR, RESOURCES_DOT_VSCODE_DIR);
        });

        after(async function () {
            await tearDownEnvironment(RESOURCES_DOT_VSCODE_DIR);
        });

        it('Launch with tasks.json configuration', async function () {
            await createTaksJsonConfiguration('Run Camel application with JBang with camel-debug', RESOURCES_DOT_VSCODE_DIR);

            await openFileInEditor(driver, RESOURCES_DIR, TASKS_TEST_FILE_CAMEL_XML);

            await executeCommand("Tasks: Run Task");
            await selectTask(driver, "Run Camel application with JBang with camel-debug");
            await waitUntilTerminalHasText(driver, ["Enabling Camel debugger"], 2000, 60000);
        });
    });

    describe('Start Camel application with camel:debug Maven goal', function () {

        let EXAMPLE_SRC_DIR = path.join(MAIN_CAMEL_EXAMPLE_DIR, 'src', 'main', 'java', 'org', 'apache', 'camel', 'example');
        let EXAMPLE_FILE = 'MyApplication.java';

        before(async function () {
            await setupEnvironment(MAIN_CAMEL_EXAMPLE_DIR, MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR);
        });

        after(async function () {
            await tearDownEnvironment(MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR);
            await executeCommandInTerminal(MVN_CLEAN);
            await waitUntilTerminalHasText(driver, [MVN_BUILD_SUCCESS], 1000, 60000);
            await killTerminal();
        });

        it('Launch with tasks.json configuration', async function () {
            await createTaksJsonConfiguration('Start Camel application with camel:debug Maven goal', MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR);

            await openFileInEditor(driver, EXAMPLE_SRC_DIR, EXAMPLE_FILE);

            await executeCommandInTerminal(MVN_COMPILE);
            await waitUntilTerminalHasText(driver, [MVN_BUILD_SUCCESS], 1000, 60000);

            await executeCommand("Tasks: Run Task");
            await selectTask(driver, "Start Camel application with camel:debug Maven goal");
            await waitUntilTerminalHasText(driver, ["Enabling Camel debugger"], 2000, 60000);
            assert.isTrue((await (await activateTerminalView()).getText()).includes("Started foo (timer://foo)"));
        });
    });
});

/**
 * Select specific task from list of available tasks.
 * 
 * @param driver WebDriver.
 * @param task Task name to select.
 */
async function selectTask(driver: WebDriver, task: string): Promise<void> {
    let input: InputBox | undefined;

    await driver.wait(async function () {
        input = await InputBox.create();
        return (await input.isDisplayed());
    }, 30000);

    const quickpicks = await input?.getQuickPicks();
    if (quickpicks !== undefined) {
        for (let quickpick of quickpicks) {
            if (await quickpick.getLabel() === task) {
                await quickpick.select();
            }
        }
    }
}
