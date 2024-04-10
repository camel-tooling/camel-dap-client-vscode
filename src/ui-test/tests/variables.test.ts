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
import {
    ActivityBar,
    EditorView,
    SideBarView,
    TextEditor,
    VSBrowser,
    WebDriver
} from "vscode-uitests-tooling";
import {
    CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL,
    disconnectDebugger,
    executeCommand,
    killTerminal,
    waitUntilTerminalHasText,
    getDebuggerSectionItem,
    isCamelVersionProductized,
    isVersionNewer,
} from '../utils';
import { RESOURCES_DIR, VARIABLESTEST_JAVA } from '../variables';

describe('Display exchange variables values test', function () {
   this.timeout(300000);

   let driver: WebDriver;
   let textEditor: TextEditor;

   before(async function () {

    if (isCamelVersionProductized(process.env.CAMEL_VERSION) || (process.env.CAMEL_VERSION !== undefined && !isVersionNewer("4.4.0", process.env.CAMEL_VERSION))){ // available since Camel 4.4
        this.skip();
    }

    driver = VSBrowser.instance.driver;

    await VSBrowser.instance.openResources(RESOURCES_DIR);
    await (await new ActivityBar().getViewControl('Explorer')).openView();
    const section = await new SideBarView().getContent().getSection('resources');

    await section.openItem(VARIABLESTEST_JAVA);
    const editorView = new EditorView();
    await driver.wait(async function () {
        return (await editorView.getOpenEditorTitles()).find(title => title === VARIABLESTEST_JAVA);
    }, 5000);

    await executeCommand(CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL);
    await (await new ActivityBar().getViewControl('Run')).openView();
    await waitUntilTerminalHasText(driver, ['A debugger has been attached'], 4000, 120000);

    textEditor = new TextEditor();
    });

    after(async function () {
        if (isCamelVersionProductized(process.env.CAMEL_VERSION) || (process.env.CAMEL_VERSION !== undefined && !isVersionNewer("4.4.0", process.env.CAMEL_VERSION))){
            // do nothing - after is executed even if skip is called in before
        }
        else {
            await disconnectDebugger(driver);
            await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
            await killTerminal();
            await new EditorView().closeAllEditors();
        }     
    });

    it('Variable is displayed', async function () {
        await driver.wait(async function () {
            return await textEditor.toggleBreakpoint(9);
        }, 5000);
        
        const sectionItem = await getDebuggerSectionItem(driver, 'item:', 'Message', 'Variables');
        expect(await sectionItem?.getVariableValue()).to.be.equal("world");

        const sectionItem2 = await getDebuggerSectionItem(driver, 'name:', 'Message', 'Variables');
        expect(await sectionItem2?.getVariableValue()).to.be.equal("Camel");
    });
});
