"use strict";

var loginsList = null;

var passwordManager = null;
var tabIds = null;

document.addEventListener('DOMContentLoaded', function(){
	passwordManager = new JTPasswordManager(onDocumentLoaded);
});

function onDocumentLoaded(){
	loginsList = document.querySelector("#services");

	var backgroundPage = chrome.extension.getBackgroundPage();
	tabIds = backgroundPage.tabIds;

	configureOptionsButton();
	loadLogins();
}

/**************************************/

function configureOptionsButton(){
	var button = document.getElementsByTagName('a')[0];
	button.setAttribute('href', chrome.extension.getURL("options.html"));
}

function loadLogins(){
	for(var i = 0; i < passwordManager.logins.length; ++i){	
		addLoginToHTML(passwordManager.logins[i]);
	}
}

function addLoginToHTML(login){
	var service = passwordManager.findServiceById(login.serviceId);
	var label = (login.label ? service.name + ' - ' + login.label : service.name);

	var element = document.createElement('li');
	element.innerHTML = "<a data-login-id='" + login.id + "'><img src='" + service.imageUrl + "' />" + label + "</a>";

	element.querySelector('a[data-login-id]').addEventListener('click', onClickOnLoginElement);

	loginsList.appendChild(element);	
}

function onClickOnLoginElement(e){
	e.preventDefault();

	var loginId = this.getAttribute('data-login-id');

	var login = passwordManager.findLoginById(loginId);
	var service = passwordManager.findServiceById(login.serviceId);
	
	chrome.tabs.create({ url: service.url }, function(tab){
		tabIds[tab.id] = {
			service: service,
			login: login
		};
	});
}
