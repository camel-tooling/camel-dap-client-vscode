import { expect } from 'chai';
import * as path from 'path';
import {
    before,
    SideBarView,
    ViewItem,
    VSBrowser,
} from 'vscode-extension-tester';

(process.platform === 'darwin' ? describe.skip : describe)('Camel file context menu test', function () {

    const CAMEL_RUN_DEBUG_MENU_ITEM = 'Run Camel Application with JBang and Debug';
    const CAMEL_RUN_MENU_ITEM = 'Run Camel Application with JBang';
    const CAMEL_ROUTE_YAML = 'demo route.camel.yaml';

    let item: ViewItem;

    describe('Camel Group items', function () {
        this.timeout(180000);

        before('Before setup', async function () {
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
            await VSBrowser.instance.waitForWorkbench();

            item = await (await new SideBarView().getContent().getSection('resources')).findItem(CAMEL_ROUTE_YAML) as ViewItem;
        });

        it('Debug and Run menu item is available', async function () {
            const menu = await item.openContextMenu();
            const runAndDebugMenuItem = await menu.hasItem(CAMEL_RUN_DEBUG_MENU_ITEM);

            expect(runAndDebugMenuItem).to.not.undefined;

            await menu.close();
        });

        it('Run menu item is available', async function () {
            const menu = await item.openContextMenu();
            const runItem = await menu.hasItem(CAMEL_RUN_MENU_ITEM);

            expect(runItem).to.not.undefined;

            await menu.close();
        });

    });

});
