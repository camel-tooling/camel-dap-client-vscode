import * as vscode from 'vscode';
import { CamelDebugAdapterDescriptorFactory } from './CamelDebugAdpaterDescriptorFactory';
import { getRedHatService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";

let telemetryService: TelemetryService;


export async function activate(context: vscode.ExtensionContext) {
	vscode.debug.registerDebugAdapterDescriptorFactory('apache.camel', new CamelDebugAdapterDescriptorFactory(context));
	const redhatService = await getRedHatService(context);  
	telemetryService = await redhatService.getTelemetryService();
	telemetryService.sendStartupEvent();
}

export function deactivate() {
	telemetryService.sendShutdownEvent();
}
