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
import { ActivityBar, DebugView, EditorView, TextEditor, VSBrowser, WebDriver } from "vscode-uitests-tooling";
import { activateEditor, activateTerminalView, createFile, createFolder, deleteResource, disconnectDebugger, executeCommand, executeCommandInTerminal, getFileContent, killTerminal, openFileInEditor, selectFromCA, selectTask, waitUntilTerminalHasText } from "../utils";
import { ATTACH_DEBUGGER_USING_PRELAUNCH_TASK, ENABLING_CAMEL_DEBUGGER, LAUNCH_JSON, LAUNCH_START_AND_ATTACH_DEBUGGER, MAIN_CAMEL_EXAMPLE_DIR, MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR, MVN_BUILD_SUCCESS, MVN_CLEAN, MVN_COMPILE, RESOURCES_DIR, RESOURCES_DOT_VSCODE_DIR, RUN_WITH_JBANG_WITH_CAMEL_DEBUG, START_WITH_CAMEL_DEBUG_MVN_GOAL, TASKS_COMMAND, TASKS_TEST_FILE, TASKS_TEST_FILE_CAMEL_XML } from "../variables";
import * as path from 'path';
import { assert } from "chai";

describe('Launch configuration from tasks.json autocompletion', function () {
    this.timeout(360000);

    let driver: WebDriver;
    let textEditor: TextEditor | null;

    async function setupEnvironment(resourceDir: string, vscodeDir: string, launch: boolean = false) {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(resourceDir);
        await (await new ActivityBar().getViewControl('Explorer')).openView();

        await deleteResource(vscodeDir);
        await createFolder(vscodeDir);
        await createFile(TASKS_TEST_FILE, vscodeDir); // create tasks.json

        if (launch) {
            await createFile(LAUNCH_JSON, vscodeDir); // create launch.json
        }
    }

    async function tearDownEnvironment(vscodeDir: string) {
        await killTerminal();
        await new EditorView().closeAllEditors();
        await deleteResource(vscodeDir);
    }

    async function createJsonConfiguration(taskName: string, resourceDir: string, fileName: string, workaroundLine: number) {
        await openFileInEditor(driver, resourceDir, fileName);
        const textEditor = await activateEditor(driver, fileName);
        await textEditor?.setText(getFileContent(fileName, RESOURCES_DIR));
        // workaround for https://github.com/redhat-developer/vscode-extension-tester/issues/931
        await textEditor?.setTextAtLine(workaroundLine, "        ");
        await textEditor?.moveCursor(workaroundLine, 9);
        await selectFromCA(taskName);
        await textEditor?.save();
    }

    async function createTasksJsonConfiguration(taskName: string, resourceDir: string) {
        await createJsonConfiguration(taskName, resourceDir, TASKS_TEST_FILE, 6);
    }

    async function createLaunchJsonConfiguration(taskName: string, resourceDir: string) {
        await createJsonConfiguration(taskName, resourceDir, LAUNCH_JSON, 8);
    }

    describe(RUN_WITH_JBANG_WITH_CAMEL_DEBUG, function () {

        before(async function () {
            await setupEnvironment(RESOURCES_DIR, RESOURCES_DOT_VSCODE_DIR);
        });

        after(async function () {
            await tearDownEnvironment(RESOURCES_DOT_VSCODE_DIR);
        });

        it('Launch with tasks.json configuration', async function () {
            await createTasksJsonConfiguration(RUN_WITH_JBANG_WITH_CAMEL_DEBUG, RESOURCES_DOT_VSCODE_DIR);

            await openFileInEditor(driver, RESOURCES_DIR, TASKS_TEST_FILE_CAMEL_XML);

            await executeCommand(TASKS_COMMAND);
            await selectTask(driver, RUN_WITH_JBANG_WITH_CAMEL_DEBUG);
            await waitUntilTerminalHasText(driver, [ENABLING_CAMEL_DEBUGGER], 2000, 60000);
        });
    });

    describe(START_WITH_CAMEL_DEBUG_MVN_GOAL, function () {

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
            await createTasksJsonConfiguration(START_WITH_CAMEL_DEBUG_MVN_GOAL, MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR);

            await openFileInEditor(driver, EXAMPLE_SRC_DIR, EXAMPLE_FILE);

            await executeCommandInTerminal(MVN_COMPILE);
            await waitUntilTerminalHasText(driver, [MVN_BUILD_SUCCESS], 1000, 60000);

            await executeCommand(TASKS_COMMAND);
            await selectTask(driver, START_WITH_CAMEL_DEBUG_MVN_GOAL);
            await waitUntilTerminalHasText(driver, [ENABLING_CAMEL_DEBUGGER], 2000, 60000);
            assert.isTrue((await (await activateTerminalView()).getText()).includes("Started foo (timer://foo)"));
        });
    });

    describe('Provide UI test for snippet to create combined launch configuration with Camel Debug Adapter', function () {

        before(async function () {
            await setupEnvironment(RESOURCES_DIR, RESOURCES_DOT_VSCODE_DIR, true);
        });

        after(async function () {
            await disconnectDebugger(driver);
            await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
            await tearDownEnvironment(RESOURCES_DOT_VSCODE_DIR);
        });

        it('Combined launch configuration with Camel Debug Adapter', async function () {
            await createTasksJsonConfiguration(RUN_WITH_JBANG_WITH_CAMEL_DEBUG, RESOURCES_DOT_VSCODE_DIR);
            await createLaunchJsonConfiguration(LAUNCH_START_AND_ATTACH_DEBUGGER, RESOURCES_DOT_VSCODE_DIR);
            textEditor = await activateEditor(driver, LAUNCH_JSON);
            await textEditor?.setTextAtLine(12, "            \"preLaunchTask\": \"" + RUN_WITH_JBANG_WITH_CAMEL_DEBUG + "\"");
            await textEditor?.save();

            await openFileInEditor(driver, RESOURCES_DIR, TASKS_TEST_FILE_CAMEL_XML);
            const btn = await new ActivityBar().getViewControl('Run');
            const debugView = (await btn.openView()) as DebugView;

            const configs = await debugView.getLaunchConfigurations();

            assert.isTrue(configs.includes(ATTACH_DEBUGGER_USING_PRELAUNCH_TASK));

            await killTerminal(); // prevent failure
            await debugView.selectLaunchConfiguration(ATTACH_DEBUGGER_USING_PRELAUNCH_TASK);
            await debugView.start();
            await waitUntilTerminalHasText(driver, [ENABLING_CAMEL_DEBUGGER, "A debugger has been attached", "Hello Camel from route1"], 2500, 20000);
        });
    });
});
