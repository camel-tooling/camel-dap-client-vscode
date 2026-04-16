'use strict';

const os = require('node:os');
const path = require('node:path');
const { downloadAndUnzipVSCode } = require('@vscode/test-electron');
const { ExTester, ReleaseQuality } = require('vscode-extension-tester');

function resolveStorageFolder() {
	return process.env.TEST_RESOURCES ? path.resolve(process.env.TEST_RESOURCES) : path.join(os.tmpdir(), 'test-resources');
}

function resolveTestElectronVersion() {
	const version = process.env.CODE_VERSION;

	if (version === undefined || version === 'max') {
		return 'stable';
	} else if (version === 'latest') {
		return 'insiders';
	}
	return version;
}

function resolveReleaseType() {
	return process.env.CODE_TYPE === 'insider' ? ReleaseQuality.Insider : ReleaseQuality.Stable;
}

async function main() {
	const storageFolder = resolveStorageFolder();
	const codeVersion = process.env.CODE_VERSION ?? 'max';

	console.log(`Prewarming @vscode/test-electron cache for ${resolveTestElectronVersion()}`);
	await downloadAndUnzipVSCode({
		version: resolveTestElectronVersion(),
		cachePath: path.resolve('.vscode-test')
	});

	console.log(`Prewarming vscode-extension-tester cache for ${codeVersion} / ${process.env.CODE_TYPE ?? 'stable'}`);
	const tester = new ExTester(storageFolder, resolveReleaseType());
	await tester.downloadCode(codeVersion);
	await tester.downloadChromeDriver(codeVersion);
}

main().catch((error) => {
	console.error('Failed to prewarm VS Code download cache', error);
	process.exit(1);
});
