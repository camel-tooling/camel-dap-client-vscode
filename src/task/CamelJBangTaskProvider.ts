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
import { CancellationToken, ProviderResult, ShellExecution, Task, TaskDefinition, TaskProvider, TaskRevealKind, TaskScope } from 'vscode';

export class CamelJBangTaskProvider implements TaskProvider {
	
	public static labelProvidedTask :string = "Start Camel application with debug enabled with JBang";
	public static labelProvidedRunTask: string = "Run Camel application with JBang";
	
	provideTasks(token: CancellationToken): ProviderResult<Task[]> {
		const tasks: Task[] = [];
		const taskDefinition :TaskDefinition = {
			"label": CamelJBangTaskProvider.labelProvidedTask,
			"type": "shell"
		};

		const task = new Task(
			taskDefinition,
			TaskScope.Workspace,
			CamelJBangTaskProvider.labelProvidedTask,
			'camel',
			new ShellExecution('jbang \'-Dorg.apache.camel.debugger.suspend=true\' camel@apache/camel run \'${relativeFile}\' --logging-level=info \'--dep=org.apache.camel:camel-debug\''),
			'$camel.debug.problemMatcher');
		task.isBackground = true;
		task.presentationOptions.reveal = TaskRevealKind.Always;

		const runTask = new Task(
			{
				"label": CamelJBangTaskProvider.labelProvidedRunTask,
				"type": "shell"
			},
			TaskScope.Workspace,
			CamelJBangTaskProvider.labelProvidedRunTask,
			'camel',
			new ShellExecution('jbang camel@apache/camel run \'${relativeFile}\' --logging-level=info')
		);
		runTask.isBackground = true;

		tasks.push(task);
		tasks.push(runTask);
		return tasks;
	}
	
	resolveTask(task: Task, token: CancellationToken): ProviderResult<Task> {
		return undefined;
	}
}
