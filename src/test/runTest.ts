import * as path from 'path';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron';
const cp = require('child_process');

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');
		
		const testWorkspace = path.resolve(__dirname, '../../../test Fixture with speci@l chars');
		
		const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');
		const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
		cp.spawnSync(cli, [...args, '--install-extension', 'redhat.vscode-yaml'], {
				encoding: 'utf-8',
				stdio: 'inherit'
			});
		
		await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [testWorkspace, '--disable-workspace-trust'] });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
