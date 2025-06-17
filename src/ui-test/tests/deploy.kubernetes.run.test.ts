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
    before,
    EditorView,
    VSBrowser,
} from 'vscode-extension-tester';
import { killTerminal, waitUntilTerminalHasText } from '../utils';
import { CAMEL_ROUTE_YAML_WITH_SPACE } from '../variables';
import { clickOnEditorAction } from './helper/Awaiters';

/**
 * Note: OC login needs to be done before executing this test for deployment into OpenShift
 */
describe('Camel standalone file deployment using Camel JBang Kubernetes Run', function () {
    this.timeout(900_000); // 15 minutes

    let editorView: EditorView;
    const RESOURCES_PATH: string = resolve('src', 'ui-test', 'resources');

    before(async function () {
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
    });

    it('Deploy integration to OpenShift or Kubernetes (Minikube)', async function () {
        await VSBrowser.instance.driver.sleep(500);
        await clickOnEditorAction(editorView, 'Deploy Integration with Apache Camel Kubernetes Run');
        await waitUntilTerminalHasText(VSBrowser.instance.driver, ['Hello Camel from'], 10_000, 900_000);
    });

});
