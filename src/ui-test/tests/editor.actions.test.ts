import { expect } from 'chai';
import * as path from 'path';
import {
    ActivityBar,
    after,
    before,
    BottomBarPanel,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
    WebElement,
} from 'vscode-uitests-tooling';
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    waitUntilTerminalHasText,
    activateTerminalView,
    killTerminal,
    disconnectDebugger,
    HELLO_CAMEL_MESSAGE,
    TEST_ARRAY_RUN,
    DEBUGGER_ATTACHED_MESSAGE
} from '../utils';

describe('Camel file editor test', function () {

    describe('Camel Actions', function () {
        this.timeout(240000);

        let driver: WebDriver;
        let editorView: EditorView;

        before(async function () {
            driver = VSBrowser.instance.driver;
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

            await (await new ActivityBar().getViewControl('Explorer')).openView();

            const section = await new SideBarView().getContent().getSection('resources');
            await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

            editorView = new EditorView();
            await driver.wait(async function () {
                return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
            }, 5000);
        });

        after(async function () {
            await editorView.closeAllEditors();
            await new BottomBarPanel().toggle(false);
        });

        it('Debug and Run action is available', async function () {
            await driver.sleep(500);
            const button = await editorView.getAction(CAMEL_RUN_DEBUG_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it('Run action is available', async function () {
            await driver.sleep(500);
            const button = await editorView.getAction(CAMEL_RUN_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it(`Can execute '${CAMEL_RUN_ACTION_LABEL}' action`, async function () {
            const run = await editorView.getAction(CAMEL_RUN_ACTION_LABEL) as WebElement;
            await run.click();

            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
            expect(await (await activateTerminalView()).getText()).to.contain(HELLO_CAMEL_MESSAGE);

            await killTerminal();
        });

        it(`Can execute '${CAMEL_RUN_DEBUG_ACTION_LABEL}' action`, async function () {
            const run = await editorView.getAction(CAMEL_RUN_DEBUG_ACTION_LABEL) as WebElement;
            await run.click();

            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
            const terminalLog = await (await activateTerminalView()).getText();
            expect(terminalLog).to.contain(DEBUGGER_ATTACHED_MESSAGE);
            expect(terminalLog).to.contain(HELLO_CAMEL_MESSAGE);

            await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
            await disconnectDebugger(driver);
            await killTerminal();
        });

    });

});
