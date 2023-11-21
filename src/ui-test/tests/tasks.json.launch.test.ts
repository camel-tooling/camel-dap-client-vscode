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
import { activateEditor, createFile, createFolder, deleteResource, executeCommand, getFileContent, killTerminal, openFileInEditor, selectFromCA, waitUntilTerminalHasText } from "../utils";
import { RESOURCES_DIR, RESOURCES_DOT_VSCODE_DIR, TASKS_TEST_FILE, TASKS_TEST_FILE_CAMEL_XML } from "../variables";

describe('Camel Debugger launch configuration snippet using JBang', function () {
    this.timeout(120000);

    let driver: WebDriver;
    let textEditor: TextEditor | null;

    before(async function () {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(RESOURCES_DIR);
        await (await new ActivityBar().getViewControl('Explorer')).openView();

        // prevent failure
        await deleteResource(RESOURCES_DOT_VSCODE_DIR); // folder
        await createFolder(RESOURCES_DOT_VSCODE_DIR);
        await createFile(TASKS_TEST_FILE, RESOURCES_DOT_VSCODE_DIR);
    });

    after(async function () {
        await killTerminal();
        await new EditorView().closeAllEditors();
        await deleteResource(RESOURCES_DOT_VSCODE_DIR);
    });

    it('Launch with tasks.json configuration', async function () {
        await openFileInEditor(driver, RESOURCES_DOT_VSCODE_DIR, TASKS_TEST_FILE);
        textEditor = await activateEditor(driver, TASKS_TEST_FILE);
        await textEditor?.setText(getFileContent(TASKS_TEST_FILE, RESOURCES_DIR));
        // workaround for https://github.com/redhat-developer/vscode-extension-tester/issues/931
        await textEditor?.setTextAtLine(6, "        ");
        await textEditor?.moveCursor(6, 9);
        await selectFromCA('Run Camel application with JBang with camel-debug');
        await textEditor?.save();

        await openFileInEditor(driver, RESOURCES_DIR, TASKS_TEST_FILE_CAMEL_XML);

        await executeCommand("Tasks: Run Task");
        await selectTask(driver, "Run Camel application with JBang with camel-debug");

        await waitUntilTerminalHasText(driver, ["Enabling Camel debugger"], 2000, 90000);
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
