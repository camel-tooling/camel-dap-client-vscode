import { expect } from 'chai';
import * as path from 'path';
import {
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
    TEST_ARRAY_RUN,
} from '../utils';

describe('Camel file editor test', function () {


    describe('Camel Actions', function () {
        this.timeout(180000);

        let driver: WebDriver;
        let editorView: EditorView;

        before('Before setup', async function () {
            driver = VSBrowser.instance.driver;
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
            await VSBrowser.instance.waitForWorkbench();

            const section = await new SideBarView().getContent().getSection('resources');
            await section?.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

            editorView = new EditorView();
            await driver.wait(async function () {
                return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
            }, 5000);
        });

        after('After cleanup', async function () {
            await editorView.closeAllEditors();
        });

        it('Debug and Run action is available', async function () {
            const button = await editorView.getAction(CAMEL_RUN_DEBUG_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it('Run action is available', async function () {
            const button = await editorView.getAction(CAMEL_RUN_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it(`Can execute '${CAMEL_RUN_ACTION_LABEL}' action`, async function () {
            const run = await editorView.getAction(CAMEL_RUN_ACTION_LABEL) as WebElement;
            await run.click();

            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);

            const bottomBar = new BottomBarPanel();
            const terminal = await bottomBar.openTerminalView();
            await terminal.killTerminal();
            await bottomBar.toggle(false);
        });

    });

});
