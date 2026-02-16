const vscode = require('vscode');

const currentSession = {
	keystrokes: 0,
	linesAdded: 0,
	charsDeleted: 0,
	linesDeleted: 0,
	charsAdded: 0,
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	
	const disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
		
		vscode.window.showInformationMessage('Hello World from extension!');
	});

	const disposable2 = vscode.workspace.onDidChangeTextDocument((event) => {
		event.contentChanges.forEach(change => {

			const isSingleChar = change.text.length === 1;
			const isEnter = change.text === '\n' || change.text === '\r\n'
			const isDelete = change.rangeLength > 0 && change.text.length === 0;

			if (isSingleChar || isDelete || isEnter) {
				currentSession.keystrokes += 1;
			} 
			if (change.text.length > 1 && !isEnter){
				currentSession.charsAdded += change.text.length
			}
				currentSession.linesAdded += change.text.split("\n").length - 1
			
				currentSession.charsDeleted += change.rangeLength;	

			currentSession.linesDeleted += change.range.end.line - change.range.start.line;
			

		})
	})

	context.subscriptions.push(disposable2);


	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
