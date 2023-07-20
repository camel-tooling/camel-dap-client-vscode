import { expect } from 'chai';
import * as path from 'path';
import {
    ActivityBar,
    By,
    DebugToolbar,
    DebugView,
    EditorView,
    SideBarView,
    TextEditor,
    VSBrowser,
    WebDriver
} from "vscode-uitests-tooling";
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    DEFAULT_BODY,
    DEFAULT_HEADER,
    TEST_BODY,
    TEST_HEADER,
    TEST_MESSAGE,
    TEST_ARRAY_RUN_DEBUG,
    activateTerminalView,
    disconnectDebugger,
    executeCommand,
    killTerminal,
    waitUntilTerminalHasText
} from '../utils';

describe('Camel Debugger tests', function () {
    this.timeout(300000);

    let driver: WebDriver;

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
    });

    after(async function () {
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
        await killTerminal();
        await new EditorView().closeAllEditors();
    });

    it('Toogle breakpoint on log line (14)', async function () {
        await executeCommand(CAMEL_RUN_DEBUG_ACTION_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG);
        await driver.wait(async function () {
            return await new TextEditor().toggleBreakpoint(14);
        }, 5000);
    });

    it('Update Body value with Camel debugger', async function () {
        // WORKAROUND: https://github.com/redhat-developer/vscode-extension-tester/issues/402
        const debugView = (await (await new ActivityBar().getViewControl('Run')).openView()) as DebugView;
        await driver.wait(async function () {
            try {
                const variables = await debugView.getContent().getSection('Variables');
                const messages = await variables.openItem('Message');
                for await (let message of messages) {
                    if (await message.getAttribute('aria-label') === `Body, value ${DEFAULT_BODY}`) {
                        await driver.actions().doubleClick(message).perform();
                        await driver.actions().clear();
                        await driver.actions().sendKeys(TEST_BODY).perform();
                        return true;
                    }
                }
                return false;
            } catch (e) {
                // Extra click to avoid the error: "Element is not clickable at point (x, y)"
                // Issue is similar to https://issues.redhat.com/browse/FUSETOOLS2-2100
                await driver.actions().click().perform();
            }
        }, 240000, undefined, 500);

        await waitUntilTerminalHasText(driver, [TEST_BODY]);
        expect(await (await activateTerminalView()).getText()).to.contain(TEST_BODY);
    });

    it('Update Header value with Camel debugger', async function () {
        // WORKAROUND: https://github.com/redhat-developer/vscode-extension-tester/issues/402
        const debugView = (await (await new ActivityBar().getViewControl('Run')).openView()) as DebugView;
        await driver.wait(async function () {
            try {
                let variables = await debugView.getContent().getSection('Variables');
                const messages = await variables.openItem('Headers');
                for await (let message of messages) {
                    if (await message.getAttribute('aria-label') === `header, value ${DEFAULT_HEADER}`) {
                        await driver.actions().doubleClick(message).perform();
                        await driver.actions().clear();
                        await driver.actions().sendKeys(TEST_HEADER).perform();
                        return true;
                    }
                }
                return false;
            } catch (e) {
                // Extra click to avoid the error: "Element is not clickable at point (x, y)"
                // Issue is similar to https://issues.redhat.com/browse/FUSETOOLS2-2100
                await driver.actions().click().perform();
            }
        }, 240000, undefined, 500);

        await waitUntilTerminalHasText(driver, [TEST_HEADER]);
        expect(await (await activateTerminalView()).getText()).to.contain(TEST_HEADER);
    });

    it('Click on Continue button, and check updated message', async function () {
        const debugBar = await DebugToolbar.create();
        await debugBar.continue();
        await waitUntilTerminalHasText(driver, [TEST_MESSAGE]);
        expect(await (await activateTerminalView()).getText()).to.contain(TEST_MESSAGE);
    });

    it('Untoogle breakpoint on log line (14)', async function () {
        await driver.wait(async function () {
            return !await new TextEditor().toggleBreakpoint(14);
        }, 5000);
    });

});
