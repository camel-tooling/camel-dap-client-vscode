import * as path from 'path';
import {
    ActivityBar,
    after,
    before,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
} from 'vscode-uitests-tooling';
import {
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    waitUntilTerminalHasText,
    TEST_ARRAY_RUN,
    TEST_ARRAY_RUN_DEBUG,
    executeCommand,
    disconnectDebugger,
    killTerminal,
    CAMEL_ROUTE_YAML_WITH_SPACE,
} from '../utils';

describe('JBang commands execution through command palette', function () {
    this.timeout(240000);

    let driver: WebDriver;

    before(async function () {
        driver = VSBrowser.instance.driver;
    });

    after(async function () {
        await new EditorView().closeAllEditors();
    });

    beforeEach(async function () {
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

        await (await new ActivityBar().getViewControl('Explorer')).openView();

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        const editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    });

    afterEach(async function () {
        await killTerminal();
    });

    it(`Execute command '${CAMEL_RUN_ACTION_LABEL}' in command palette`, async function () {
        await executeCommand(CAMEL_RUN_ACTION_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
    });

    it(`Execute command '${CAMEL_RUN_DEBUG_ACTION_LABEL}' in command palette`, async function () {
        await executeCommand(CAMEL_RUN_DEBUG_ACTION_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG, 4000, 120000);
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
    });
});
