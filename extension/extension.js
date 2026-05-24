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

	const HEARTBEAT_INTERVAL = 60000
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.show()
	statusBarItem.command = 'extensions.setApiKey';
	if(context.globalState.get('api_secret')) {
		statusBarItem.text = '$(check) CodeTracker Active'
	} else {
		statusBarItem.text = '$(key) Set CodeTracker Key'
	}
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
			if (change.text.length > 0){
				currentSession.charsAdded += change.text.length
			}
				currentSession.linesAdded += change.text.split("\n").length - 1
			
				currentSession.charsDeleted += change.rangeLength;	

			currentSession.linesDeleted += change.range.end.line - change.range.start.line;
			

		})
	})

	setInterval(async ()=> {
	/**
	 * @type {{ 
	 *  language: string; 
	 *  project: string | null; 
	 *  independentFile: string | null; 
	 *  editor: string; 
	 *  timeStamp: string; 
	 *  keystrokes: number; 
	 *  linesAdded: number; 
	 *  charsDeleted: number; 
	 *  linesDeleted: number; 
	 *  charsAdded: number; 
	 *  duration: number;
	 * }[]}
 	*/
		let offlineQueue = context.globalState.get('activity_queue', []);
		let userSecret =  context.globalState.get('api_secret')
		const hasNewData = currentSession.keystrokes > 0 || currentSession.charsDeleted > 0

		if (!hasNewData && offlineQueue.length === 0) {
			return;
		}
		const language = vscode.window.activeTextEditor?.document.languageId || 'unknown';
		
		const project = vscode.workspace.name || null; 
		const independentFile = project ? null : vscode.window.activeTextEditor?.document.fileName.split(/[\\/]/).pop() || 'unknown'
		const editor = vscode.env.appName;

		const dataToSend = {...currentSession, duration: HEARTBEAT_INTERVAL, language, project, independentFile, editor, timeStamp: new Date().toISOString()}
		offlineQueue.push(dataToSend)
		context.globalState.update('activity_queue', offlineQueue);

		console.log("Shippint to backend:", dataToSend);

		currentSession.keystrokes = 0;
		currentSession.charsAdded = 0;
		currentSession.charsDeleted = 0;
		currentSession.linesAdded = 0;
		currentSession.linesDeleted = 0;

		console.log("Sesseion reset. ready for the next minute");
		if (userSecret) {
			fetch('https://code-activity-dashboard.onrender.com/api/activities', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': userSecret
			},
			body: JSON.stringify(offlineQueue)
			})
			.then(response => {
				if (response.ok) {
					context.globalState.update('activity_queue', [])
					statusBarItem.text = '$(check) CodeTracker Active'
					console.log("sent!")

				} else if (response.status === 401) {
					statusBarItem.text = '$(alert) Invalid API Key'
					context.globalState.update('api_secret', undefined)
					vscode.window.showErrorMessage('CodeTracker: Invalid API Key. Please check your settings.')
				}
			})
			.catch(error => {
				console.error("Network Error!", error)
				statusBarItem.text = '$(key) Connection Error';
			})
		} else {
				statusBarItem.text = '$(key) Set CodeTracker Key'
		}

	}, 60000)

	/** @param {string} key */
	const verifyAndSaveKey = async (key) => {
		try {
			const response = await fetch('https://code-activity-dashboard.onrender.com/api/users/verify', {
			method: 'GET',
			headers: {
				'x-api-key': key
			}
		}) 
			if(response.status === 200) {
				return 'valid'
			}
			else if (response.status === 401) {
				return 'invalid'
			}
			return 'error'
		} catch(error)  {
			console.error('Network Error!', error)
			return 'error'
		}
}

	const checkIdentity = async () => {
		let userSecret;
		if (!context.globalState.get('api_secret')) {

			const userChoice = await vscode.window.showInformationMessage('CodeTracker: Please set your API Secret to save status' , 'Set Key')
			if (userChoice) {
				const input = await vscode.window.showInputBox({ prompt: 'Paste your API Secret from teh website ( You can get it in the website in settings under the profile section)'})
				if (input) {
					statusBarItem.text = '$(sync~spin) Validating key...'
					const result = await verifyAndSaveKey(input)
					if (result === 'valid') {
						statusBarItem.text = '$(check) CodeTracker Active'
						context.globalState.update('api_secret', input)
						vscode.window.showInformationMessage('CodeTracker: API Key Verified!')
						userSecret = input
					} else if (result === 'invalid'){
						statusBarItem.text = '$(alert) Invalid API Key'
						vscode.window.showErrorMessage('CodeTracker: That key is incorrect. Please copy it again for the dashboard')
					} else {
						statusBarItem.text = '$(key) Connection Error';
						vscode.window.showWarningMessage('CodeTracker: Could not reach the server. Please check your internet connection and try again.')
						 setTimeout(() => {
							statusBarItem.text = '$(key) Set CodeTracker Key'
						 }, 5000);
					}
				}
			
			}
		}
		return userSecret
	}

	const disposable3 = vscode.commands.registerCommand('extensions.setApiKey', async () => {
		const input = await vscode.window.showInputBox({ prompt: 'Paste your API Secret from teh website ( You can get it in the website in settings under the profile section)'})
			if (input) {
					statusBarItem.text = '$(sync~spin) Validating key...'
					const result = await verifyAndSaveKey(input)
					if (result === 'valid') {
						statusBarItem.text = '$(check) CodeTracker Active'
						context.globalState.update('api_secret', input)
						vscode.window.showInformationMessage('CodeTracker: API Key Verified!')
					} else if (result === 'invalid'){
						statusBarItem.text = '$(alert) Invalid API Key'
						vscode.window.showErrorMessage('CodeTracker: That key is incorrect. Please copy it again for the dashboard')
					} else {
						statusBarItem.text = '$(key) Connection Error';
						vscode.window.showWarningMessage('CodeTracker: Could not reach the server. Please check your internet connection and try again.')
						 setTimeout(() => {
							statusBarItem.text = '$(key) Set CodeTracker Key'
						 }, 5000);
					}
				}
	})

	checkIdentity()
	context.subscriptions.push(statusBarItem)
	context.subscriptions.push(disposable3)
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
