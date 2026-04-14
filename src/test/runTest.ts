import * as path from 'path';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron';
import { spawn, spawnSync } from 'node:child_process';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
		console.log(`extensionDevelopmentPath = ${extensionDevelopmentPath}`);

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');
		console.log(`extensionTestsPath = ${extensionTestsPath}`);

		const testWorkspace = path.resolve(__dirname, '../../../test Fixture with speci@l chars');
		console.log(`testWorkspace = ${testWorkspace}`);

		const vscodeVersion = computeVSCodeVersionToPlayTestWith();
		console.log(`vscodeVersion = ${vscodeVersion}`);

		const vscodeTestPath = path.resolve(extensionDevelopmentPath, '.vscode-test');
		const vscodeExtensionsPath = path.resolve(vscodeTestPath, 'extensions');

		const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
		const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
		spawnSync(cli, [...args, '--install-extension', 'redhat.vscode-yaml'], {
			encoding: 'utf-8',
			stdio: 'inherit'
		});

		const launchArgs = [
			testWorkspace,
			'--disable-workspace-trust',
			'--user-data-dir',
			vscodeTestPath
		];

		if (process.platform === 'win32') {
			// @vscode/test-electron launches extension tests via the Windows shell, which breaks this workspace path.
			await runTestsWithoutShell(vscodeExecutablePath, extensionDevelopmentPath, extensionTestsPath, launchArgs, vscodeExtensionsPath);
		} else {
			await runTests({ vscodeExecutablePath, extensionDevelopmentPath, extensionTestsPath, launchArgs });
		}
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}

	function computeVSCodeVersionToPlayTestWith() {
		const envVersion = process.env.CODE_VERSION;
		if (envVersion === undefined || envVersion === 'max') {
			return 'stable';
		} else if (envVersion === 'latest') {
			return 'insiders';
		}
		return envVersion;
	}

	function runTestsWithoutShell(vscodeExecutablePath: string, extensionDevelopmentPath: string, extensionTestsPath: string, launchArgs: string[], vscodeExtensionsPath: string) {
		return new Promise<void>((resolve, reject) => {
			const args = launchArgs.concat([
				'--extensions-dir',
				vscodeExtensionsPath,
				'--no-sandbox',
				'--disable-gpu-sandbox',
				'--disable-updates',
				'--skip-welcome',
				'--skip-release-notes',
				'--disable-workspace-trust',
				`--extensionTestsPath=${extensionTestsPath}`,
				`--extensionDevelopmentPath=${extensionDevelopmentPath}`
			]);
			const child = spawn(vscodeExecutablePath, args, { env: process.env });

			child.stdout.on('data', (data) => process.stdout.write(data));
			child.stderr.on('data', (data) => process.stderr.write(data));
			child.on('error', reject);
			child.on('close', (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Test run failed with exit code ${code}`));
				}
			});
		});
	}

}

main().catch((error) => {
	console.error('Unhandled promise rejection in main: ', error);
});
