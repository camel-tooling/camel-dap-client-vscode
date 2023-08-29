import {
    ActivityBar,
    BottomBarPanel,
    BreakpointSectionItem,
    CodeLens,
    ContextMenu,
    ContextMenuItem,
    DebugToolbar,
    DebugView,
    InputBox,
    SideBarView,
    TerminalView,
    TextEditor,
    VariableSectionItem,
    ViewItem,
    WebDriver,
    Workbench,
    error,
    errors,
    repeat,
    until
} from 'vscode-uitests-tooling';

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
            const internalError = await variablesSection.findItem("");
            const message = await internalError?.getVariableValue();
            if (message === 'Internal error.') {
                throw new Error(message);
            } else {
                return await variablesSection.findItem(item);
            }
        } catch (e) {
            // Extra click to avoid the error: "Element is not clickable at point (x, y)"
            // Issue is similar to https://issues.redhat.com/browse/FUSETOOLS2-2100
            if (e instanceof Error && e.name === 'ElementClickInterceptedError') {
                await driver.actions().click().perform();
            } else if (e instanceof Error && e.message === 'Internal error.') {
                throw e;
            }
            return undefined;
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
