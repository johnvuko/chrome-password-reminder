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

function onMove(e){
	e.preventDefault();

	var login_id = this.getAttribute('data-login-id');
	var position = getLoginPosition(login_id);

	if(this.getAttribute('data-action') == 'up'){
		if(position > 0){
			moveLoginToPosition(login_id, position - 1);
		}
	}
	else{
		if(position < logins.length - 1){
			moveLoginToPosition(login_id, position + 1);
		}
	}

	refreshList();
}

function refreshList(){
	loginsList.innerHTML = '';
	addLoginsToHTML();
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
	element.innerHTML = "<a class='label' data-login-id='" + login.id + "'><img src='img/" + service + ".png' />" + label + "</a> <a data-login-id='" + login.id + "' data-action='down'>-</a> <a data-login-id='" + login.id + "' data-action='up'>+</a>";

	element.querySelector('a[data-login-id]').addEventListener('click', onClick);
	element.querySelector('a[data-action="down"]').addEventListener('click', onMove);
	element.querySelector('a[data-action="up"]').addEventListener('click', onMove);

	loginsList.appendChild(element);	
}

function removeLoginByIdToHTML(login_id){
	document.querySelector("a[data-login-id='" + login_id +"']").parentElement.remove();
}
