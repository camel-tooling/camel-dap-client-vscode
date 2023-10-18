import { expect } from 'chai';
import * as fs from 'fs';
import {
    after,
    EditorView,
    error,
    ExtensionsViewItem,
    Marketplace,
    repeat
} from 'vscode-uitests-tooling';

describe('Install test, Marketplace presentation', function () {
    this.timeout(60000);
    this.slow(10000);
    const extensionMetadata: { [key: string]: any } = JSON.parse(fs.readFileSync('package.json', {
        encoding: 'utf-8'
    }));
    let marketplace: Marketplace;
    let item: ExtensionsViewItem;

    after(async () => {
        this.timeout(5000);
        await marketplace.close();
        await new EditorView().closeAllEditors();
    });

    before(async () => {
        [marketplace, item] = await openExtensionPage(extensionMetadata['displayName'], this.timeout());
    });

    it('Extension is installed', async function () {
        const testState = await repeat(async () => {
            try {
                return await item.isInstalled();
            } catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    [marketplace, item] = await openExtensionPage(extensionMetadata['displayName'], this.timeout());
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout: this.timeout(),
            message: 'Page was not rendered well'
        });
        expect(testState).to.be.true;
    });

    it('Has correct author', async function () {
        const testAuthor = await repeat(async () => {
            try {
                return await item.getAuthor();
            } catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    [marketplace, item] = await openExtensionPage(extensionMetadata['displayName'], this.timeout());
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout: this.timeout(),
            message: 'Page was not rendered well'
        });
        expect(testAuthor).to.be.equal('Red Hat');
    });

    it('Has correct title', async function () {
        const testTitle = await repeat(async () => {
            try {
                return await item.getTitle();
            } catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    [marketplace, item] = await openExtensionPage(extensionMetadata['displayName'], this.timeout());
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout: this.timeout(),
            message: 'Page was not rendered well'
        });
        expect(testTitle).to.be.equal(extensionMetadata['displayName']);
    });

    it('Has correct description', async function () {
        const testDescription = await repeat(async () => {
            try {
                return await item.getDescription();
            } catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    [marketplace, item] = await openExtensionPage(extensionMetadata['displayName'], this.timeout());
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout: this.timeout(),
            message: 'Page was not rendered well'
        });
        expect(testDescription).to.be.equal(extensionMetadata['description']);
    });

    it('Has correct version', async function () {
        const testVersion = await repeat(async () => {
            try {
                return await item.getVersion();
            } catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    [marketplace, item] = await openExtensionPage(extensionMetadata['displayName'], this.timeout());
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout: this.timeout(),
            message: 'Page was not rendered well'
        });
        expect(testVersion).to.be.equal(extensionMetadata['version']);
    });
});

/**
 * Open the extension page.
 * @param name Display name of the extension.
 * @param timeout Timeout in ms.
 * @returns A tuple -- marketplace and ExtensionViewItem object tied with the extension.
 */
async function openExtensionPage(name: string, timeout: number): Promise<[Marketplace, ExtensionsViewItem]> {
    let marketplace: Marketplace;
    let item: ExtensionsViewItem;
    await repeat(async () => {
        try {
            marketplace = await Marketplace.open(timeout);
            item = await marketplace.findExtension(`@installed ${name}`);
            return true;
        } catch (e) {
            if (e instanceof error.StaleElementReferenceError) {
                return {
                    delay: 1000,
                    value: undefined
                };
            }
        }
    }, {
        timeout: timeout,
        message: 'Page was not rendered'
    });
    return [marketplace!, item!];
};
