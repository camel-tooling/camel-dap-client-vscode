import * as path from 'path';
import {
    after,
    before,
    BottomBarPanel,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
} from 'vscode-uitests-tooling';
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_ACTION_LABEL,
    waitUntilTerminalHasText,
    TEST_ARRAY_RUN,
    executeCommand
} from '../utils';

describe('JBang commands execution through command palette', function () {
    this.timeout(240000);

    let editorView: EditorView;
    let driver: WebDriver;

    before('Before setup', async function () {
        driver = VSBrowser.instance.driver;
    });

    after('After cleanup', async function () {
        await new EditorView().closeAllEditors();
    });

    beforeEach('Before each test', async function () {
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
        await VSBrowser.instance.waitForWorkbench();

        const section = await new SideBarView().getContent().getSection('resources');
        await section?.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    });

    afterEach('After each test', async function () {
        const bottomBarPanel = new BottomBarPanel();
        const terminal = await bottomBarPanel.openTerminalView();
        await terminal.killTerminal();
        await bottomBarPanel.toggle(false);
    });

    it(`Execute command '${CAMEL_RUN_ACTION_LABEL}' in command palette`, async function () {
        await executeCommand(CAMEL_RUN_ACTION_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
    });
});
