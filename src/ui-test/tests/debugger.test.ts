import { expect } from 'chai';
import * as path from 'path';
import {
    ActivityBar,
    Breakpoint,
    DebugToolbar,
    EditorView,
    SideBarView,
    TextEditor,
    VSBrowser,
    WebDriver
} from "vscode-uitests-tooling";
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
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
    DEFAULT_MESSAGE
} from '../utils';

describe('Camel Debugger tests', function () {
    this.timeout(300000);

    let driver: WebDriver;
    let textEditor: TextEditor;

    let skip: boolean = true;
    let breakpointToggled: boolean = false;

    before(async function () {
        driver = VSBrowser.instance.driver;

        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

        await (await new ActivityBar().getViewControl('Explorer')).openView();

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        const editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);

        await executeCommand(CAMEL_RUN_DEBUG_ACTION_LABEL);
        await (await new ActivityBar().getViewControl('Run')).openView();
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG, 4000, 120000);
        textEditor = new TextEditor();
    });

    after(async function () {
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
        await killTerminal();
        await new EditorView().closeAllEditors();
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

        const sectionItem = await getDebuggerSectionItem(driver, 'Body:', 'Message');

        await sectionItem?.setVariableValue(TEST_BODY);
        await waitUntilTerminalHasText(driver, [TEST_BODY]);
        expect(await sectionItem?.getVariableValue()).to.be.equal(TEST_BODY);
        await clearTerminal();
        skip = false;
    });

    it('Update Header value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;

        const sectionItem = await getDebuggerSectionItem(driver, 'header:', 'Message', 'Headers');

        await sectionItem?.setVariableValue(TEST_HEADER);
        await waitUntilTerminalHasText(driver, [TEST_HEADER]);
        expect(await sectionItem?.getVariableValue()).to.be.equal(TEST_HEADER);
        await clearTerminal();
        skip = false;
    });

    it('Update Exchange property value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;

        let sectionItem = await getDebuggerSectionItem(driver, 'from:', 'Exchange', 'Properties');
        await sectionItem?.setVariableValue(TEST_PROPERTY);

        sectionItem = await getDebuggerSectionItem(driver, 'from:', 'Exchange', 'Properties');
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
