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
import { resolve, join } from 'node:path';
import {
    after,
    ArraySetting,
    before,
    BottomBarPanel,
    EditorAction,
    EditorView,
    VSBrowser,
    Workbench,
} from 'vscode-extension-tester';
import { killTerminal, waitUntilTerminalHasText } from '../utils';
import { execSync } from 'child_process';
import { CAMEL_ROUTE_YAML_WITH_SPACE } from '../variables';

/**
 * Note: OC login needs to be done before executing this test for deployment into OpenShift
 */
describe('Camel standalone file deployment using Camel JBang Kubernetes Run', function () {
    this.timeout(600_000); // 10 minutes

    let editorView: EditorView;
    let jbangVersion: string;
    let kubernetesRunParameters: string[];
    const RESOURCES_PATH: string = resolve('src', 'ui-test', 'resources');

    before(async function () {
        jbangVersion = await getJBangVersion();
        kubernetesRunParameters = await getKubernetesRunParameters();
        await VSBrowser.instance.openResources(RESOURCES_PATH);
        await VSBrowser.instance.openResources(join(RESOURCES_PATH, CAMEL_ROUTE_YAML_WITH_SPACE));

        editorView = new EditorView();
        await editorView.getDriver().wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 10_000, `The test file ${CAMEL_ROUTE_YAML_WITH_SPACE} was not opened`);
    });

    after(async function () {
        await killTerminal();
        await editorView.closeAllEditors();
        // remove deployed integration from a local cluster
        if (kubernetesRunParameters[0].includes('openshift')) {
            // workaround: because of issues with 'camel kubernetes delete --name=<name>' in versions 4.8.1+ and OpenShift we need to cleanup using 'oc'
            // see https://issues.apache.org/jira/browse/CAMEL-21702
            execSync(`oc delete deployment demoroute`, { stdio: 'inherit' });
        } else {
            // minikube
            execSync(`jbang -Dcamel.jbang.version=${jbangVersion} camel@apache/camel kubernetes delete --name=demoroute`, { stdio: 'inherit', cwd: RESOURCES_PATH });
        }
    });

    it('Deploy integration to OpenShift or Kubernetes (Minikube)', async function () {
        const action = (await editorView.getAction('Deploy Integration with Apache Camel Kubernetes Run')) as EditorAction;
        await action.click();

        // using some additional steps for CAMEL 4.9.0-SNAPSHOT / 4.8.1 version
        // because the '--dev' parameter is not working for a deployment to Kubernetes
        await waitUntilTerminalHasText(action.getDriver(), ['BUILD SUCCESS'], 3_000, 600_000); // OpenShift requires higher timeout because it is pulling more dependencies
        await killTerminal();

        const terminalView = await new BottomBarPanel().openTerminalView();
        await terminalView.getDriver().wait(async () => {
            const found = (await terminalView.getText()).match(/[A-Za-z]/g);
            return found;
        }, 10_000, 'New terminal shell was not opened properly.', 2_000);
        // skip 'await' for async function to allow continue test after terminal command execution which would be blocking thread for infinity
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        terminalView.executeCommand(`jbang -Dcamel.jbang.version=${jbangVersion} camel@apache/camel kubernetes logs --name=demoroute`);
        await waitUntilTerminalHasText(action.getDriver(), ['Hello Camel from'], 3_000, 120_000);
    });

    async function getJBangVersion(): Promise<string> {
        const textField = await (await new Workbench().openSettings()).findSetting('JBang Version', 'Camel', 'Debug Adapter');
        const value = await textField.getValue() as string;
        await new EditorView().closeEditor('Settings');
        return value;
    }

    async function getKubernetesRunParameters(): Promise<string[]> {
        const setting = await (await new Workbench().openSettings()).findSetting('Kubernetes Run Parameters', 'Camel', 'Debug Adapter') as ArraySetting;
        const values = await setting.getValues();
        await new EditorView().closeEditor('Settings');
        return values;
    }

});
