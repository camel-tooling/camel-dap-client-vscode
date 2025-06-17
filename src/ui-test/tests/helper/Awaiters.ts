import waitUntil from 'async-wait-until';
import { ContextMenu, EditorView } from 'vscode-extension-tester';


export async function clickOnEditorAction(editorView: EditorView, actionLabel: string) {
    await waitUntil(async () => {
        try {
            const action = await editorView.getAction(actionLabel);
            if (action !== undefined) {
                await action.click();
                return true;
            } else {
                return false;
            }
        } catch {
            return false;
        }
    });
}

export async function openDropDownMenuEditorAction(editorView: EditorView, actionLabel: string) :Promise<ContextMenu | undefined>{
    let contextMenu : ContextMenu | undefined = undefined;
    await waitUntil(async () => {
        try {
            const action = await editorView.getAction(actionLabel);
            if (action !== undefined) {
                contextMenu = await action.open();
                return true;
            } else {
                return false;
            }
        } catch {
            return false;
        }
    });
    return contextMenu;
}

export async function selectDropDownMenuEditorAction(editorView: EditorView, actionLabel: string, subActionLabel: string) :Promise<ContextMenu | undefined>{
    let contextMenu : ContextMenu | undefined = undefined;
    await waitUntil(async () => {
        try {
            const action = await editorView.getAction(actionLabel);
            if (action !== undefined) {
                contextMenu = await action.open();
                await contextMenu.select(subActionLabel);
                return true;
            } else {
                return false;
            }
        } catch {
            return false;
        }
    });
    return contextMenu;
}
