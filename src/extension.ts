/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License", destination); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as vscode from 'vscode';
import { CamelDebugAdapterDescriptorFactory } from './CamelDebugAdapterDescriptorFactory';
import { getRedHatService, TelemetryEvent, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";
import { CamelApplicationLauncherTasksCompletionItemProvider } from './completion/CamelApplicationLauncherTasksCompletionItemProvider';
import { CamelJBangTaskProvider } from './task/CamelJBangTaskProvider';
import { CamelJBangCodelens } from './codelenses/CamelJBangCodelens';
import { execSync } from 'child_process';

let telemetryService: TelemetryService;

const CAMEL_DEBUG_ADAPTER_ID = 'apache.camel';
export const CAMEL_RUN_AND_DEBUG_WITH_JBANG_COMMAND_ID = 'apache.camel.debug.jbang';
export const CAMEL_RUN_WITH_JBANG_COMMAND_ID = 'apache.camel.run.jbang';
export const CAMEL_RUN_AND_DEBUG_WITH_JBANG_ROOT_COMMAND_ID = 'apache.camel.debug.jbang.all.root';
export const CAMEL_RUN_WITH_JBANG_ROOT_COMMAND_ID = 'apache.camel.run.jbang.all.root';
export const CAMEL_RUN_AND_DEBUG_WITH_JBANG_CONTAININGFOLDER_COMMAND_ID = 'apache.camel.debug.jbang.all.containingfolder';
export const CAMEL_RUN_WITH_JBANG_CONTAININGFOLDER_COMMAND_ID = 'apache.camel.run.jbang.all.containingfolder';
export const CAMEL_JBANG_KUBERNETES_DEPLOY_COMMAND_ID = 'apache.camel.kubernetes.deploy';
export const WORKSPACE_WARNING_MESSAGE = `The action requires an opened folder/workspace to complete successfully.`;

export async function activate(context: vscode.ExtensionContext) {
	vscode.debug.registerDebugAdapterDescriptorFactory(CAMEL_DEBUG_ADAPTER_ID, new CamelDebugAdapterDescriptorFactory(context));

	const tasksJson: vscode.DocumentSelector = { scheme: 'file', language: 'jsonc', pattern: '**/tasks.json' };
	vscode.languages.registerCompletionItemProvider(tasksJson, new CamelApplicationLauncherTasksCompletionItemProvider());

	const taskProvider = new CamelJBangTaskProvider();
	vscode.tasks.registerTaskProvider('camel.jbang', taskProvider);

	const redhatService = await getRedHatService(context);
	telemetryService = await redhatService.getTelemetryService();
	await telemetryService.sendStartupEvent();

	registerDebugCommand(CAMEL_RUN_AND_DEBUG_WITH_JBANG_COMMAND_ID, CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask);
	registerDebugCommand(CAMEL_RUN_AND_DEBUG_WITH_JBANG_ROOT_COMMAND_ID, CamelJBangTaskProvider.labelProvidedRunAllWithDebugActivatedTask);
	registerDebugCommand(CAMEL_RUN_AND_DEBUG_WITH_JBANG_CONTAININGFOLDER_COMMAND_ID, CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderWithDebugActivatedTask);

	registerRunCommand(CAMEL_RUN_WITH_JBANG_COMMAND_ID, CamelJBangTaskProvider.labelProvidedRunTask, taskProvider);
	registerRunCommand(CAMEL_RUN_WITH_JBANG_ROOT_COMMAND_ID, CamelJBangTaskProvider.labelProvidedRunAllTask, taskProvider);
	registerRunCommand(CAMEL_RUN_WITH_JBANG_CONTAININGFOLDER_COMMAND_ID, CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderTask, taskProvider);

	vscode.commands.registerCommand(CAMEL_JBANG_KUBERNETES_DEPLOY_COMMAND_ID, async function () {
		const camelAddKubernetesPluginTask = taskProvider.createTask(CamelJBangTaskProvider.labelAddKubernetesPluginTask);
		if (camelAddKubernetesPluginTask && !(await isCamelPluginInstalled('kubernetes'))) {
			await vscode.tasks.executeTask(camelAddKubernetesPluginTask);
			await taskProvider.waitForTaskEnd(CamelJBangTaskProvider.labelAddKubernetesPluginTask);
		}
		const camelDeployTask = taskProvider.createTask(CamelJBangTaskProvider.labelProvidedDeployTask);
		if (camelDeployTask) {
			await vscode.tasks.executeTask(camelDeployTask);
			await sendCommandTrackingEvent(telemetryService, CAMEL_JBANG_KUBERNETES_DEPLOY_COMMAND_ID);
		}
	});

	vscode.debug.registerDebugAdapterTrackerFactory(CAMEL_DEBUG_ADAPTER_ID, {
		createDebugAdapterTracker(_session: vscode.DebugSession) {
			return {
				onDidSendMessage: async m => {
					if (m.type === 'event'
						&& m.event === 'output'
						&& m.body?.category === 'telemetry'
						&& m.body?.data?.name !== undefined) {
						await telemetryService.send(m.body?.data);
					}
				}
			};
		}
	});
	const docSelector: vscode.DocumentSelector = [{
		language: 'java',
		scheme: 'file'
	}, {
		language: 'xml',
		scheme: 'file'
	}, {
		language: 'yaml',
		scheme: 'file'
	}];
	vscode.languages.registerCodeLensProvider(docSelector, new CamelJBangCodelens());
}

function registerDebugCommand(commandId: string, taskLabel: string) {
	vscode.commands.registerCommand(commandId, async (uri: vscode.Uri) => {
		if (!vscode.workspace.workspaceFolders) {
			await vscode.window.showWarningMessage(WORKSPACE_WARNING_MESSAGE);
			return;
		}
		if (uri !== undefined) {
			await vscode.window.showTextDocument(uri);
		}
		const debugConfiguration: vscode.DebugConfiguration = {
			name: `Debug Camel JBang`,
			type: 'apache.camel',
			request: 'attach',
			preLaunchTask: `camel: ${taskLabel}`,
		};
		await vscode.debug.startDebugging(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined, debugConfiguration);
		await sendCommandTrackingEvent(telemetryService, commandId);
	});
}

function registerRunCommand(commandId: string, taskLabel: string, taskProvider: CamelJBangTaskProvider) {
	vscode.commands.registerCommand(commandId, async function () {
		if (!vscode.workspace.workspaceFolders) {
			await vscode.window.showWarningMessage(WORKSPACE_WARNING_MESSAGE);
			return;
		}
		const camelRunTask = taskProvider.createTask(taskLabel);
		if (camelRunTask) {
			await sendCommandTrackingEvent(telemetryService, commandId);
			await vscode.tasks.executeTask(camelRunTask);
		}
	});
}

export async function deactivate() {
	await telemetryService.sendShutdownEvent();
}

async function sendCommandTrackingEvent(telemetryService: TelemetryService, commandId: string) {
	const telemetryEvent: TelemetryEvent = {
		type: 'track',
		name: 'command',
		properties: {
			identifier: commandId
		}
	};
	await telemetryService.send(telemetryEvent);
}

async function isCamelPluginInstalled(plugin: string): Promise<boolean> {
	let output = '';
	// it takes always few seconds to compute after click on deploy button
	//  - can be confusing for user without any UI feedback, it looks like nothing is happening after click on a button..
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Window,
		cancellable: false,
		title: 'Checking Camel JBang Kubernetes plugin...'
	}, async (progress) => {
		progress.report({ increment: 0 });
		output = execSync('jbang camel@apache/camel plugin get', { stdio: 'pipe' }).toString();
		progress.report({ increment: 100 });
	});
	return output.includes(plugin);
}
