import * as path from 'path';
import * as variables from '../variables';
import {
    ActivityBar,
    after,
    before,
    EditorView,
    repeat,
    SideBarView,
    VSBrowser,
    WebDriver
} from 'vscode-uitests-tooling';
import {
    disconnectDebugger,
    findCodelens,
    killTerminal,
    waitUntilTerminalHasText
} from '../utils';

describe('JBang commands execution through command codelens', function () {
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
        await section.openItem(variables.CAMEL_ROUTE_YAML_WITH_SPACE);

        const editorView = new EditorView();
        await repeat(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === variables.CAMEL_ROUTE_YAML_WITH_SPACE);
        }, {
            timeout: 5000,
            message: `The test file ${variables.CAMEL_ROUTE_YAML_WITH_SPACE} was not opened`
        });
    });

    afterEach(async function () {
        await killTerminal();
    });

    it(`Execute command 'apache.camel.run.jbang' with codelens '${variables.CAMEL_RUN_CODELENS}'`, async function () {
        await (await findCodelens(variables.CAMEL_RUN_CODELENS)).click();
        await waitUntilTerminalHasText(driver, variables.TEST_ARRAY_RUN, 4000, 120000);
    });

    it(`Execute command 'apache.camel.debug.jbang' with codelens '${variables.CAMEL_DEBUG_CODELENS}'`, async function () {
        await (await findCodelens(variables.CAMEL_DEBUG_CODELENS)).click();
        await waitUntilTerminalHasText(driver, variables.TEST_ARRAY_RUN_DEBUG, 4000, 120000);
        await disconnectDebugger(driver);
        await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
    });
});
