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
import * as extension from '../extension';
const CODELENS_TITLE_START_INTEGRATION = 'Camel Debug with JBang';

export class CamelJBangCodelens implements vscode.CodeLensProvider {

	onDidChangeCodeLenses?: vscode.Event<void>;

	provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
		const fulltext = document.getText();
		if (fulltext.includes('from')
			&& (fulltext.includes('to') || fulltext.includes('log'))) {
			const topOfDocument = new vscode.Range(0, 0, 0, 0);
			const classPathRefreshCommand: vscode.Command = {
				command: extension.CAMEL_START_AND_DEBUG_WITH_JBANG_COMMAND_ID,
				title: CODELENS_TITLE_START_INTEGRATION,
				tooltip: 'Start integration file with Camel JBang and attach the Camel Debugger.\n' 
						+ 'Take care that the integration file is in supported scope of Camel JBang and that jbang CLI is avilable on system path.',
				arguments: [document.uri]
			};
			return [new vscode.CodeLens(topOfDocument, classPathRefreshCommand)];
		}
		return [];
	}

}
