import { expect } from 'chai';
import * as path from 'path';
import {
    ActivityBar,
    after,
    before,
    EditorView,
    SideBarView,
    ViewControl,
    ViewSection,
    VSBrowser,
    WebDriver,
} from 'vscode-extension-tester';
import {
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    DEBUGGER_ATTACHED_MESSAGE,
    HELLO_CAMEL_MESSAGE,
    TEST_ARRAY_RUN,
    TEST_ARRAY_RUN_DEBUG,
    activateTerminalView,
    disconnectDebugger,
    killTerminal,
    openContextMenu,
    selectContextMenuItem,
    waitUntilTerminalHasText
} from '../utils';

(process.platform === 'darwin' ? describe.skip : describe)('Camel file context menu test', function () {
    this.timeout(240000);

    let driver: WebDriver;

    before('Before setup', async function () {
        driver = VSBrowser.instance.driver;
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
        await VSBrowser.instance.waitForWorkbench();

        await (await new ActivityBar().getViewControl('Explorer') as ViewControl).openView();

        const section = await new SideBarView().getContent().getSection('resources') as ViewSection;
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        await driver.wait(async function () {
            return (await new EditorView().getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    });

    after('After cleanup', async function () {
        await new EditorView().closeAllEditors();
    });

    it('Debug and Run menu item is available', async function () {
        const menu = await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE);
        const runAndDebugMenuItem = await menu.hasItem(CAMEL_RUN_DEBUG_ACTION_LABEL);

        expect(runAndDebugMenuItem).to.not.undefined;

        await menu.close();
    });

    it('Run menu item is available', async function () {
        const menu = await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE);
        const runItem = await menu.hasItem(CAMEL_RUN_ACTION_LABEL);

        expect(runItem).to.not.undefined;

        await menu.close();
    });

    it(`Execute command '${CAMEL_RUN_ACTION_LABEL}' in context menu`, async function () {
        await selectContextMenuItem(CAMEL_RUN_ACTION_LABEL, await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE));
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
        expect(await (await activateTerminalView()).getText()).to.contain(HELLO_CAMEL_MESSAGE);
        await killTerminal();
    });

    it(`Execute command '${CAMEL_RUN_DEBUG_ACTION_LABEL}' in context menu`, async function () {
        await selectContextMenuItem(CAMEL_RUN_DEBUG_ACTION_LABEL, await openContextMenu(CAMEL_ROUTE_YAML_WITH_SPACE));
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG);
        const terminalLog = await (await activateTerminalView()).getText();
        expect(terminalLog).to.contain(DEBUGGER_ATTACHED_MESSAGE);
        expect(terminalLog).to.contain(HELLO_CAMEL_MESSAGE);
        await (await new ActivityBar().getViewControl('Run and Debug') as ViewControl).closeView();
        await disconnectDebugger(driver);
        await killTerminal();
    });
});
