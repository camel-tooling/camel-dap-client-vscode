import waitUntil from 'async-wait-until';
import { EditorView } from 'vscode-extension-tester';


export async function actionAvailable(editorView: EditorView, actionLabel: string) {
    await waitUntil(async () => {
        try {
            return await editorView.getAction(actionLabel) !== undefined;
        } catch {
            return false;
        }
    });
}
