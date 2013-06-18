"use strict";

var servicesList = null;
var loginsList = null;

function onCommonLoaded(){
	servicesList = document.querySelector("[name='service']");
	loginsList = document.getElementById("services");

	addServicesToHTML();
	addLoginsToHTML();

	document.querySelector('form').addEventListener('submit', onSubmit);
}

function addServicesToHTML(){
	for(var service in services){	
		addServiceToHTML(service);
	}
}

function addLoginsToHTML(){
	for(var index in logins){
		addLoginToHTML(logins[index]);
	}
}

function onSubmit(e){
	e.preventDefault();

	var service = document.querySelector("[name='service']").value;
	var label = document.querySelector("[name='label']").value;
	var username = document.querySelector("[name='username']").value;
	var password = document.querySelector("[name='password']").value;

	if(service.length > 0 && username.length > 0  && password.length > 0 ){
		var login = {
			service: service,
			label: (label.length > 0 ? label : null),
			username: username,
			password: password
		};
		
		addLogin(login);
		addLoginToHTML(login);
		document.querySelector("form").reset();
	}
}

function onClick(e){
	e.preventDefault();

	if(confirm('Remove this element?')){
		var login_id = this.getAttribute('data-login-id');

		removeLoginById(login_id);
		removeLoginByIdToHTML(login_id);
	}
}

function addServiceToHTML(service){
	var element = document.createElement('option');
	element.value = service;
	element.innerHTML = service;

	servicesList.appendChild(element);	
}

function addLoginToHTML(login){
	var service = login.service;
	var label = (login.label ? service + ' - ' + login.label : service);

	var element = document.createElement('li');
	element.innerHTML = "<a data-login-id='" + login.id + "'><img src='img/" + service + ".png' />" + label + "</a>";

	element.querySelector('a[data-login-id]').addEventListener('click', onClick);

	loginsList.appendChild(element);	
}

function removeLoginByIdToHTML(login_id){
	document.querySelector("a[data-login-id='" + login_id +"']").parentElement.remove();
}
