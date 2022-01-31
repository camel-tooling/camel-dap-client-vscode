import * as vscode from 'vscode';

export class CamelDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
	
	context: vscode.ExtensionContext;
	
	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}
	
	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		if(!executable) {
			const command = 'java';
			const jarPath = this.context.asAbsolutePath('jars/camel-dap-server.jar');
			const args = ['-jar', jarPath];
			return new vscode.DebugAdapterExecutable(command, args);
		}
		return executable;
	}
	
}
