"use strict";

var servicesSelect = null;
var servicesList = null;
var loginsList = null;

var serviceForm = null;
var loginForm = null;

var passwordManager = null;

document.addEventListener('DOMContentLoaded', function(){
	passwordManager = new JTPasswordManager(onDocumentLoaded);
});

function onDocumentLoaded(){
	translateText();

	servicesSelect = document.querySelector("[name='service_id']");
	servicesList = document.querySelector("#services");
	loginsList = document.querySelector("#logins");

	serviceForm = document.querySelector(".service-form");
	loginForm = document.querySelector(".login-form");

	serviceForm.addEventListener('submit', onSubmitService);
	loginForm.addEventListener('submit', onSubmitLogin);

	loadServices();
	loadLogins();

	configureExportButton();
}

/**************************************/

function translateText(){
	var elements = document.querySelectorAll('[jt-tr]');
	for(var i  = 0; i < elements.length; ++i){
		var element = elements[i];

		var text = chrome.i18n.getMessage(element.attributes['jt-tr'].value);
		element.textContent = text;
	}
}

function loadServices(){
	for(var i = 0; i < passwordManager.services.length; ++i){	
		addServiceToSelect(passwordManager.services[i]);
		addServiceToHTML(passwordManager.services[i]);
	}
}

function loadLogins(){
	for(var i = 0; i < passwordManager.logins.length; ++i){	
		addLoginToHTML(passwordManager.logins[i]);
	}
}

function configureExportButton(){
	var button = document.querySelector('[jt-export]');

	button.setAttribute('download', 'dump.json');

	button.addEventListener('click', function(e){
		var dump = {
			loings: passwordManager.logins,
			services: passwordManager.services,
			version: passwordManager.version
		};

	 	button.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump)));
	});
}

/**************************************/

function addServiceToSelect(service){
	var element = document.createElement('option');
	element.value = service.id;
	element.text = service.name;

	servicesSelect.appendChild(element);	
}

function addServiceToHTML(service){
	var label = service.name;

	var element = document.createElement('div');
	element.setAttribute('class', 'col-xs-6 col-md-3 jt-cell');
	element.setAttribute('data-service-id', service.id);
	element.innerHTML = "<span class=\"jt-remove glyphicon glyphicon-remove\"></span><img src='" + service.imageUrl + "' /><a>" + label + "</a>";
	element.querySelector('.jt-remove').addEventListener('click', onClickOnServiceElement);

	servicesList.appendChild(element);	
}

function addLoginToHTML(login){
	var service = passwordManager.findServiceById(login.serviceId);
	var label = (login.label ? service.name + ' - ' + login.label : service.name);

	var element = document.createElement('div');
	element.setAttribute('class', 'col-xs-6 col-md-3 jt-cell');
	element.setAttribute('data-login-id', service.id);
	element.innerHTML = "<span class=\"jt-remove glyphicon glyphicon-remove\"></span><img src='" + service.imageUrl + "' /><a>" + label + "</a>";
	element.querySelector('.jt-remove').addEventListener('click', onClickOnLoginElement);

	loginsList.appendChild(element);	
}

function removeLoginByIdFromHTML(loginId){
	document.querySelector("[data-login-id='" + loginId +"']").remove();
}

function removeServiceByIdFromHTML(serviceId){
	document.querySelector("option[value='" + serviceId +"']").remove();
	document.querySelector("[data-service-id='" + serviceId +"']").remove();

	refreshServiceList();
	refreshLoginList();
}

function refreshLoginList(){
	loginsList.innerHTML = '';
	loadLogins();
}

function refreshServiceList(){
	servicesList.innerHTML = '';
	servicesSelect.innerHTML = '';
	loadServices();
}

/**************************************/

function onClickOnLoginElement(e){
	e.preventDefault();

	if(confirm(chrome.i18n.getMessage('removeElement'))){
		var loginId = this.parentElement.getAttribute('data-login-id');

		passwordManager.removeLoginById(loginId);
		removeLoginByIdFromHTML(loginId);
	}
}

function onClickOnServiceElement(e){
	e.preventDefault();

	if(confirm(chrome.i18n.getMessage('removeElement'))){
		var serviceId = this.parentElement.getAttribute('data-service-id');

		passwordManager.removeServiceById(serviceId);
		removeServiceByIdFromHTML(serviceId);
	}
}

/**************************************/

function onSubmitService(e){
	e.preventDefault();

	var name = serviceForm.querySelector("[name='name']").value;
	var url = serviceForm.querySelector("[name='url']").value;
	var imageUrl = serviceForm.querySelector("[name='image_url']").value;
	var usernameSelector = serviceForm.querySelector("[name='username_selector']").value;
	var passwordSelector = serviceForm.querySelector("[name='password_selector']").value;
	var submitSelector = serviceForm.querySelector("[name='submit_selector']").value;

	if(
		name.length > 0 &&
		url.length > 0 &&
		usernameSelector.length > 0 &&
		passwordSelector.length > 0 &&
		submitSelector.length > 0
		){

		var service = {
			name: name,
			url: url,
			usernameSelector: usernameSelector,
			passwordSelector: passwordSelector,
			submitSelector: submitSelector,

			imageUrl: (imageUrl.length > 0 ? imageUrl : "img/default_service.png")
		};

		passwordManager.addService(service);
		refreshServiceList();
		serviceForm.reset();
	}
}

function onSubmitLogin(e){
	e.preventDefault();

	var serviceId = loginForm.querySelector("[name='service_id']").value;
	var label = loginForm.querySelector("[name='label']").value;
	var username = loginForm.querySelector("[name='username']").value;
	var password = loginForm.querySelector("[name='password']").value;

	if(serviceId.length > 0 && username.length > 0  && password.length > 0 ){
		var login = {
			serviceId: serviceId,
			serviceName: passwordManager.findServiceById(serviceId).name,
			label: (label.length > 0 ? label : null),
			username: username,
			password: password
		};

		passwordManager.addLogin(login);
		refreshLoginList();
		loginForm.reset();
	}
}
