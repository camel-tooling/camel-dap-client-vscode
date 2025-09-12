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
    Breakpoint,
    DebugToolbar,
    DebugView,
    EditorView,
    SideBarView,
    TextEditor,
    VSBrowser,
    WebDriver
} from "vscode-extension-tester";
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL,
    TEST_BODY,
    TEST_HEADER,
    TEST_MESSAGE,
    TEST_ARRAY_RUN_DEBUG,
    disconnectDebugger,
    executeCommand,
    killTerminal,
    waitUntilTerminalHasText,
    TEST_PROPERTY,
    clearTerminal,
    getDebuggerSectionItem,
    getBreakpoint,
    DEFAULT_MESSAGE,
    isCamelVersionProductized,
    isVersionNewer,
    DEBUG_ITEM_OPERATOR,
    waitUntilViewOpened
} from '../utils';
import waitUntil from 'async-wait-until';

describe('Camel Debugger tests', function () {
    this.timeout(300000);

    let driver: WebDriver;
    let textEditor: TextEditor;

    let skip: boolean = true;
    let breakpointToggled: boolean = false;

    before(async function () {
        if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
            this.skip();
        }

        driver = VSBrowser.instance.driver;

        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
        console.log('src/ui-test/resources opened');

        await waitUntilViewOpened('Explorer');
        console.log('Explorer view opened');

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        console.log('Clicked to open the Camel route');

        const editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
        console.log('Camel route editor opened');

        await executeCommand(CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL);
        console.log('Run and debug command launched');
        await (await new ActivityBar().getViewControl('Run'))?.openView();
        console.log('run view opened');
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG, 4000, 120000);
        textEditor = new TextEditor();
    });

    after(async function () {
        if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
            // do nothing - after is executed even if skip is called in before
        }
        else {
            await disconnectDebugger(driver);
            await (await new ActivityBar().getViewControl('Run and Debug'))?.closeView();
            await killTerminal();
            await new EditorView().closeAllEditors();
        }     
    });

    it('Toggle breakpoint on line (17)', async function () {
        await driver.wait(async function () {
            return await textEditor.toggleBreakpoint(17);
        }, 5000);

        const breakpoint = await driver.wait<Breakpoint>(async () => {
            return await textEditor.getPausedBreakpoint();
        }, 10000, undefined, 500) as Breakpoint;
        expect(await breakpoint.isPaused()).to.be.true;

        breakpointToggled = true;
        skip = false;
    });

    // Skip test due the issue: https://issues.redhat.com/browse/FUSETOOLS2-2162
    it.skip('Disable breakpoint on line (17)', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;

        await clearTerminal();
        const breakpointSectionItem = await getBreakpoint(driver, 17);
        expect(breakpointSectionItem).is.not.undefined;

        await breakpointSectionItem?.setBreakpointEnabled(false);
        expect(await breakpointSectionItem?.isBreakpointEnabled()).to.be.false;
        await waitUntilTerminalHasText(driver, [DEFAULT_MESSAGE], 4000, 120000);

        skip = false;
    });

    // Skip test due the issue: https://issues.redhat.com/browse/FUSETOOLS2-2162
    it.skip('Enable breakpoint on line (17)', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;

        const breakpointSectionItem = await getBreakpoint(driver, 17);
        expect(breakpointSectionItem).is.not.undefined;

        await breakpointSectionItem?.setBreakpointEnabled(true);
        expect(await breakpointSectionItem?.isBreakpointEnabled()).to.be.true;

        const breakpoint = await driver.wait<Breakpoint>(async () => {
            return await textEditor.getPausedBreakpoint();
        }, 10000, undefined, 500) as Breakpoint;
        expect(await breakpoint.isPaused()).to.be.true;

        skip = false;
    });

    it('Update Body value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;

        let sectionItem = await getDebuggerSectionItem(driver, 'Body' + DEBUG_ITEM_OPERATOR, 'Message');
        await sectionItem?.setVariableValue(TEST_BODY);
        await waitUntilTerminalHasText(driver, [TEST_BODY]);

        sectionItem = await getDebuggerSectionItem(driver, 'Body' + DEBUG_ITEM_OPERATOR, 'Message');
        expect(await sectionItem?.getVariableValue()).to.be.equal(TEST_BODY);

        await clearTerminal();
        skip = false;
    });

    it('Update Header value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;
        const debugView = (await (await new ActivityBar().getViewControl('Run'))?.openView()) as DebugView;
        await (await debugView.getContent().getSection('Watch')).collapse();
        await (await debugView.getContent().getSection('Call Stack')).collapse();
        
        let sectionItem = await getDebuggerSectionItem(driver, 'header' + DEBUG_ITEM_OPERATOR, 'Message', 'Headers');
        await sectionItem?.setVariableValue(TEST_HEADER);
        await waitUntilTerminalHasText(driver, [TEST_HEADER]);

        sectionItem = await getDebuggerSectionItem(driver, 'header' + DEBUG_ITEM_OPERATOR, 'Message', 'Headers');
        expect(await sectionItem?.getVariableValue()).to.be.equal(TEST_HEADER);

        await clearTerminal();
        skip = false;
    });

    it('Update Exchange property value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }

        // not available in older versions than 4.2.0
        // https://github.com/camel-tooling/camel-debug-adapter/pull/256#issuecomment-1821200978
        if(process.env.CAMEL_VERSION !== undefined && !isVersionNewer("4.2.0", process.env.CAMEL_VERSION)){
            skip = true;
            this.skip();
        }

        skip = true;
        let sectionItem = await getDebuggerSectionItem(driver, 'from' + DEBUG_ITEM_OPERATOR, 'Message', 'Properties');
        await sectionItem?.setVariableValue(TEST_PROPERTY);

        sectionItem = await getDebuggerSectionItem(driver, 'from' + DEBUG_ITEM_OPERATOR, 'Message', 'Properties');
        expect(await sectionItem?.getVariableValue()).to.be.equal(TEST_PROPERTY);

        await clearTerminal();
        skip = false;
    });

    it('Click on Continue button, and check updated message', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;
        const debugBar = await DebugToolbar.create();
        await debugBar.continue();
        await waitUntilTerminalHasText(driver, [TEST_MESSAGE]);
        skip = false;
    });

    it('Untoggle breakpoint on line (17)', async function () {
        if (!breakpointToggled) {
            this.test?.skip();
        }
        await driver.wait(async function () {
            return !await textEditor.toggleBreakpoint(17);
        }, 5000);
    });
});
