var tabIds = {};

(function(){

	'use strict';

	(function(){
		chrome.webNavigation.onCompleted.addListener(function(details){
			var tabDetails = tabIds[details.tabId];

			if(tabDetails){
				var service = tabDetails.service;
				var login = tabDetails.login;
				delete tabIds[details.tabId];

				chrome.tabs.executeScript(details.tabId, {code: codeToInject(service, login)});
			}
		});
	})();

	function codeToInject(service, login){
		return '\
		;(function(){\
			var username = document.querySelector("' + service.usernameSelector.replace(/\"/g, '\'') + '");\
			var password = document.querySelector("' + service.passwordSelector.replace(/\"/g, '\'') + '");\
			var submit = document.querySelector("' + service.submitSelector.replace(/\"/g, '\'') + '");\
			username.value = ' + JSON.stringify(login.username) + ';\
			password.value = '+ JSON.stringify(login.password) + ';\
			submit.click();\
		})();';
	}

})();
