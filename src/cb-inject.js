(function() {
	const electron = require('electron');

	// Remove the video element
	const vid = document.querySelector('video');
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
									electron.ipcRenderer.send('tip-alert', {
										username: tipInfo[1],
										amount: tipInfo[2],
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
	electron.ipcRenderer.send('watch-status', true);

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