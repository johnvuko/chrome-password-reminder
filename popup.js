"use strict";

var loginsList;
var tabIds;

function onCommonLoaded(){
	loginsList = document.getElementById("services");

	var backgroundPage = chrome.extension.getBackgroundPage();
	tabIds = backgroundPage.tabIds;

	setOptionsURL();
	addLoginsToHTML();
}

function setOptionsURL(){
	var anchor = document.getElementsByTagName('a')[0];
	anchor.setAttribute('href', chrome.extension.getURL("options.html"));
}

function addLoginsToHTML(){
	for(var index in logins){
		addLoginToHTML(logins[index]);
	}
}

function onClick(e){
	e.preventDefault();

	var login_id = this.getAttribute('data-login-id');

	var login = findLoginById(login_id);
	var service = services[login.service];
	
	chrome.tabs.create({ url: service.url }, function(tab){
		tabIds[tab.id] = { service: service, login: login };
	});
}

function addLoginToHTML(login){
	var service = login.service;
	var label = (login.label ? service + ' - ' + login.label : service);

	var element = document.createElement('li');
	element.innerHTML = "<a data-login-id='" + login.id + "'><img src='img/" + service + ".png' />" + label + "</a>";

	element.querySelector('a[data-login-id]').addEventListener('click', onClick);

	loginsList.appendChild(element);	
}

