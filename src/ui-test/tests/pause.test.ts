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

import {
  ActivityBar,
  DebugToolbar,
  EditorView,
  SideBarView,
  VSBrowser,
  WebDriver,
} from "vscode-uitests-tooling";
import { RESOURCES_DIR, SINGLEROUTE_YAML } from "../variables";
import {
  executeCommand,
  CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL,
  waitUntilTerminalHasText,
  DEBUGGER_ATTACHED_MESSAGE,
  disconnectDebugger,
  killTerminal,
  isCamelVersionProductized,

} from "../utils";

describe("Support pause of Camel debugger", function () {
  this.timeout(300000);

  let driver: WebDriver;

  before(async function () {
    if (isCamelVersionProductized(process.env.CAMEL_VERSION)) {
      this.skip();
    }
    driver = VSBrowser.instance.driver;
    await VSBrowser.instance.openResources(RESOURCES_DIR);
    await (await new ActivityBar().getViewControl('Explorer')).openView();
  });

  after(async function () {
    if (isCamelVersionProductized(process.env.CAMEL_VERSION)){
      // do nothing - after is executed even if skip is called in before
    }
    else {
      await disconnectDebugger(driver);
      await (await new ActivityBar().getViewControl('Run and Debug')).closeView();
      await killTerminal();
      await new EditorView().closeAllEditors();
    }
  });

  it("Single route pause", async function () {
    await prepareEnvironment(SINGLEROUTE_YAML);

    const debugBar = await DebugToolbar.create();
    await debugBar.pause();
    await waitUntilTerminalHasText(driver, ["Suspended route1 (timer://yaml)"], 4000, 120000);

    await executeCommand("Terminal: Clear");

    await debugBar.continue();
    await waitUntilTerminalHasText(driver, ["Hello Camel from route1"], 4000, 120000);
  });

  // Skip test: Call Stack is not supported by DebugView yet.
  // https://github.com/redhat-developer/vscode-extension-tester/issues/1398
  it.skip("Multiple routes pause", async function () {

  });

  async function prepareEnvironment(file: string): Promise<void> {
    const section = await new SideBarView().getContent().getSection('resources');
    await section.openItem(file);
    const editorView = new EditorView();
    await driver.wait(async function () {
      return (await editorView.getOpenEditorTitles()).find(title => title === file);
    }, 5000);
    await executeCommand(CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL);
    await (await new ActivityBar().getViewControl('Run')).openView();
    await waitUntilTerminalHasText(driver, [DEBUGGER_ATTACHED_MESSAGE], 4000, 120000);
  }
});
