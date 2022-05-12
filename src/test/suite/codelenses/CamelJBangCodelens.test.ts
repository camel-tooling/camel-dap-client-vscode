/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import { expect } from 'chai';
import * as extension from '../../../extension';
import * as vscode from 'vscode';
import { getDocUri } from '../util';
import { waitUntil } from 'async-wait-until';

suite("Debug with JBang CodeLenses Test", function () {

	test("Codelens provider returns correct CodeLens for yaml file", async () => {
		const doc = getDocUri('my-route.yaml');
		await vscode.workspace.openTextDocument(doc);

		await checkCodelensForOpenedDocument(doc);
	});

	test("Codelens provider returns correct CodeLens for xml file", async () => {
		const doc = getDocUri('my-route.xml');
		await vscode.workspace.openTextDocument(doc);

		await checkCodelensForOpenedDocument(doc);
	});

	test("Codelens provider returns correct CodeLens for java file", async () => {
		const doc = getDocUri('MyCamelRoute.java');
		await vscode.workspace.openTextDocument(doc);

		await checkCodelensForOpenedDocument(doc);
	});

});

export async function checkCodelensForOpenedDocument(uri: vscode.Uri) {
	const codeLenses: vscode.CodeLens[] | undefined = await retrieveCodeLensOnOpenedDocument(uri);
	checkCodeLens(codeLenses as vscode.CodeLens[]);
}

async function retrieveCodeLensOnOpenedDocument(uri: vscode.Uri): Promise<vscode.CodeLens[] | undefined> {
	let res :vscode.CodeLens[] | undefined;
	await waitUntil(async () => {
		res = await vscode.commands.executeCommand('vscode.executeCodeLensProvider', uri);
		return res !== undefined && res.length > 0;
	});
	return res;
}

function checkCodeLens(codeLenses: vscode.CodeLens[]) {
	const startIntegrationCodeLenses = codeLenses.filter(codelens => {
		return codelens.command?.command === extension.CAMEL_START_AND_DEBUG_WITH_JBANG_COMMAND_ID;
	});
	expect(startIntegrationCodeLenses).has.length(1);
	const codeLens: vscode.CodeLens = startIntegrationCodeLenses[0];
	expect(codeLens.isResolved).to.be.true;
}
