import { expect } from 'chai';
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
    CAMEL_ROUTE_YAML_WITH_SPACE,
    CAMEL_ROUTE_YML,
    CAMEL_RUN_ACTION_LABEL,
    CAMEL_RUN_DEBUG_ACTION_LABEL,
    TEST_ARRAY_RUN,
    TEST_ARRAY_RUN_DEBUG,
    disconnectDebugger,
    killTerminal,
    openContextMenu,
    selectContextMenuItem,
    waitUntilTerminalHasText
} from '../utils';

const FILES_TO_TEST: string[] = [CAMEL_ROUTE_YAML_WITH_SPACE, CAMEL_ROUTE_YML];

FILES_TO_TEST.forEach(function name(file) {
    (process.platform === 'darwin' ? describe.skip : describe)(`Camel file context menu test for ${file}`, function () {
        this.timeout(240000);
    
        let driver: WebDriver;
    
        before(async function () {
            driver = VSBrowser.instance.driver;
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
    
            await (await new ActivityBar().getViewControl('Explorer')).openView();
    
            const section = await new SideBarView().getContent().getSection('resources');
            await section.openItem(file);
    
            await driver.wait(async function () {
                return (await new EditorView().getOpenEditorTitles()).find(title => title === file);
            }, 5000);
        });
    
        after(async function () {
            await new EditorView().closeAllEditors();
        });
    
        it('Debug and Run menu item is available', async function () {
            const menu = await openContextMenu(file);
            const runAndDebugMenuItem = await menu.hasItem(CAMEL_RUN_DEBUG_ACTION_LABEL);
    
            expect(runAndDebugMenuItem).to.not.undefined;
    
            await menu.close();
        });
    
        it('Run menu item is available', async function () {
            const menu = await openContextMenu(file);
            const runItem = await menu.hasItem(CAMEL_RUN_ACTION_LABEL);
    
            expect(runItem).to.not.undefined;
    
            await menu.close();
        });
    
        it(`Execute command '${CAMEL_RUN_ACTION_LABEL}' in context menu`, async function () {
            await selectContextMenuItem(CAMEL_RUN_ACTION_LABEL, await openContextMenu(file));
            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);
            await killTerminal();
        });
    
        it(`Execute command '${CAMEL_RUN_DEBUG_ACTION_LABEL}' in context menu`, async function () {
            await selectContextMenuItem(CAMEL_RUN_DEBUG_ACTION_LABEL, await openContextMenu(file));
            await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN_DEBUG, 4000, 120000);
            await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
            await disconnectDebugger(driver);
            await killTerminal();
        });
    });
});
