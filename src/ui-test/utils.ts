import {
    BottomBarPanel,
    ContextMenu,
    ContextMenuItem,
    DebugToolbar,
    InputBox,
    SideBarView,
    TerminalView,
    TextEditor,
    ViewItem,
    WebDriver,
    Workbench,
    until
} from 'vscode-uitests-tooling';

export const HELLO_CAMEL_MESSAGE = 'Hello Camel from yaml';
export const HELLO_WORLD_MESSAGE = 'Hello World from yaml';
export const DEBUGGER_ATTACHED_MESSAGE = 'debugger has been attached';
export const TEST_ARRAY_RUN = [
    'Routes startup',
    HELLO_CAMEL_MESSAGE
];
export const TEST_ARRAY_RUN_DEBUG = TEST_ARRAY_RUN.concat([
    'Enabling Camel debugger',
    DEBUGGER_ATTACHED_MESSAGE
]);

export const CAMEL_RUN_DEBUG_ACTION_LABEL = 'Run Camel Application with JBang and Debug';
export const CAMEL_RUN_ACTION_LABEL = 'Run Camel Application with JBang';
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
        if (await quickpick.getLabel() === `Camel: ${command}`) {
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
 * @param interval (Optional) The interval in milliseconds to wait between checks. Default is 500ms.
 * @returns A Promise that resolves to a boolean indicating whether the terminal view has the texts or not.
 */
export async function waitUntilTerminalHasText(driver: WebDriver, textArray: string[], interval = 500): Promise<void> {
    await driver.wait(async function () {
        try {
            const terminal = await activateTerminalView();
            const terminalText = await terminal.getText();
            for (const text of textArray) {
                if (!(terminalText.includes(text))) {
                    return false;
                };
            }
            return true;
        } catch (err) {
            return false;
        }
    }, undefined, undefined, interval);
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
export async function disconnectDebugger(driver: WebDriver): Promise<void> {
    const debugBar = await DebugToolbar.create();
    await debugBar.disconnect();
    await driver.wait(until.elementIsNotVisible(debugBar));
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
    try {
        const editor = new TextEditor();
        await editor.selectText(text);
        await editor.typeText(replacement);
        await editor.save();
        return true;
    } catch (err) {
        return false;
    }
}
