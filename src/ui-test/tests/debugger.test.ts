import { expect } from 'chai';
import * as path from 'path';
import {
    ActivityBar,
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
    disconnectDebugger,
    executeCommand,
    killTerminal,
    waitUntilTerminalHasText,
    TEST_PROPERTY,
    DEFAULT_PROPERTY,
    clearTerminal
} from '../utils';

describe('Camel Debugger tests', function () {
    this.timeout(300000);

    let driver: WebDriver;

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
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG);
    });

    after(async function () {
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
        await killTerminal();
        await new EditorView().closeAllEditors();
    });

    it('Toggle breakpoint on log line (17)', async function () {
        await driver.wait(async function () {
            return await new TextEditor().toggleBreakpoint(17);
        }, 5000);
        breakpointToggled = true;
        skip = false;
    });

    it('Update Body value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;
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
                if (e instanceof Error && e.name === 'ElementClickInterceptedError') {
                    await driver.actions().click().perform();
                }
                return false;
            }
        }, 240000, undefined, 500);

        await waitUntilTerminalHasText(driver, [TEST_BODY]);
        await clearTerminal();
        skip = false;
    });

    it('Update Header value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;
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
                if (e instanceof Error && e.name === 'ElementClickInterceptedError') {
                    await driver.actions().click().perform();
                }
                return false;
            }
        }, 240000, undefined, 500);

        await waitUntilTerminalHasText(driver, [TEST_HEADER]);
        await clearTerminal();
        skip = false;
    });

    it('Update Exchange property value with Camel debugger', async function () {
        if (skip) {
            this.test?.skip();
        }
        skip = true;
        // WORKAROUND: https://github.com/redhat-developer/vscode-extension-tester/issues/402
        // Exchange -> Properties -> from:fromL yaml)
        const debugView = (await (await new ActivityBar().getViewControl('Run')).openView()) as DebugView;
        await driver.wait(async function () {
            try {
                let variables = await debugView.getContent().getSection('Variables');
                await variables.openItem('Exchange');
                const messages = await variables.openItem('Properties');
                for await (let message of messages) {
                    if (await message.getAttribute('aria-label') === `from, value ${DEFAULT_PROPERTY}`) {
                        await driver.actions().doubleClick(message).perform();
                        await driver.actions().clear();
                        await driver.actions().sendKeys(TEST_PROPERTY).perform();
                        return true;
                    }
                }
                return false;
            } catch (e) {
                // Extra click to avoid the error: "Element is not clickable at point (x, y)"
                // Issue is similar to https://issues.redhat.com/browse/FUSETOOLS2-2100
                if (e instanceof Error && e.name === 'ElementClickInterceptedError') {
                    await driver.actions().click().perform();
                }
                return false;
            }
        }, 240000, undefined, 500);

        // Lack of camel.impl.debugger.BacklogDebugger logs on Exchange property changes
        // Not possible to verify that value was changed in terminal
        // Verify that value was changed in Run&Debug variables view
        let foundMessageWithTestProperty = false;
        let variables = await debugView.getContent().getSection('Variables');
        const messages = await variables.openItem('Properties');
        for await (let message of messages) {
            if (await message.getAttribute('aria-label') === `from, value ${TEST_PROPERTY}`) {
                foundMessageWithTestProperty = true;
            }
        }

        expect(foundMessageWithTestProperty).to.be.true;
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

    it('Untoggle breakpoint on log line (17)', async function () {
        if (!breakpointToggled) {
            this.test?.skip();
        }
        await driver.wait(async function () {
            return !await new TextEditor().toggleBreakpoint(17);
        }, 5000);
    });

});
