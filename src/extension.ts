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

let telemetryService: TelemetryService;

const CAMEL_DEBUG_ADAPTER_ID = 'apache.camel';
const CAMEL_START_AND_DEBUG_WITH_JBANG_COMMAND_ID = 'apache.camel.debug.jbang';

export async function activate(context: vscode.ExtensionContext) {
	vscode.debug.registerDebugAdapterDescriptorFactory(CAMEL_DEBUG_ADAPTER_ID, new CamelDebugAdapterDescriptorFactory(context));
	
	const tasksJson:vscode.DocumentSelector = { scheme: 'file', language: 'jsonc', pattern: '**/tasks.json' };
	vscode.languages.registerCompletionItemProvider(tasksJson, new CamelApplicationLauncherTasksCompletionItemProvider());

	vscode.tasks.registerTaskProvider('camel.jbang', new CamelJBangTaskProvider());
	
	const redhatService = await getRedHatService(context);  
	telemetryService = await redhatService.getTelemetryService();
	telemetryService.sendStartupEvent();
	
	vscode.commands.registerCommand(CAMEL_START_AND_DEBUG_WITH_JBANG_COMMAND_ID, async (uri: vscode.Uri) => {
		const debugConfiguration: vscode.DebugConfiguration = {
			name: 'Start camel Application with JBang and debug',
			type: 'apache.camel',
			request: 'attach',
			preLaunchTask: `camel: ${CamelJBangTaskProvider.labelProvidedTask}`,
		};
		await vscode.debug.startDebugging(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined, debugConfiguration);
		const telemetryEvent: TelemetryEvent = {
			type: 'track',
			name: 'command',
			properties: {
				identifier: CAMEL_START_AND_DEBUG_WITH_JBANG_COMMAND_ID
			}
		};
		telemetryService.send(telemetryEvent);
	});
	
	vscode.debug.registerDebugAdapterTrackerFactory(CAMEL_DEBUG_ADAPTER_ID, {
		createDebugAdapterTracker(session: vscode.DebugSession) {
		  return {
			onDidSendMessage: m => {
					if (m.type === 'event'
						&& m.event === 'output'
						&& m.body?.category === 'telemetry'
						&& m.body?.data?.name !== undefined) {
							telemetryService.send(m.body?.data);
					}
				}
			};
		}
	});
}

export function deactivate() {
	telemetryService.sendShutdownEvent();
}
