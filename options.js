;(function(){
	
	'use strict';

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

		servicesSelect = document.querySelector('[name="service_id"]');
		servicesList = document.querySelector('#services');
		loginsList = document.querySelector('#logins');

		serviceForm = document.querySelector('.service-form');
		loginForm = document.querySelector('.login-form');

		serviceForm.addEventListener('submit', onSubmitService);
		loginForm.addEventListener('submit', onSubmitLogin);

		loadServices();
		loadLogins();

		configureServicesResetButton();

		configureExportButton();
		configureImportButton();
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

	function configureServicesResetButton(){
		var button  = document.querySelector('.service-form button[type="reset"]');
		button.addEventListener('click', function(){
			document.querySelector('.service-form input[type="hidden"]').value = '';
		});
	}

	function configureExportButton(){
		var button = document.querySelector('[jt-export]');

		button.setAttribute('download', 'backup.json');

		button.addEventListener('click', function(e){
			var dump = {
				logins: passwordManager.logins,
				services: passwordManager.services,
				version: passwordManager.version
			};

		 	button.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump)));
		});
	}

	function configureImportButton(){
		var handleFileUpload = function(e){
			console.log('File uploading...');

		    var reader = new FileReader();
		    reader.onerror = function errorHandler() {
				console.error('File upload error');
			}
			reader.onabort = function() {
				console.error('File upload aborted');
			};
			reader.onloadend = function () {
				console.log('File uploaded');

				var json = JSON.parse(reader.result);

				// Bug 1.2.0
				if(json.loings){
					json.logins = json.loings;
				}

				passwordManager.logins = json.logins;
				passwordManager.services = json.services;
				passwordManager.version = json.version;
				passwordManager.save();

				window.location.reload();
			}

			reader.readAsBinaryString(e.target.files[0]);
	    };

		document.querySelector('[jt-import]').addEventListener('change', handleFileUpload);
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
		element.innerHTML = '<span class="jt-remove glyphicon glyphicon-remove"></span><img src="' + service.imageUrl + '" /><a>' + label + '</a>';
		
		element.querySelector('.jt-remove').addEventListener('click', onClickOnRemoveServiceElement);
		element.addEventListener('click', onClickOnServiceElement);

		servicesList.appendChild(element);	
	}

	function addLoginToHTML(login){
		var service = passwordManager.findServiceById(login.serviceId);
		var label = (login.label ? service.name + ' - ' + login.label : service.name);

		var element = document.createElement('div');
		element.setAttribute('class', 'col-xs-6 col-md-3 jt-cell');
		element.setAttribute('data-login-id', login.id);
		element.innerHTML = '<span class="jt-remove glyphicon glyphicon-remove"></span><img src="' + service.imageUrl + '" /><a>' + label + '</a>';
		element.querySelector('.jt-remove').addEventListener('click', onClickOnRemoveLoginElement);

		loginsList.appendChild(element);	
	}

	function removeLoginByIdFromHTML(loginId){
		document.querySelector('[data-login-id="' + loginId +'"]').remove();
	}

	function removeServiceByIdFromHTML(serviceId){
		document.querySelector('option[value="' + serviceId + '"]').remove();
		document.querySelector('[data-service-id="' + serviceId + '"]').remove();

		refreshServiceList();
		refreshLoginList();
	}

	function refreshLoginList(){
		loginsList.innerHTML = '';
		loadLogins();
		loginForm.reset();
	}

	function refreshServiceList(){
		servicesList.innerHTML = '';
		servicesSelect.innerHTML = '';
		loadServices();
		serviceForm.reset();
	}

	/**************************************/

	function onClickOnRemoveLoginElement(e){
		e.preventDefault();

		if(confirm(chrome.i18n.getMessage('removeElement'))){
			var loginId = this.parentElement.getAttribute('data-login-id');

			passwordManager.removeLoginById(loginId);
			removeLoginByIdFromHTML(loginId);
		}
	}

	function onClickOnRemoveServiceElement(e){
		e.preventDefault();

		if(confirm(chrome.i18n.getMessage('removeElement'))){
			var serviceId = this.parentElement.getAttribute('data-service-id');

			passwordManager.removeServiceById(serviceId);
			removeServiceByIdFromHTML(serviceId);
		}
	}

	function onClickOnServiceElement(e){
		e.preventDefault();

		var serviceId = this.getAttribute('data-service-id');
		var service = passwordManager.findServiceById(serviceId);
		
		serviceForm.querySelector('[name="id"]').value = service.id;
		serviceForm.querySelector('[name="name"]').value = service.name;
		serviceForm.querySelector('[name="url"]').value = service.url;
		serviceForm.querySelector('[name="image_url"]').value = service.imageUrl;
		serviceForm.querySelector('[name="username_selector"]').value = service.usernameSelector;
		serviceForm.querySelector('[name="password_selector"]').value = service.passwordSelector;
		serviceForm.querySelector('[name="submit_selector"]').value = service.submitSelector;
	}

	/**************************************/

	function onSubmitService(e){
		e.preventDefault();

		var serviceId = serviceForm.querySelector('[name="id"]').value;
		var name = serviceForm.querySelector('[name="name"]').value;
		var url = serviceForm.querySelector('[name="url"]').value;
		var imageUrl = serviceForm.querySelector('[name="image_url"]').value;
		var usernameSelector = serviceForm.querySelector('[name="username_selector"]').value;
		var passwordSelector = serviceForm.querySelector('[name="password_selector"]').value;
		var submitSelector = serviceForm.querySelector('[name="submit_selector"]').value;

		if(
			name.length > 0 &&
			url.length > 0 &&
			usernameSelector.length > 0 &&
			passwordSelector.length > 0 &&
			submitSelector.length > 0
			){

			imageUrl = (imageUrl.length > 0 ? imageUrl : 'img/default_service.png');

			var service = null;

			if(serviceId && serviceId != ''){
				service = passwordManager.findServiceById(serviceId);
			}

			if(!service){
				service = {};
			}

			service.name = name;
			service.url = url;
			service.usernameSelector = usernameSelector;
			service.passwordSelector = passwordSelector;
			service.submitSelector = submitSelector;
			service.imageUrl = imageUrl;

			if(!service.id || service.id == ''){
				passwordManager.addService(service);
			}
			else{
				passwordManager.save();
			}
 
			refreshServiceList();
		}
	}

	function onSubmitLogin(e){
		e.preventDefault();

		var serviceId = loginForm.querySelector('[name="service_id"]').value;
		var label = loginForm.querySelector('[name="label"]').value;
		var username = loginForm.querySelector('[name="username"]').value;
		var password = loginForm.querySelector('[name="password"]').value;

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
		}
	}

})();
