import { timeStamp } from 'console';

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

	setInterval(()=> {
		let offlineQueue = context.globalState.get('activity_queue', []);
		const hasNewData = currentSession.keystrokes > 0 || currentSession.charsDeleted > 0

		if (!hasNewData && offlineQueue.length === 0) {
			return;
		}


		const dataToSend = {...currentSession,timeStamp: new Date().toISOString()}
		offlineQueue.push(dataToSend)
		context.globalState.update('activity_queue', offlineQueue);

		console.log("Shippint to backend:", dataToSend);

		currentSession.keystrokes = 0;
		currentSession.charsAdded = 0;
		currentSession.charsDeleted = 0;
		currentSession.linesAdded = 0;
		currentSession.linesDeleted = 0;

		console.log("Sesseion reset. ready for the next minute");
		fetch('http://localhost:3001/api/activities', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(offlineQueue)
		})
		.then(response => {
			if (response.ok) {
				context.globalState.update('activity_queue', [])
				console.log("sent!")

			}
		})
		.catch(error => {
			console.error("Network Error!", error)
		})

	}, 60000)

	context.subscriptions.push(disposable2);


	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
