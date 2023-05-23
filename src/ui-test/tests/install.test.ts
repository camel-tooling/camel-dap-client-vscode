import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { repeat, TimeoutError } from '@theia-extension-tester/repeat';
import {
    after,
    before,
    afterEach,
    beforeEach,
    EditorView,
    error,
    ExtensionsViewItem,
    ExtensionsViewSection,
    InputBox,
    SideBarView,
    ViewControl,
    VSBrowser
} from 'vscode-extension-tester';
import { Workbench } from 'vscode-uitests-tooling';

describe('Install test', function () {
    this.timeout(30000);
    this.slow(10000);
    const extensionMetadata: { [key: string]: any } = JSON.parse(fs.readFileSync('package.json', {
        encoding: 'utf-8'
    }));
    const name: string = extensionMetadata['displayName'];

    describe('Marketplace presentation', function () {
        let marketplace: ExtensionsViewSection;

        beforeEach('Open marketplace', async function (this: Mocha.Context) {
            marketplace = await openMarketplace(this.timeout() - 1000);
        });

        afterEach('Close marketplace', async function (this: Mocha.Context) {
            await closeMarketplace(this.timeout() - 1000);
        });

        it('Has correct title', async function () {
            const [_, extension] = await openExtensionPage(marketplace, name, this.timeout() - 1000);
            expect(await extension.getTitle()).to.be.equal(extensionMetadata['displayName']);
        });

        it('Has correct description', async function () {
            const [_, extension] = await openExtensionPage(marketplace, name, this.timeout() - 1000);
            expect(await extension.getDescription()).to.be.equal(extensionMetadata['description']);
        });

        it('Has correct author', async function () {
            const [_, extension] = await openExtensionPage(marketplace, name, this.timeout() - 1000);
            expect(await extension.getAuthor()).to.be.equal('Red Hat');
        });

        it('Extension is installed', async function () {
            const [_, extension] = await openExtensionPage(marketplace, name, this.timeout() - 1000);
            expect(await extension.isInstalled()).to.be.true;
        });
    });

    describe('Command check', function () {

        const CAMEL_ROUTE_YAML = 'demo route.camel.yaml';

        before('Open file before tests', async function () {
            await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources', CAMEL_ROUTE_YAML));
            await VSBrowser.instance.waitForWorkbench();
        });

        after('Cleanup after tests', async function () {
            await closeInput();
            await new EditorView().closeAllEditors();
        });

        // Make tests independent
        beforeEach('Close input', closeInput);

        for (const commandMetadata of extensionMetadata['contributes']['commands']) {
            const { title } = commandMetadata;
            it(`Verify command "${title}"`, async function () {
                await testCommand(commandMetadata, this.timeout() - 1000);
            });
        }
    });
});


async function closeInput(): Promise<void> {
    try {
        const input = new InputBox();
        await input.clear();
        await input.cancel();
    }
    catch (e) {
        // ignore non-existent input on start and handle already closed input
        if (!(e instanceof error.NoSuchElementError || e instanceof error.ElementNotInteractableError)) {
            throw e;
        }
    }
}

async function testCommand(commandMetadata: any, timeout: number): Promise<void> {
    const { command, title, category } = commandMetadata;
    let input = await getInput();
    await input.setText(`>${category}: ${title}`);
    await repeat(async () => {
        try {
            const quickpicks = await input.getQuickPicks();
            for (let quickpick of quickpicks) {
                if (await quickpick.getLabel() === `${category}: ${title}`) {
                    return true;
                }
            }
            return false;
        }
        catch (e) {
            // Input cannot be stale by design. Refresh quickpicks.
            if (e instanceof error.StaleElementReferenceError) {
                return undefined;
            }
            // Some element could not be found. Try again.
            if (e instanceof error.NoSuchElementError) {
                return undefined;
            }
            // Input was unexpectedly closed. Open it again.
            if (e instanceof error.ElementNotInteractableError) {
                input = await getInput();
                await input.setText(`>${category}: ${title}`);
                return undefined;
            }

            throw e;
        }
    }, {
        id: `Verify command '${command}'.`,
        timeout,
        message: `Could not find command '${command}' in quickpicks.`
    });
}

/**
 * Open input and return its reference when it is ready.
 * @returns Input ready to be used.
 */
async function getInput(): Promise<InputBox> {
    const workbench = new Workbench();
    const input = await workbench.openCommandPrompt() as InputBox;
    return input.wait();
}

/**
 * Open the extension page.
 * @param marketplace Reference to ExtensionViewSection.
 * @param name Display name of the extension.
 * @param timeout Timeout in ms.
 * @returns A tuple -- updated ExtensionViewSection if it has became stale and ExtensionViewItem
 *          object tied with the extension.
 */
async function openExtensionPage(marketplace: ExtensionsViewSection, name: string, timeout: number): Promise<[ExtensionsViewSection, ExtensionsViewItem]> {
    const extension = await repeat(async () => {
        try {
            return await marketplace.findItem(`@installed ${name}`);
        }
        catch (e) {
            // Sometimes ExtensionViewSection gets replaced in UI. Refresh it.
            if (e instanceof error.StaleElementReferenceError) {
                marketplace = await openMarketplace(timeout);
                return undefined;
            }
            throw e;
        }
    }, {
        timeout,
        message: `Could not find extension with name '${name}'.`
    }) as ExtensionsViewItem;
    await extension.select();

    // Look for extension tab.
    await repeat(async () => {
        const tabs = await new EditorView().getOpenTabs();
        const titles = tabs.map((t) => t.getTitle().catch((e) => {
            if (e instanceof error.StaleElementReferenceError || e instanceof error.NoSuchElementError) {
                // Tab was most likely closed. Replace it with empty string.
                return '';
            }
            throw e;
        }));
        return (await Promise.all(titles)).includes(`Extension: ${name}`);
    }, {
        timeout,
        message: `Could not find extension tab '${name}.'`
    });

    return [marketplace, extension];
}

/**
 * Open Marketplace view.
 * @param timeout Timeout in ms.
 * @returns ExtensionViewSection of any section in MarketplaceView.
 */
async function openMarketplace(timeout: number): Promise<ExtensionsViewSection> {
    const workbench = new Workbench();
    const activityBar = workbench.getActivityBar();
    const control = await activityBar.getViewControl('Extensions') as ViewControl;

    return await repeat(async () => {
        // Check if any view is open.
        if (await new SideBarView().getContent().isDisplayed()) {
            try {
                // Try to get any section. Timeout set to zero, so single check will be performed.
                // If the check fails it will throw TimeoutError.
                return await extensionViewSection(0);
            }
            catch (e) {
                // Other errors than TimeoutError are not allowed.
                if (!(e instanceof TimeoutError)) {
                    throw e;
                }
                // otherwise let it bubble down to control.click().
            }
        }

        await control.click();

        // Repeat attempt 750ms later.
        return {
            value: undefined,
            delay: 750
        };
    }, {
        timeout,
        message: 'Could not open extension content.'
    }) as ExtensionsViewSection;
}

/**
 * Close Marketplace view.
 * @param timeout Timeout in ms.
 * @returns void
 */
async function closeMarketplace(timeout: number): Promise<void> {
    // Check if it is already closed.
    if (await new SideBarView().getContent().isDisplayed() === false) {
        return;
    }

    const workbench = new Workbench();
    const activityBar = workbench.getActivityBar();
    const control = await activityBar.getViewControl('Extensions') as ViewControl;
    await control.closeView();

    // Wait for close operation to be completed.
    await repeat(async () => await new SideBarView().getContent().isDisplayed() === false, {
        timeout,
        message: 'Could not close extension content.'
    });
}

/**
 * Get any Marketplace section of type ExtensionViewSection.
 * @param timeout Timeout in ms.
 * @returns An ExtensionViewSection of any section in Marketplace.
 */
async function extensionViewSection(timeout: number): Promise<ExtensionsViewSection> {
    return await repeat(async () => {
        for (const section of await new SideBarView().getContent().getSections()) {
            try {
                if (section instanceof ExtensionsViewSection) {
                    // Check if the section is stale.
                    await section.isDisplayed();
                    return section;
                }
            }
            catch (e) {
                // Section was probably re-rendered or just removed.
                if (e instanceof error.StaleElementReferenceError) {
                    continue;
                }
                throw e;
            }
            return undefined;
        }
    }, {
        timeout,
        message: 'Could not find any ExtensionViewSection'
    }) as ExtensionsViewSection;
}
