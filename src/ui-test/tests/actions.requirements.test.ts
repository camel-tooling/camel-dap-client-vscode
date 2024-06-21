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

import path from "path";
import { ActivityBar, EditorView, SideBarView, VSBrowser, WebDriver, Workbench } from "vscode-uitests-tooling";
import { CAMEL_ROUTE_YAML_WITH_SPACE, CAMEL_RUN_ACTION_LABEL, CAMEL_RUN_DEBUG_ACTION_LABEL } from "../variables";
import { expect } from "chai";
import { notificationCenterContains, waitUntilNotificationShows } from "../utils";

describe('Check actions requirements to run/debug', function () {
    this.timeout(30000);
    
    let driver: WebDriver;
    let editorView: EditorView;

    const NOTIFICATION_TEXT = "The action requires an opened folder/workspace to complete successfully.";

    before(async function () {
        driver = VSBrowser.instance.driver;

        if(!await noFolderOpened()){
            await (new Workbench()).executeCommand("Workspaces: Close Workspace");
        }
        
        await VSBrowser.instance.openResources(path.resolve('src', 'ui-test', 'resources', CAMEL_ROUTE_YAML_WITH_SPACE));
        editorView = new EditorView();
        await driver.wait(async function () {
            return (await editorView.getOpenEditorTitles()).find(title => title === CAMEL_ROUTE_YAML_WITH_SPACE);
        }, 5000);
    });

    it(`No folder opened in sidebar`, async function () {
        expect (await noFolderOpened()).to.be.true;
    });

    it(`Click on 'run' button and check warning message is displayed`, async function () {
        await clickButtonAndVerifyNotification(CAMEL_RUN_ACTION_LABEL);
    });
    
    it(`Click on 'debug' button and check warning message is displayed`, async function () {
        await clickButtonAndVerifyNotification(CAMEL_RUN_DEBUG_ACTION_LABEL);
    });

    async function clickButtonAndVerifyNotification(actionLabel: string) {
        const button = await editorView.getAction(actionLabel);
        await button?.click();
        await waitUntilNotificationShows(driver, NOTIFICATION_TEXT);
        expect(await notificationCenterContains(NOTIFICATION_TEXT)).to.be.true;
        const center = await new Workbench().openNotificationsCenter();
        await center.clearAllNotifications();
    }

    async function noFolderOpened(): Promise<boolean>{
        const activityBar = new ActivityBar();
        const explorerView = await activityBar.getViewControl('Explorer');
        await explorerView.openView();
        const explorer = await new SideBarView().getContent();
        const sections = await explorer.getSections();
        return ((await sections.at(0)?.getTitle()) === "No Folder Opened");
    }
});
