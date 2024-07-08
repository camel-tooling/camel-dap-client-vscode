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
import * as os from 'os';
import * as path from 'path';

// Enforce same default storage setup as ExTester - see https://github.com/redhat-developer/vscode-extension-tester/wiki/Test-Setup#useful-env-variables
export const TEST_RESOURCES_DIR = process.env.TEST_RESOURCES ? process.env.TEST_RESOURCES : `${os.tmpdir()}/test-resources`;
export const EXTENSION_DIR = path.join(TEST_RESOURCES_DIR, 'test-extensions');
export const WORKBENCH_DIR = path.join(TEST_RESOURCES_DIR, 'ui-workbench');
export const RESOURCES_DIR = path.resolve('.', 'src', 'ui-test', 'resources');
export const RESOURCES_TASK_EXAMPLES_DIR: string = path.join(RESOURCES_DIR, 'tasks-examples');
export const RESOURCES_DOT_VSCODE_DIR = path.join(RESOURCES_DIR, ".vscode");
export const CAMEL_EXAMPLES_DIR = path.join(RESOURCES_DIR, 'camel-examples');
export const MAIN_CAMEL_EXAMPLE_DIR = path.join(CAMEL_EXAMPLES_DIR, 'main');
export const MAIN_CAMEL_EXAMPLE_DOT_VSCODE_DIR = path.join(MAIN_CAMEL_EXAMPLE_DIR, '.vscode');

export const TASKS_COMMAND: string = "Tasks: Run Task"; 
export const TASKS_TEST_FILE: string = "tasks.json";
export const TASKS_TEST_FILE_CAMEL_XML: string = "tasks_test_file.camel.xml";

export const LAUNCH_JSON: string = "launch.json";

export const DEFAULT_HEADER = 'YamlHeader';
export const DEFAULT_PROPERTY = 'yaml-dsl';
export const DEFAULT_BODY = 'Hello Camel from';
export const DEFAULT_MESSAGE = `${DEFAULT_HEADER}: ${DEFAULT_BODY} ${DEFAULT_PROPERTY}`;

export const TEST_HEADER = 'TestHeader';
export const TEST_PROPERTY = 'test-dsl';
export const TEST_BODY = 'Hello World from';
export const TEST_MESSAGE = `${TEST_HEADER}: ${TEST_BODY} ${TEST_PROPERTY}`;

export const ENABLING_CAMEL_DEBUGGER = "Enabling Camel debugger";

export const TEST_ARRAY_RUN = [
    'Routes startup',
    DEFAULT_MESSAGE
];
export const TEST_ARRAY_RUN_DEBUG = TEST_ARRAY_RUN.concat([
    ENABLING_CAMEL_DEBUGGER,
    'debugger has been attached'
]);

export const CAMEL_RUN_DEBUG_ACTION_LABEL = 'Run Camel Application with JBang and Debug';
export const CAMEL_RUN_ACTION_LABEL = 'Run Camel Application with JBang';
export const CAMEL_ROUTE_YAML_WITH_SPACE = 'demo route.camel.yaml';
export const CAMEL_ROUTE_YAML_WITH_SPACE_COPY = 'demo route copy.camel.yaml';
export const CAMEL_DEBUG_CODELENS = 'Camel Debug with JBang';
export const CAMEL_RUN_CODELENS = 'Camel Run with JBang';

// maven
export const MVN_COMPILE = 'mvn compile';
export const MVN_CLEAN = 'mvn clean';
export const MVN_BUILD_SUCCESS = 'BUILD SUCCESS';

// tasks.json
export const RUN_WITH_JBANG_WITH_CAMEL_DEBUG = 'Run Camel application with JBang with camel-debug';
export const START_WITH_CAMEL_DEBUG_MVN_GOAL = 'Start Camel application with camel:debug Maven goal';
export const ATTACH_DEBUGGER_USING_PRELAUNCH_TASK = 'Attach Camel Debugger after starting the Camel Application using the preLaunchTask specified';

// launch.json
export const LAUNCH_START_AND_ATTACH_DEBUGGER =  'Camel: Start Camel application and attach Camel debugger';

// variablesTest.java
export const VARIABLESTEST_JAVA = 'VariablesTest.java';

// pause test
export const SINGLEROUTE_YAML = 'SingleRoute.camel.yaml';
export const MULTIPLEROUTES_YAML = 'MultipleRoutes.camel.yaml';
