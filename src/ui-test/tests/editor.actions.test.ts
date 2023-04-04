import { expect } from 'chai';
import * as path from 'path';
import {
    after,
    before,
    By,
    EditorView,
    VSBrowser,
    WebElement,
} from 'vscode-extension-tester';

describe('Camel file editor test', function () {

    const CAMEL_RUN_DEBUG_ACTION_LABEL = 'Run Camel Application with JBang and Debug';
    const CAMEL_RUN_ACTION_LABEL = 'Run Camel Application with JBang';
    const CAMEL_ROUTE_YAML = 'demo route.camel.yaml';

    describe('Camel Actions', function () {
        this.timeout(30000);

        before('Before setup', async function () {
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources', CAMEL_ROUTE_YAML));
            await VSBrowser.instance.waitForWorkbench();
        });

        after('After cleanup', async function () {
            await new EditorView().closeAllEditors();
        });

        it('Debug and Run action is available', async function () {
            const button = await getAction(CAMEL_RUN_DEBUG_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

        it('Run action is available', async function () {
            const button = await getAction(CAMEL_RUN_ACTION_LABEL);
            expect(button).to.not.undefined;
        });

    });

    async function getAction(title: string): Promise<WebElement | undefined> {
        const actions = await new EditorView().findElement(By.className('editor-actions')).findElements(By.className('action-label'));
        const attribute = VSBrowser.instance.version >= '1.76.0' ? 'aria-label' : 'title';
        for (const item of actions) {
            if (await item.getAttribute(attribute) === title) {
                return item;
            }
        }
        return undefined;
    }
});
