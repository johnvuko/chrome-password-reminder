"use strict";

var tabIds = {};

function initBackground(){
	chrome.webNavigation.onCompleted.addListener(function(details){
		var tabDetails = tabIds[details.tabId];

		if(tabDetails){
			var service = tabDetails.service;
			var login = tabDetails.login;
			delete tabIds[details.tabId];

			chrome.tabs.executeScript(details.tabId, {code: codeToInject(service, login)});
		}
	});
}

function codeToInject(service, login){
	return '\
	function __JTautoLogin(){\
		var username = document.querySelector("' + service.usernameSelector + '");\
		var password = document.querySelector("' + service.passwordSelector + '");\
		var submit = document.querySelector("' + service.submitSelector + '");\
		username.value = "' + escape(login.username) + '";\
		password.value = "' + escape(login.password) + '";\
		submit.click();\
	}\
	__JTautoLogin();';
}

initBackground();
