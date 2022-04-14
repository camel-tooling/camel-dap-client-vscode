import * as vscode from 'vscode';
import { CamelDebugAdapterDescriptorFactory } from './CamelDebugAdpaterDescriptorFactory';
import { getRedHatService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";
import { CamelMavenTasksCompletionItemProvider } from './completion/CamelMavenTasksCompletionItemProvider';

let telemetryService: TelemetryService;

const CAMEL_DEBUG_ADAPTER_ID = 'apache.camel';

export async function activate(context: vscode.ExtensionContext) {
	vscode.debug.registerDebugAdapterDescriptorFactory(CAMEL_DEBUG_ADAPTER_ID, new CamelDebugAdapterDescriptorFactory(context));
	
	const tasksJson:vscode.DocumentSelector = { scheme: 'file', language: 'jsonc', pattern: '**/tasks.json' };
	vscode.languages.registerCompletionItemProvider(tasksJson, new CamelMavenTasksCompletionItemProvider());
	
	const redhatService = await getRedHatService(context);  
	telemetryService = await redhatService.getTelemetryService();
	telemetryService.sendStartupEvent();
	
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
