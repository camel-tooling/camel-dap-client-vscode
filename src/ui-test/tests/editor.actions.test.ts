import { expect } from 'chai';
import * as path from 'path';
import {
    after,
    before,
    BottomBarPanel,
    EditorView,
    SideBarView,
    TerminalView,
    VSBrowser,
    WebElement,
} from 'vscode-extension-tester';

describe('Camel file editor test', function () {

    const CAMEL_RUN_DEBUG_ACTION_LABEL = 'Run Camel Application with JBang and Debug';
    const CAMEL_RUN_ACTION_LABEL = 'Run Camel Application with JBang';
    const CAMEL_ROUTE_YAML = 'demo route.camel.yaml';

    describe('Camel Actions', function () {
        this.timeout(180000);

        let editorView: EditorView;
        let bottomBar: BottomBarPanel;

        before('Before setup', async function () {
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));
            await VSBrowser.instance.waitForWorkbench();

            const section = await new SideBarView().getContent().getSection('resources');
            await section?.openItem(CAMEL_ROUTE_YAML);

            editorView = new EditorView();
            await section.getDriver().wait(async function () {
                return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML);
            }, 5000);

            bottomBar = new BottomBarPanel();
            await bottomBar.openTerminalView();
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

            await run.getDriver().wait(async function () {
                console.log('Waiting for JBang dependencies...');
                await bottomBar.openTerminalView(); // ensure terminal view is opened and focused
                return (await new TerminalView().getText()).includes('[jbang] Dependencies resolved');
            }, 60000);

            await run.getDriver().wait(async function () {
                console.log('Waiting for Camel route to be started...');
                await bottomBar.openTerminalView(); // ensure terminal view is opened and focused
                return (await new TerminalView().getText()).includes('(demo route) started');
            }, 30000);

            const terminal = await bottomBar.openTerminalView(); // ensure terminal view is opened and focused
            expect(await terminal.getText()).to.contain('Hello Camel');

            await terminal.killTerminal();
            await bottomBar.toggle(false);
        });

    });

});
