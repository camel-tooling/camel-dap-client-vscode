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
import { resolve } from 'node:path';
import { CAMEL_ROUTE_YAML_WITH_SPACE } from '../variables';
import {
    ActivityBar,
    after,
    before,
    BottomBarPanel,
    EditorAction,
    EditorView,
    repeat,
    SideBarView,
    VSBrowser,
} from 'vscode-uitests-tooling';
import { killTerminal, waitUntilTerminalHasText } from '../utils';
import { execSync } from 'child_process';

describe('Camel standalone file deployment using Camel JBang Kubernetes Run', function () {
    this.timeout(800_000);

    let editorView: EditorView;
    const RESOURCES_PATH: string = resolve('src', 'ui-test', 'resources');

    before(async function () {
        await VSBrowser.instance.openResources(RESOURCES_PATH);
        await (await new ActivityBar().getViewControl('Explorer')).openView();
        const section = await new SideBarView().getContent().getSection('resources');
        await section.openItem(CAMEL_ROUTE_YAML_WITH_SPACE);

        editorView = new EditorView();
        await repeat(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, {
            timeout: 10_000,
            message: `The test file ${CAMEL_ROUTE_YAML_WITH_SPACE} was not opened`
        });
    });

    after(async function () {
        await killTerminal();
        await editorView.closeAllEditors();
        // remove deployed integration from a local cluster
        // TODO pay attention to change 4.9.0-SNAPSHOT to some stable version
        execSync('jbang -Dcamel.jbang.version=4.9.0-SNAPSHOT camel@apache/camel kubernetes delete --name=demoroute', { stdio: 'inherit', cwd: RESOURCES_PATH });
    });

    it('Deploy integration to Kubernetes (Minikube)', async function () {
        const action = (await editorView.getAction('Deploy Integration with Apache Camel Kubernetes Run')) as EditorAction;
        await action.click();

        // using some additional steps for CAMEL 4.9.0-SNAPSHOT / 4.8.1 version
        // because the '--dev' parameter is not working for a deployment to Kubernetes
        await waitUntilTerminalHasText(action.getDriver(), ['BUILD SUCCESS'], 3_000, 240_000);
        await killTerminal();

        const terminalView = await new BottomBarPanel().openTerminalView();
        await terminalView.getDriver().wait(async () => {
            const found = (await terminalView.getText()).match(/[A-Za-z]/g);
            return found;
        }, 10_000, 'New terminal shell was not opened properly.', 2_000);
        // skip 'await' for async function to allow continue test after terminal command execution which would be blocking thread for infinity
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        terminalView.executeCommand('jbang -Dcamel.jbang.version=4.9.0-SNAPSHOT camel@apache/camel kubernetes logs --name=demoroute'); // TODO pay attention to change 4.9.0-SNAPSHOT to some stable version
        await waitUntilTerminalHasText(action.getDriver(), ['Hello Camel from'], 3_000, 120_000);
    });

});
