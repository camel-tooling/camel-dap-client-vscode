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
  DebugCallStackSection,
  DebugToolbar,
  DebugView,
  EditorView,
  SideBarView,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { MULTIPLEROUTES_YAML, RESOURCES_DIR, SINGLEROUTE_YAML } from "../variables";
import {
  executeCommand,
  CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL,
  waitUntilTerminalHasText,
  DEBUGGER_ATTACHED_MESSAGE,
  disconnectDebugger,
  killTerminal,
  isCamelVersionProductized,
  waitUntilViewOpened,
} from "../utils";
import { assert } from "chai";

describe("Support pause of Camel debugger", function () {
  this.timeout(300000);

  let driver: WebDriver;
  let callStack: DebugCallStackSection;
  let view: DebugView;

  beforeEach(async function () {
    if (isCamelVersionProductized(process.env.CAMEL_VERSION)) {
      this.skip();
    }
    driver = VSBrowser.instance.driver;
    await VSBrowser.instance.openResources(RESOURCES_DIR);
    await waitUntilViewOpened('Explorer');
  });

  afterEach(async function () {
    if (isCamelVersionProductized(process.env.CAMEL_VERSION)) {
      // do nothing - after is executed even if skip is called in before
    }
    else {
      await disconnectDebugger(driver);
      await (await new ActivityBar().getViewControl('Run and Debug'))?.closeView();
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

  const EXPECTED_BUTTONS = ['Pause', 'Step Over', 'Step Into', 'Step Out'];
  const routeSuspendMessages = [
    'Suspended route3 (timer://yaml3)',
    'Suspended route2 (timer://yaml2)',
    'Suspended route1 (timer://yaml1)'
  ];
  const routeMessages = [
    'Hello 3 from route3',
    'Hello 2 from route2',
    'Hello 1 from route1'
  ];
  const PAUSED_ON_PAUSE = 'PAUSED ON PAUSE';
  const RUNNING = 'running';

  it("Multiple routes pause", async function () {
    await prepareEnvironment(MULTIPLEROUTES_YAML);

    // call stack has all 3 routes
    view = (await (await new ActivityBar().getViewControl('Run'))?.openView()) as DebugView;
    callStack = await view.getCallStackSection();
    const items = await callStack.getVisibleItems();
    assert.lengthOf(items, 3);

    // each route has 4 action buttons
    for (let i = 0; i < items.length; i++) {
      const buttons = await items.at(i)?.getActionButtons();
      assert.equal(buttons?.length, 4);

      // all expected buttons available
      for (let j = 0; j < EXPECTED_BUTTONS.length; j++) {
        assert(await buttons?.at(j)?.getLabel(), EXPECTED_BUTTONS[j]);
      }
    }

    // stop all routes    
    const routes = items.slice(0, 3);
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      await (await route?.getActionButtons())?.at(0)?.click();
      await waitUntilTerminalHasText(driver, [routeSuspendMessages[i]], 1000, 15000);
      assert(await route?.getText(), PAUSED_ON_PAUSE);
    }

    // clear terminal
    await new Workbench().executeCommand('Terminal: Clear');

    // start all routes
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      await (await route?.getActionButtons())?.at(0)?.click();
      await waitUntilTerminalHasText(driver, [routeMessages[i]], 1000, 15000);
      assert(await route?.getText(), RUNNING);
    }
  });

  async function prepareEnvironment(file: string): Promise<void> {
    const section = await new SideBarView().getContent().getSection('resources');
    await section.openItem(file);
    const editorView = new EditorView();
    await driver.wait(async function () {
      return (await editorView.getOpenEditorTitles()).find(title => title === file);
    }, 5000);
    await executeCommand(CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL);
    await (await new ActivityBar().getViewControl('Run'))?.openView();
    await waitUntilTerminalHasText(driver, [DEBUGGER_ATTACHED_MESSAGE], 4000, 120000);
  }
});
