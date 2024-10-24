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
import { CancellationToken, ProviderResult, ShellExecution, ShellExecutionOptions, ShellQuoting, Task, TaskDefinition, TaskProvider, TaskRevealKind, tasks, TaskScope, workspace } from 'vscode';

export class CamelJBangTaskProvider implements TaskProvider {

	public static readonly labelProvidedRunWithDebugActivatedTask: string = "Start Opened Camel application with debug enabled with JBang";
	public static readonly labelProvidedRunTask: string = "Run with JBang Opened Camel Application";
	public static readonly labelProvidedRunAllWithDebugActivatedTask: string = "Start All Camel applications with debug enabled with JBang";
	public static readonly labelProvidedRunAllTask: string = "Run with JBang All Camel Applications";
	public static readonly labelProvidedRunAllFromContainingFolderWithDebugActivatedTask: string = "Start All Camel applications from containing folder with debug enabled with JBang";
	public static readonly labelProvidedRunAllFromContainingFolderTask: string = "Run with JBang All Camel Applications from containing folder";
	public static readonly labelProvidedDeployTask: string = "Deploy Integration with Apache Camel Kubernetes Run";
	public static readonly labelAddKubernetesPluginTask: string = "Camel JBang add Kubernetes plugin";

	provideTasks(_token: CancellationToken): ProviderResult<Task[]> {
		const tasks: Task[] = [];

		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedRunTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedRunAllWithDebugActivatedTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedRunAllTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderWithDebugActivatedTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelProvidedDeployTask));
		tasks.push(this.createTask(CamelJBangTaskProvider.labelAddKubernetesPluginTask));
		return tasks;
	}

	createTask(taskLabel: string): Task {
		switch (taskLabel) {
			case CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask:
				return this.createRunWithDebugTask(CamelJBangTaskProvider.labelProvidedRunWithDebugActivatedTask, '${relativeFile}', undefined);
			case CamelJBangTaskProvider.labelProvidedRunTask:
				return this.createRunTask(CamelJBangTaskProvider.labelProvidedRunTask, '${relativeFile}', undefined);
			case CamelJBangTaskProvider.labelProvidedRunAllWithDebugActivatedTask:
				return this.createRunWithDebugTask(CamelJBangTaskProvider.labelProvidedRunAllWithDebugActivatedTask, '*', undefined);
			case CamelJBangTaskProvider.labelProvidedRunAllTask:
				return this.createRunTask(CamelJBangTaskProvider.labelProvidedRunAllTask, '*', undefined);
			case CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderWithDebugActivatedTask:
				return this.createRunWithDebugTask(CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderWithDebugActivatedTask, '*','${fileDirname}');
			case CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderTask:
				return this.createRunTask(CamelJBangTaskProvider.labelProvidedRunAllFromContainingFolderTask, '*', '${fileDirname}');
			case CamelJBangTaskProvider.labelProvidedDeployTask:
				return this.createDeployTask(CamelJBangTaskProvider.labelProvidedDeployTask, '${relativeFile}', undefined);
			case CamelJBangTaskProvider.labelAddKubernetesPluginTask:
				return this.createAddKubernetesPluginTask('kubernetes', CamelJBangTaskProvider.labelAddKubernetesPluginTask);
			default:
				break;
		}
		throw new Error('Method not implemented.');
	}

	private createDeployTask(taskLabel: string, patternForCamelFiles: string, cwd: string | undefined) {
		const shellExecOptions: ShellExecutionOptions = {
			cwd: cwd
		};
		const deployTask = new Task(
			{
				"label": taskLabel,
				"type": "shell"
			},
			TaskScope.Workspace,
			taskLabel,
			'camel',
			new ShellExecution(
				'jbang',
				[
					{
						// "value": `-Dcamel.jbang.version=${this.getCamelJBangCLIVersion()}`,
						// it can be switched back after bump to default version Camel JBang 4.8.1
						// the 4.9.0-SNAPSHOT version will be used only for deploy feature
						"value": `-Dcamel.jbang.version=4.9.0-SNAPSHOT`,
						"quoting": ShellQuoting.Strong
					},
					'camel@apache/camel',
					'kubernetes',
					'run',
					patternForCamelFiles,
					this.getCamelVersion(),
					...this.getKubernetesExtraParameters()
				].filter(function (arg) { return arg; }), // remove ALL empty values ("", null, undefined and 0)
				shellExecOptions
			)
		);
		deployTask.isBackground = true;
		return deployTask;
	}

	private createAddKubernetesPluginTask(plugin: string, taskLabel: string) {
		const addPluginTask = new Task(
			{
				"label": taskLabel,
				"type": "shell"
			},
			TaskScope.Workspace,
			taskLabel,
			'camel',
			new ShellExecution(
				'jbang',
				[
					{
						"value": `-Dcamel.jbang.version=${this.getCamelJBangCLIVersion()}`,
						"quoting": ShellQuoting.Strong
					},
					'camel@apache/camel',
					'plugin',
					'add',
					plugin
				]
			)
		);
		return addPluginTask;
	}

	async waitForTaskEnd(label: string): Promise<void> {
		await new Promise<void>(resolve => {
			const disposable = tasks.onDidEndTask((e) => {
				if (e.execution.task.name === label) {
					disposable.dispose();
					resolve();
				}
			});
		});
	}

	private createRunTask(taskLabel: string, patternForCamelFiles: string, cwd: string | undefined) {
		const shellExecOptions: ShellExecutionOptions = {
			cwd: cwd
		};
		const runTask = new Task(
			{
				"label": taskLabel,
				"type": "shell"
			},
			TaskScope.Workspace,
			taskLabel,
			'camel',
			new ShellExecution(
				'jbang',
				[
					{
						"value": `-Dcamel.jbang.version=${this.getCamelJBangCLIVersion()}`,
						"quoting": ShellQuoting.Strong
					},
					'camel@apache/camel',
					'run',
					patternForCamelFiles,
					'--dev',
					'--logging-level=info',
					this.getCamelVersion(),
					this.getRedHatMavenRepository(),
					...this.getExtraLaunchParameter()
				].filter(function (arg) { return arg; }), // remove ALL empty values ("", null, undefined and 0)
				shellExecOptions
			)
		);
		runTask.isBackground = true;
		return runTask;
	}

	private createRunWithDebugTask(taskLabel: string, patternForCamelFiles: string, cwd: string | undefined) {
		console.log(`cwd : ${cwd}`);
		const taskDefinition: TaskDefinition = {
			"label": taskLabel,
			"type": "shell"
		};

		const shellExecOptions: ShellExecutionOptions = {
			// see https://issues.apache.org/jira/browse/CAMEL-20431
			env: {
				'CAMEL_DEBUGGER_SUSPEND': 'true'
			},
			cwd: cwd
		};

		const runWithDebugActivatedTask = new Task(
			taskDefinition,
			TaskScope.Workspace,
			taskLabel,
			'camel',
			new ShellExecution(
				'jbang',
				[
					{
						"value": `-Dcamel.jbang.version=${this.getCamelJBangCLIVersion()}`,
						"quoting": ShellQuoting.Strong
					},
					{
						"value": '-Dorg.apache.camel.debugger.suspend=true',
						"quoting": ShellQuoting.Strong
					},
					'camel@apache/camel',
					'run',
					patternForCamelFiles,
					'--dev',
					'--logging-level=info',
					{
						"value": '--dep=org.apache.camel:camel-debug',
						"quoting": ShellQuoting.Strong
					},
					this.getCamelVersion(),
					this.getRedHatMavenRepository(),
					...this.getExtraLaunchParameter()
				].filter(function (arg) { return arg; }), // remove ALL empty values ("", null, undefined and 0)
				shellExecOptions
			),
			'$camel.debug.problemMatcher'
		);
		runWithDebugActivatedTask.isBackground = true;
		runWithDebugActivatedTask.presentationOptions.reveal = TaskRevealKind.Always;
		return runWithDebugActivatedTask;
	}

	resolveTask(_task: Task, _token: CancellationToken): ProviderResult<Task> {
		return undefined;
	}

	private getCamelJBangCLIVersion(): string {
		return workspace.getConfiguration().get('camel.debugAdapter.JBangVersion') as string;
	}

	private getCamelVersion(): string {
		const camelVersion = workspace.getConfiguration().get('camel.debugAdapter.CamelVersion') as string;
		if (camelVersion) {
			return `--camel-version=${camelVersion}`;
		} else {
			return '';
		}
	}

	private getCamelGlobalRepos(): string {
		const globalRepos = workspace.getConfiguration().get('camel.debugAdapter.redHatMavenRepository.global') as boolean;
		if (globalRepos) {
			return '#repos,';
		} else {
			return '';
		}
	}

	private getRedHatMavenRepository(): string {
		if (this.getCamelVersion().includes('redhat')) {
			const url = workspace.getConfiguration().get('camel.debugAdapter.RedHatMavenRepository') as string;
			const reposPlaceholder = this.getCamelGlobalRepos();
			return url ? `--repos=${reposPlaceholder}${url}` : '';
		} else {
			return '';
		}
	}

	private getExtraLaunchParameter(): string[] {
		const extraLaunchParameter = workspace.getConfiguration().get('camel.debugAdapter.ExtraLaunchParameter') as string[];
		if (extraLaunchParameter) {
			return extraLaunchParameter;
		} else {
			return [];
		}
	}

	private getKubernetesExtraParameters(): string[] {
		const extraParameters = workspace.getConfiguration().get('camel.debugAdapter.KubernetesRunParameters') as string[];
		if (extraParameters) {
			return extraParameters;
		} else {
			return [];
		}
	}
}
