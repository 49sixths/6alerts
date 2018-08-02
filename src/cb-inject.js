(function() {
	const {ipcRenderer} = require('electron');
	const { init } = require('@sentry/electron');
	init({
	  dsn: 'https://2fb1f1d294414085a3d50ca80222aa0e@sentry.io/1251884',
	});
	
	// User is offline
	if (document.querySelector('.offline_tipping')) {
		Sentry.captureMessage('User offline');
		ipcRenderer.send('user-offline');
		return;
	}

	// User not found
	if (!document.querySelector('.chat-list')) {
		Sentry.captureMessage('User not found');
		ipcRenderer.send('user-not-found');
		return;
	}

	// Remove the video element
	const vid = document.querySelector('#still_video_container');
	vid.parentElement.removeChild(vid);

	// Select the node that will be observed for mutations
	var chatList = document.querySelector('.chat-list');

	// Options for the observer (which mutations to observe)
	var config = { attributes: false, childList: true, subtree: false };

	// Callback function to execute when mutations are observed
	var callback = function(mutationsList) {
		for(var mutation of mutationsList) {
			if (mutation.type == 'childList') {
				for (let m = 0; m < mutationsList.length; m++) {

					if (!mutationsList[m] || !mutationsList[m].addedNodes) continue;

					const addedNodes = mutationsList[m].addedNodes;

					if (addedNodes && addedNodes.length > 0) {
						for (let n = 0; n < addedNodes.length; n++) {
							const newNode = addedNodes[n];

							// Is user interaction
							const userNode = newNode.querySelector('.username');
							if (userNode) {
								// console.log('NEW MESSAGE', getTextContent(newNode));
							}
							
							// Is a tip alert?
							const tipAlert = newNode.querySelector(".tipalert");
							if (tipAlert) {
								const tipInfo = getTextContent(newNode).match(/([^\n ]+)\ tipped\ ([0-9]+) token[s]*/);
								if (tipInfo[1] && tipInfo[2]) {
									// console.log('TIP ALERT', `[${tipInfo[1]}] ${tipInfo[2]}tk`);
									ipcRenderer.send('tip-alert', {
										username: tipInfo[1],
										amount: parseInt(tipInfo[2]),
										test: false
									});
								}
								
							}
						}
					}
				}
				// console.log('A child node has been added or removed.', mutationsList);
			}
		}
	};

	// Create an observer instance linked to the callback function
	var observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(chatList, config);

	// Later, you can stop observing
	// observer.disconnect();

	// Send greeting
	ipcRenderer.send('watch-status', true);

	function getTextContent(node) {
		if (node.nodeType == Node.TEXT_NODE) return node.textContent;

		const childNodes = node.childNodes;

		let textContent = "";

		for (let i = 0; i < childNodes.length; i++) {
			switch (childNodes[i].nodeType) {
				case Node.TEXT_NODE:
					textContent += childNodes[i].textContent;
					break;
				case Node.ELEMENT_NODE:
					textContent += getTextContent(childNodes[i]);
					break;
			}
		}

		return textContent;
	}
})();