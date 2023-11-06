import * as path from 'path';

export const TEST_RESOURCES_DIR = path.resolve('.', 'test-resources');
export const EXTENSION_DIR = path.join(TEST_RESOURCES_DIR, 'test-extensions');
export const WORKBENCH_DIR = path.join(TEST_RESOURCES_DIR, 'ui-workbench');
export const RESOURCES_DIR = path.resolve('.', 'src', 'ui-test', 'resources');
export const RESOURCES_TASK_EXAMPLES_DIR: string = path.join(RESOURCES_DIR, 'tasks-examples');

export const TASKS_TEST_FILE: string = "tasks.json";

export const DEFAULT_HEADER = 'YamlHeader';
export const DEFAULT_PROPERTY = 'yaml-dsl';
export const DEFAULT_BODY = 'Hello Camel from';
export const DEFAULT_MESSAGE = `${DEFAULT_HEADER}: ${DEFAULT_BODY} ${DEFAULT_PROPERTY}`;

export const TEST_HEADER = 'TestHeader';
export const TEST_PROPERTY = 'test-dsl';
export const TEST_BODY = 'Hello World from';
export const TEST_MESSAGE = `${TEST_HEADER}: ${TEST_BODY} ${TEST_PROPERTY}`;

export const TEST_ARRAY_RUN = [
    'Routes startup',
    DEFAULT_MESSAGE
];
export const TEST_ARRAY_RUN_DEBUG = TEST_ARRAY_RUN.concat([
    'Enabling Camel debugger',
    'debugger has been attached'
]);

export const CAMEL_RUN_DEBUG_ACTION_LABEL = 'Run Camel Application with JBang and Debug';
export const CAMEL_RUN_ACTION_LABEL = 'Run Camel Application with JBang';
export const CAMEL_ROUTE_YAML_WITH_SPACE = 'demo route.camel.yaml';
export const CAMEL_ROUTE_YAML_WITH_SPACE_COPY = 'demo route copy.camel.yaml';
export const CAMEL_DEBUG_CODELENS = 'Camel Debug with JBang';
export const CAMEL_RUN_CODELENS = 'Camel Run with JBang';
