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
import * as jsonparser from 'jsonc-parser';
import * as vscode from 'vscode';
export class CamelApplicationLauncherTasksCompletionItemProvider implements vscode.CompletionItemProvider {
	
	private mavenCompletion: vscode.CompletionItem = {
		label: 'Start Camel application with Maven with camel.debug profile',
		documentation: 'Start Camel application with camel.debug profile. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Start Camel application with camel.debug profile",
	"type": "shell",
	"command": "mvn", // mvn binary of Maven must be available on command-line
	"args": [
		"camel:run",
		"'-Pcamel.debug'" // This depends on your project. The goal here is to have camel-debug on the classpath.
	],
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops. 
}`
	};
	
	private mavenCompletionToLaunchTest: vscode.CompletionItem = {
		label: 'Launch Camel test with Maven with camel.debug profile',
		documentation: 'Launch Camel test with camel.debug profile. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask. A single test can be launch at the same time.',
		insertText:
			`{
	"label": "Launch Camel test with Maven with camel.debug profile",
	"type": "shell",
	"command": "mvn", // mvn binary of Maven must be available on command-line
	"args": [
		"test",
		"-Dtest=*", // If more than one test is present, a specific one must be specified as a single test can be Camel debugged per launch.
		"'-Pcamel.debug'" // This depends on your project. The goal here is to have camel-debug on the classpath.
	],
	"options": {
		"env": {
			"CAMEL_DEBUGGER_SUSPEND": "true" // Set to true by default. A debugger must be attached for message to be processed.
		}
	},
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops. 
}`
	};
	
	private mavenCompletionWithDebugGoal: vscode.CompletionItem = {
		label: 'Start Camel application with camel:debug Maven goal',
		documentation: 'Start Camel application with camel:debug Maven goal. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask. It requires Camel 3.18+.',
		insertText:
			`{
	"label": "Start Camel application with camel:debug Maven goal",
	"type": "shell",
	"command": "mvn", // mvn binary of Maven must be available on command-line
	"args": [
		"camel:debug"
	],
	"options": {
		"env": {
			"CAMEL_DEBUGGER_SUSPEND": "true" // Set to true by default. A debugger must be attached for message to be processed.
		}
	},
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops. 
}`
	};
	
	private mavenQuarkusCompletion: vscode.CompletionItem = {
		label: 'Start Camel application with Maven Quarkus Dev with camel.debug profile',
		documentation: 'Start Camel application with Maven Quarkus dev and camel.debug profile. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Start Camel application with Maven Quarkus Dev with camel.debug profile",
	"type": "shell",
	"command": "mvn", // mvn binary of Maven must be available on command-line
	"args": [
		"compile",
		"quarkus:dev",
		"'-Pcamel.debug'" // This depends on your project. The goal here is to have camel-debug on the classpath.
	],
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops. 
}`
	};

	private mavenQuarkusBuildNativeCompletion: vscode.CompletionItem = {
		label: 'Build a Camel Quarkus application as a Native executable debug-ready',
		documentation: 'Build a native Quarkus application with JMX and Camel Debugger enabled. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Build a Camel Quarkus application as a Native executable debug-ready",
	"detail": "This task will build Camel Quarkus application with JMX and Camel Debugger enabled using GraalVM",
	"type": "shell",
	"command": "./mvnw",
	"args": [
		"install",
		"-Dnative",
		"'-Dquarkus.native.monitoring=jmxserver,jmxclient'",
		"'-Dquarkus.camel.debug.enabled=true'",
		"'-Pcamel.debug'" // This depends on your project
	],
	"problemMatcher": [],
	"presentation": {
		"reveal": "always"
	}
}`
	};

	private mavenQuarkusStartNativeCompletion: vscode.CompletionItem = {
		label: 'Start Camel native application debug-ready',
		documentation: 'Start Camel native application with Maven Quarkus Native and camel.debug profile. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Start Camel native application debug-ready",
	"detail": "This task will start Camel native application with Maven Quarkus Native and camel.debug profile",
	"type": "shell",
	"command": "./target/*-runner",
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true
}`
	};
	
	private jbangCompletion: vscode.CompletionItem = {
		label: 'Run Camel application with JBang with camel-debug',
		documentation: 'Start debuggable Camel application with JBang. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Run Camel application with JBang with camel-debug",
	"type": "shell",
	"command": "jbang", // jbang binary must be available on command-line
	"args": [
		"'-Dorg.apache.camel.debugger.suspend=true'", // requires Camel 3.18+ to take effect
		"'-Dcamel.jbang.version=4.5.0'", // to adapt to your Camel version. 3.16+ is required
		"camel@apache/camel",
		"run",
		"\${relativeFile}", //to adapt to your workspace, using relativeFile means that the task must be launched when the file to start in debug in the active editor
		"--logging-level=info",
		"--reload",
		"'--dep=org.apache.camel:camel-debug'"
	],
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the jbang command doesn't return until the Camel application stops. 
}`
	};
	
	
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const globalNode = jsonparser.parseTree(document.getText());
		const completions: vscode.CompletionItem[] = [];
		if(globalNode !== undefined) {
			const node = jsonparser.findNodeAtOffset(globalNode, document.offsetAt(position), false);
			if (node) {
				if (this.isInTasksArray(node)) {
					completions.push(this.mavenCompletionWithDebugGoal);
					completions.push(this.mavenCompletion);
					completions.push(this.mavenQuarkusCompletion);
					completions.push(this.mavenCompletionToLaunchTest);
					completions.push(this.mavenQuarkusBuildNativeCompletion);
					completions.push(this.mavenQuarkusStartNativeCompletion);
					completions.push(this.jbangCompletion);
				}
			}
		}
		return completions;
	}
		
	private isInTasksArray(node: jsonparser.Node) {
		return this.isInArray(node)
			&& this.isParentTasks(node);
	}

	private isInArray(node: jsonparser.Node) {
		return node?.type === "array";
	}

	private isParentTasks(node: jsonparser.Node) {
		return this.isParentHasStringPropertyOfType(node, 'tasks');
	}
	
	private isParentHasStringPropertyOfType(node: jsonparser.Node, type: string) {
		const parent = node.parent;
		if (parent !== undefined && parent.type === "property") {
			const nodeTasks = parent.children?.find(child => {
				return child.type === "string" && child.value === type;
			});
			return nodeTasks !== undefined;
		}
		return false;
	}	
}
