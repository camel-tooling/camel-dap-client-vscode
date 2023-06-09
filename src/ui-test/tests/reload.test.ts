import * as path from 'path';
import {
    ActivityBar,
    after,
    before,
    EditorView,
    SideBarView,
    VSBrowser,
    WebDriver,
    resources,
    workspaces
} from 'vscode-uitests-tooling';
import {
    CAMEL_RUN_ACTION_LABEL,
    waitUntilTerminalHasText,
    TEST_ARRAY_RUN,
    executeCommand,
    killTerminal,
    HELLO_CAMEL_MESSAGE,
    activateTerminalView,
    CAMEL_ROUTE_YAML_WITH_SPACE,
    HELLO_WORLD_MESSAGE,
    CAMEL_ROUTE_YAML_WITH_SPACE_COPY,
    replaceTextInCodeEditor,
} from '../utils';
import { expect } from 'chai';

describe('Jbang commands with automatic reload', function () {
    this.timeout(300000);

    let driver: WebDriver;
    let resourceManager: resources.IResourceManager;

    before(async function () {
        driver = VSBrowser.instance.driver;

        resourceManager = resources.createResourceManager(
            VSBrowser.instance,
            workspaces.createWorkspace(VSBrowser.instance, 'src/ui-test/resources'),
            'src/ui-test/resources'
        );
        await resourceManager.copy(CAMEL_ROUTE_YAML_WITH_SPACE, CAMEL_ROUTE_YAML_WITH_SPACE_COPY);

        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources'));

        await (await new ActivityBar().getViewControl('Explorer')).openView();

        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE_COPY);

        const editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE_COPY);
        }, 5000);
    });

    after(async function () {
        await new EditorView().closeAllEditors();
        await resourceManager.delete(CAMEL_ROUTE_YAML_WITH_SPACE_COPY);
    });

    afterEach(async function () {
        await killTerminal();
    });

    it(`Execute command '${CAMEL_RUN_ACTION_LABEL}' with automatic reload`, async function () {
        await executeCommand(CAMEL_RUN_ACTION_LABEL);
        await waitUntilTerminalHasText(driver, TEST_ARRAY_RUN);

        await driver.wait(async () => { return await replaceTextInCodeEditor(HELLO_CAMEL_MESSAGE, HELLO_WORLD_MESSAGE); }, 60000);
        await waitUntilTerminalHasText(driver, [HELLO_WORLD_MESSAGE]);

        expect(await (await activateTerminalView()).getText()).to.contain(HELLO_WORLD_MESSAGE);
    });
});
