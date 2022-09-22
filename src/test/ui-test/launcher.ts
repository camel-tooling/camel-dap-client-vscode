import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { ExTester } from 'vscode-extension-tester';

const TEST_RESOURCES_DIR = path.resolve('.', 'test-resources');
const EXTENSION_DIR = path.join(TEST_RESOURCES_DIR, 'test-extensions');

async function main() {
    process.on('exit', removeExtensionDir);

    removeExtensionDir();
    await fs.promises.mkdir(EXTENSION_DIR, { recursive: true });
    const tester = new ExTester(TEST_RESOURCES_DIR, undefined, EXTENSION_DIR);
    await tester.downloadCode(process.env['CODE_VERSION'] ?? 'max');
    await tester.downloadChromeDriver(process.env['CODE_VERSION'] ?? 'max');
    await tester.installVsix();
    await tester.runTests(process.argv[2], {
        cleanup: false,
        resources: []
    });
}

if (require.main === module) {
    main();
}

function removeExtensionDir() {
    assert.ok(path.relative(EXTENSION_DIR, process.cwd()).trim() !== '', 'Path is set to project root which is wrong.');
    fs.rmSync(EXTENSION_DIR, {
        recursive: true,
        force: true
    });
}
