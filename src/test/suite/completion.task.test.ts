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
		const expectedCompletion = { label: 'Run Camel application with JBang with camel-debug' };
		await testCompletion(docURiTasksJson, new vscode.Position(3, 7), expectedCompletion);
	}).timeout(20000);

	test('Completion for Build a native Camel Quarkus application', async () => {
		const docURiTasksJson = getDocUri('.vscode/tasks.json');
		const expectedCompletion = { label: 'Build a Camel Quarkus application as a Native executable debug-ready' };
		await testCompletion(docURiTasksJson, new vscode.Position(3, 7), expectedCompletion);
	}).timeout(20000);

	test('Completion for Start Camel native application', async () => {
		const docURiTasksJson = getDocUri('.vscode/tasks.json');
		const expectedCompletion = { label: 'Start Camel native application debug-ready' };
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
	let lastCompletionList: vscode.CompletionList | undefined;
	try {
		await waitUntil(async () => {
			// Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
			await (vscode.commands.executeCommand('vscode.executeCompletionItemProvider', docUri, position)).then(value => {
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
		if (lastCompletionList) {
			lastCompletionList.items.forEach(completion => {
				errorMessage += completion.label + '\n';
			});
		}
		throw new Error(`${err}\nCannot find expected completion "${expectedCompletion.label}" in the list of completions:\n${errorMessage}`);
	}
}
