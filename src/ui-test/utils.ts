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
    BottomBarPanel,
    BreakpointSectionItem,
    CodeLens,
    ContentAssist,
    ContentAssistItem,
    ContextMenu,
    ContextMenuItem,
    DebugToolbar,
    DebugView,
    EditorView,
    InputBox,
    ModalDialog,
    SideBarView,
    TerminalView,
    TextEditor,
    VSBrowser,
    VariableSectionItem,
    ViewItem,
    WebDriver,
    Workbench,
    error,
    errors,
    repeat,
    until
} from 'vscode-uitests-tooling';
import * as path from 'path';
import * as fs from 'fs-extra';

export const DEFAULT_HEADER = 'YamlHeader';
export const DEFAULT_PROPERTY = 'yaml-dsl';
export const DEFAULT_BODY = 'Hello Camel from';

export const DEFAULT_MESSAGE = `${DEFAULT_HEADER}: ${DEFAULT_BODY} ${DEFAULT_PROPERTY}`;

export const TEST_HEADER = 'TestHeader';
export const TEST_PROPERTY = 'test-dsl';
export const TEST_BODY = 'Hello World from';

export const TEST_MESSAGE = `${TEST_HEADER}: ${TEST_BODY} ${TEST_PROPERTY}`;

export const DEBUGGER_ATTACHED_MESSAGE = 'debugger has been attached';
export const TEST_ARRAY_RUN = [
    'Routes startup',
    DEFAULT_MESSAGE
];
export const TEST_ARRAY_RUN_DEBUG = TEST_ARRAY_RUN.concat([
    'Enabling Camel debugger',
    DEBUGGER_ATTACHED_MESSAGE
]);

export const CAMEL_RUN_DEBUG_ACTION_LABEL = 'Run Camel Application with JBang and Debug';
export const CAMEL_RUN_ACTION_LABEL = 'Run Camel Application with JBang';
export const CAMEL_RUN_DEBUG_ACTION_QUICKPICKS_LABEL = 'Camel: ' + CAMEL_RUN_DEBUG_ACTION_LABEL;
export const CAMEL_RUN_ACTION_QUICKPICKS_LABEL = 'Camel: ' + CAMEL_RUN_ACTION_LABEL;
export const CAMEL_ROUTE_YAML_WITH_SPACE = 'demo route.camel.yaml';
export const CAMEL_ROUTE_YAML_WITH_SPACE_COPY = 'demo route copy.camel.yaml';

/**
 * Executes a command in the command prompt of the workbench.
 * @param command The command to execute.
 * @returns A Promise that resolves when the command is executed.
 * @throws An error if the command is not found in the command palette.
 */
export async function executeCommand(command: string): Promise<void> {
    const workbench = new Workbench();
    await workbench.openCommandPrompt();
    const input = await InputBox.create();
    await input.setText(`>${command}`);
    const quickpicks = await input.getQuickPicks();
    for (let quickpick of quickpicks) {
        if (await quickpick.getLabel() === `${command}`) {
            await quickpick.select();
            return;
        }
    }
    throw new Error(`Command '${command}' not found in the command palette`);
}

/**
 * Opens the context menu for a given route in the sidebar.
 * @param route The route for which the context menu should be opened.
 * @returns A promise that resolves to the opened ContextMenu.
 */
export async function openContextMenu(route: string): Promise<ContextMenu> {
    const item = await (await new SideBarView().getContent().getSection('resources')).findItem(route) as ViewItem;
    const menu = await item.openContextMenu();
    return menu;
}

/**
 * Selects a specific command from a given context menu.
 * @param command The command to select from the context menu.
 * @param menu The ContextMenu instance from which to select the command.
 * @returns A promise that resolves once the command is selected.
 * @throws An error if the specified command is not found in the context menu.
 */
export async function selectContextMenuItem(command: string, menu: ContextMenu): Promise<void> {
    const button = await menu.getItem(command);
    if (button instanceof ContextMenuItem) {
        await button.select();
    } else {
        throw new Error(`Button ${command} not found in context menu`);
    }
}

/**
 * Checks if the terminal view has the specified texts in the given textArray.
 * @param driver The WebDriver instance to use.
 * @param textArray An array of strings representing the texts to search for in the terminal view.
 * @param interval (Optional) The interval in milliseconds to wait between checks. Default is 2000ms.
 * @param timeout (Optional) The timeout in milliseconds. Default is 60000ms.
 * @returns A Promise that resolves to a boolean indicating whether the terminal view has the texts or not.
 */
export async function waitUntilTerminalHasText(driver: WebDriver, textArray: string[], interval = 2000, timeout = 60000): Promise<void> {
    await driver.sleep(interval);
    await driver.wait(async function () {
        try {
            const terminal = await activateTerminalView();
            const terminalText = await terminal.getText();
            for await (const text of textArray) {
                if (!(terminalText.includes(text))) {
                    return false;
                };
            }
            return true;
        } catch (err) {
            return false;
        }
    }, timeout, undefined, interval);
}

/**
 * Click on button to clear output in Terminal View
 */
export async function clearTerminal(): Promise<void> {
    await activateTerminalView();
    await new Workbench().executeCommand('terminal: clear');
}

/**
 * Click on button to kill running process in Terminal View
 */
export async function killTerminal(): Promise<void> {
    await (await activateTerminalView()).killTerminal();
}

/**
 * Click on 'Disconnect' button in debug bar
 * @param driver The WebDriver instance to use.
 */
export async function disconnectDebugger(driver: WebDriver, interval = 500): Promise<void> {
    await driver.wait(async function () {
        try {
            const debugBar = await DebugToolbar.create();
            await debugBar.disconnect();
            await driver.wait(until.elementIsNotVisible(debugBar), 10000);
            return true;
        } catch (err) {
            // Extra click to avoid the error: "Element is not clickable at point (x, y)"
            // Workaround for the issue: https://issues.redhat.com/browse/FUSETOOLS2-2100 
            await driver.actions().click().perform();
            return false;
        }
    }, 10000, undefined, interval);
}

/**
 * Ensures Terminal View is opened and focused
 * @returns A Promise that resolves to TerminalView instance.
 */
export async function activateTerminalView(): Promise<TerminalView> {
    // workaround ExTester issue - https://github.com/redhat-developer/vscode-extension-tester/issues/785
    await new Workbench().executeCommand('Terminal: Focus on Terminal View');
    return await new BottomBarPanel().openTerminalView();
}

/**
 * Replaces the specified text with the given replacement in the editor.
 * @param text The text to be replaced.
 * @param replacement The replacement text.
 * @returns A boolean indicating whether the text replacement was successful.
 */
export async function replaceTextInCodeEditor(text: string, replacement: string): Promise<boolean> {
    const editor = new TextEditor();
    try {
        await editor.selectText(text);
        await editor.typeText(replacement);
        await editor.save();
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Retrieves a specific item from the debugger's variable section.
 * @param driver The WebDriver instance to use for interaction.
 * @param item The name or identifier of the item to retrieve.
 * @param section The name of the section containing the item.
 * @param subsection (Optional) The name of the subsection within the section containing the item.
 * @returns A Promise that resolves to the retrieved VariableSectionItem or undefined if not found.
 */
export async function getDebuggerSectionItem(driver: WebDriver, item: string, section: string, subsection?: string): Promise<VariableSectionItem | undefined> {
    const debugView = (await (await new ActivityBar().getViewControl('Run')).openView()) as DebugView;
    return await driver.wait(async function () {
        try {
            let variablesSection = await debugView.getVariablesSection();
            if (subsection) {
                await variablesSection?.openItem(section, subsection);
            } else {
                await variablesSection?.openItem(section);
            }
            return await variablesSection.findItem(item);
        } catch (e) {
            // Extra click to avoid the error: "Element is not clickable at point (x, y)"
            // Issue is similar to https://issues.redhat.com/browse/FUSETOOLS2-2100
            if (e instanceof Error && e.name === 'ElementClickInterceptedError') {
                await driver.actions().click().perform();
            } else if (e instanceof Error && e.message === 'Internal error.') {
                throw e;
            }
        }
    }, 120000, undefined, 500);
}

/**
 * Retrieves the BreakpointSectionItem in the debugger section.
 * @param driver The WebDriver instance to use for interaction.
 * @param line The line number of the breakpoint to modify.
 * @returns A Promise that resolves to the retrieved BreakpointSectionItem or undefined if not found.
 */
export async function getBreakpoint(driver: WebDriver, line: number): Promise<BreakpointSectionItem | undefined> {
    const debugView = (await (await new ActivityBar().getViewControl('Run')).openView()) as DebugView;
    return await driver.wait(async function () {
        try {
            const breakpointSection = await debugView.getBreakpointSection();
            return await breakpointSection.findItem(async (item: BreakpointSectionItem) => await item.getBreakpointLine() === line);
        } catch (e) {
            return undefined;
        }
    }, 5000, undefined, 500);
}

/**
 * Finds a specific CodeLens with the given title.
 * @param title The title of the CodeLens to find.
 * @returns A Promise that resolves to the found CodeLens.
 */
export async function findCodelens(title: string): Promise<CodeLens> {
    return await repeat(async () => {
        const editor = new TextEditor();
        return await editor.getCodeLens(title);
    }, {
        timeout: 5000,
        ignoreErrors: [...errors.INTERACTIVITY_ERRORS, error.TimeoutError],
        message: `could not find codelens: ${title}`
    });
}

/**
* Switch to an editor tab with the given title.
*
* @param title Title of editor to activate
*/
export async function activateEditor(driver: WebDriver, title: string): Promise<TextEditor | null> {
    // workaround for https://issues.redhat.com/browse/FUSETOOLS2-2099
    let editor: TextEditor | null = null;
    await driver.wait(async function () {
        try {
            editor = await new EditorView().openEditor(title) as TextEditor;
            return true;
        } catch (err) {
            await driver.actions().click().perform();
            return false;
        }
    }, 10000, undefined, 500);
    return editor;
}

/**
 * Wait until content assist contains specific item. 
 * 
 * @param expectedContentAssistItem Expected item.
 * @param timeout Timeout for waiting.
 * @returns Item from Content Assist.
 */
export async function waitUntilContentAssistContains(expectedContentAssistItem: string, timeout = 10000): Promise<ContentAssist | null> {
    const editor = new TextEditor();
    let contentAssist: ContentAssist | null = null;

    await editor.getDriver().wait(async function () {
        contentAssist = await editor.toggleContentAssist(true) as ContentAssist;
        const hasItem = await contentAssist.hasItem(expectedContentAssistItem);
        if (!hasItem) {
            await editor.toggleContentAssist(false);
        }
        return hasItem;
    }, timeout);
    return contentAssist;
}

/**
 * Workaround for issue with ContentAssistItem getText() method.
 * For more details please see https://issues.redhat.com/browse/FUSETOOLS2-284
 *
 * @param item ContenAssistItem
 */
export async function getTextExt(item: ContentAssistItem): Promise<string> {
    const name: string = await item.getText();
    return name.split('\n')[0];
}

/**
 * Close editor with handling of Save/Don't Save Modal dialog.
 *
 * @param title Title of opened active editor.
 * @param save true/false
 */
export async function closeEditor(title: string, save?: boolean) {
    const dirty = await new TextEditor().isDirty();
    await new EditorView().closeEditor(title);
    if (dirty) {
        const dialog = new ModalDialog();
        if (save) {
            await dialog.pushButton('Save');
        } else {
            await dialog.pushButton('Don\'t Save');
        }
    }
}

/**
 * Get content of specific file.
 *
 * @param filename Name of file.
 * @param folder Folder with file.
 * @returns File content as string.
 */
export function getFileContent(filename: string, folder: string): string {
    return fs.readFileSync(path.resolve(folder, filename), { encoding: 'utf8', flag: 'r' });
}

/**
* Select specific item from Content Assist proposals.
* 
* @param expectedItem Expected item in Content Assist.
*/
export async function selectFromCA(expectedItem: string, timeout = 15000): Promise<void> {
    let contentAssist: ContentAssist | null = null;
    contentAssist = await waitUntilContentAssistContains(expectedItem, timeout);
    if (contentAssist !== null) {
        const item = await contentAssist.getItem(expectedItem);
        await item.click();
    }
}

/** Opens file in editor.
 *
 * @param driver WebDriver.
 * @param folder Folder with file.
 * @param file Filename.
 * @returns Instance of Text Editor.
 */
export async function openFileInEditor(driver: WebDriver, folder: string, file: string): Promise<TextEditor | null> {
	await VSBrowser.instance.openResources(path.join(folder, file));
	await waitUntilEditorIsOpened(driver, file);
	return (await activateEditor(driver, file));
}

/**
 * Wait until editor is opened.
 *
 * @param driver WebDriver.
 * @param title Title of editor - filename.
 * @param timeout Timeout for dynamic wait.
 */
export async function waitUntilEditorIsOpened(driver: WebDriver, title: string, timeout = 10000): Promise<void> {
	await driver.wait(async function () {
		return (await new EditorView().getOpenEditorTitles()).find(t => t === title);
	}, timeout);
}

/**
 * Creates empty file using fs. 
 * 
 * @param filename Name of file.
 * @param folder Folder with location of newly created file.
 */
export async function createFile(filename: string, folder: string): Promise<void> {
	try {
		await fs.createFile(path.join(folder, filename));
	} catch (err) {
		console.error(err);
	}
}

/**
 * Creates empty folder using fs. 
 * 
 * @param folder Path to newly created folder.
 */
export async function createFolder(folder: string): Promise<void> {
	try {
		await fs.mkdir(folder);
	} catch (err) {
		console.error(err);
	}
}

/**
 * Removes resource using fs.
 * 
 * @param path Path of resource to remove.
 */
export async function deleteResource(path: string): Promise<void> {
	try {
		await fs.remove(path);
	} catch (err) {
		console.error(err);
	}
}
