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
	function __autoLogin(){\
		var username = document.querySelector("' + service.username + '");\
		var password = document.querySelector("' + service.password + '");\
		var submit = document.querySelector("' + service.submit + '");\
		username.value = "' + escape(login.username) + '";\
		password.value = "' + escape(login.password) + '";\
		submit.click();\
	}\
	__autoLogin();';
}

initBackground();
