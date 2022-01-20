import * as vscode from 'vscode';
import { CamelDebugAdapterDescriptorFactory } from './CamelDebugAdpaterDescriptorFactory';

export function activate(context: vscode.ExtensionContext) {
	vscode.debug.registerDebugAdapterDescriptorFactory('apache.camel', new CamelDebugAdapterDescriptorFactory(context));
}

export function deactivate() {}
