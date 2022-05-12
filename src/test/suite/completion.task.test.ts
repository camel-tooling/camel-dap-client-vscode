import { waitUntil } from 'async-wait-until';
import * as vscode from 'vscode';
import { getDocUri } from './util';

suite('Should do completion in tasks.json', () => {
	
	
	test('Completion for Start application with camel.debug profile', async () => {
		const docURiTasksJson = getDocUri('.vscode/tasks.json');
		const expectedCompletion = { label: 'Start Camel application with Maven with camel.debug profile' };
		await testCompletion(docURiTasksJson, new vscode.Position(3, 7), expectedCompletion);
	}).timeout(20000);
	
	test('Completion for Start application with jbang', async () => {
		const docURiTasksJson = getDocUri('.vscode/tasks.json');
		const expectedCompletion = { label: 'Start Camel application with JBang with camel-debug' };
		await testCompletion(docURiTasksJson, new vscode.Position(3, 7), expectedCompletion);
	}).timeout(20000);

});

async function testCompletion(
	docUri: vscode.Uri,
	position: vscode.Position,
	expectedCompletion: vscode.CompletionItem
) {
	const doc = await vscode.workspace.openTextDocument(docUri);
	await vscode.window.showTextDocument(doc);
	await checkExpectedCompletion(docUri, position, expectedCompletion);
}

export async function checkExpectedCompletion(docUri: vscode.Uri, position: vscode.Position, expectedCompletion: vscode.CompletionItem) {
	let hasExpectedCompletion = false;
	let lastCompletionList : vscode.CompletionList | undefined;
	try {
		await waitUntil(() => {
			// Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
			(vscode.commands.executeCommand('vscode.executeCompletionItemProvider', docUri, position)).then(value => {
				const actualCompletionList = value as vscode.CompletionList;
				lastCompletionList = actualCompletionList;
				const completionItemFound = actualCompletionList.items.find(completion => {
					return completion.label === expectedCompletion.label
						&& (expectedCompletion.insertText === undefined || completion.insertText === expectedCompletion.insertText);
				});
				hasExpectedCompletion = completionItemFound !== undefined;
			});
			return hasExpectedCompletion;
		}, 10000, 500);
	} catch (err) {
		let errorMessage = '';
		if(lastCompletionList) {
			lastCompletionList.items.forEach(completion => {
				errorMessage += completion.label + '\n';
			});
		}
		throw new Error(`${err}\nCannot find expected completion "${expectedCompletion.label}" in the list of completions:\n${errorMessage}`);
	}
}
