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
'use strict';

import { expect } from 'chai';
import * as extension from '../../../extension';
import * as vscode from 'vscode';
import { getDocUri } from '../util';
import { waitUntil } from 'async-wait-until';

suite("CodeLenses Test", function () {

	suite("Camel Debug with JBang", function () {

		test("Codelens provider returns correct CodeLens for YAML file", async () => testCodeLens('my-route.yaml', extension.CAMEL_RUN_AND_DEBUG_WITH_JBANG_COMMAND_ID));

		test("Codelens provider returns correct CodeLens for XML file", async () => testCodeLens('my-route.xml', extension.CAMEL_RUN_AND_DEBUG_WITH_JBANG_COMMAND_ID));

		test("Codelens provider returns correct CodeLens for Java file", async () => testCodeLens('MyCamelRoute.java', extension.CAMEL_RUN_AND_DEBUG_WITH_JBANG_COMMAND_ID));

	});

	suite("Camel Run with JBang", function () {

		test("Codelens provider returns correct CodeLens for YAML file", async () => testCodeLens('my-route.yaml', extension.CAMEL_RUN_WITH_JBANG_COMMAND_ID));

		test("Codelens provider returns correct CodeLens for XML file", async () => testCodeLens('my-route.xml', extension.CAMEL_RUN_WITH_JBANG_COMMAND_ID));

		test("Codelens provider returns correct CodeLens for Java file", async () => testCodeLens('MyCamelRoute.java', extension.CAMEL_RUN_WITH_JBANG_COMMAND_ID));

	});
});

async function testCodeLens(uri: string, camelCommand: string) {
	const doc = getDocUri(uri);
	await vscode.workspace.openTextDocument(doc);
	await checkCodelensForOpenedDocument(doc, camelCommand);
}

export async function checkCodelensForOpenedDocument(uri: vscode.Uri, camelCommand: string) {
	const codeLenses: vscode.CodeLens[] | undefined = await retrieveCodeLensOnOpenedDocument(uri);
	checkCodeLens(codeLenses as vscode.CodeLens[], camelCommand);
}

async function retrieveCodeLensOnOpenedDocument(uri: vscode.Uri): Promise<vscode.CodeLens[] | undefined> {
	let res :vscode.CodeLens[] | undefined;
	await waitUntil(async () => {
		res = await vscode.commands.executeCommand('vscode.executeCodeLensProvider', uri);
		return res !== undefined && res.length > 0;
	});
	return res;
}

function checkCodeLens(codeLenses: vscode.CodeLens[], camelCommand: string) {
	const integrationCondeLens = codeLenses.find(codelens => {
		return codelens.command?.command === camelCommand;
	});
	expect(integrationCondeLens).to.not.be.undefined;
	const codeLens = integrationCondeLens as vscode.CodeLens;
	expect(codeLens.isResolved).to.be.true;
}
