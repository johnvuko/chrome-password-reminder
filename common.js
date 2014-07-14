'use strict';

function Service(){
	this.id = null;
	
	this.name = null;
	this.url = null;
	this.imageUrl = null;

	this.usernameSelector = null;
	this.passwordSelector = null;
	this.submitSelector = null;
}

function Login(){
	this.id = null;

	this.serviceId = null;
	this.label = null;
	this.username = null;
	this.password = null;

	this.serviceName = null; // Use for sort logins by service's name
}

function JTPasswordManager(callback){
	this._storage = chrome.storage.local;

	this.logins = null;
	this.services = null;
	this.version = null;

	this._lastIds = {
		logins: 0,
		services: 0
	};

	this._sortFields = {
		logins: ['serviceName', 'label'],
		services: ['name']
	};

	var manager = this;
	this._storage.get(['logins', 'services', 'version'], function(result){
		manager.logins = result.logins || [];
		manager.services = result.services || [];
		manager.version = result.version || null;

		for(var i = 0; i < manager.logins.length; ++i){
			manager._lastIds['logins'] = Math.max(manager._lastIds['logins'], manager.logins[i].id);
		}

		for(var i = 0; i < manager.services.length; ++i){
			manager._lastIds['services'] = Math.max(manager._lastIds['services'], manager.services[i].id);
		}

		if(manager.services.length == 0){
			manager.loadDefaultServices();
		}

		if(!manager.version){
			manager.migrationV120();
		}

		if(manager.version == 1.2){
			manager.migrationV130();
		}

		manager.sortEntity('logins');
		manager.sortEntity('services');

		if(callback){
			callback();
		}
	});
}

/**************************************/

JTPasswordManager.prototype.save = function(){
	this._storage.set({
		'logins': this.logins,
		'services': this.services,
		'version': this.version
	});
};

/**************************************/

JTPasswordManager.prototype.addLogin = function(login){
	return this.addEntity('logins', login);
};

JTPasswordManager.prototype.removeLoginById = function(loginId){
	this.removeEntityById('logins', loginId);
};

JTPasswordManager.prototype.findLoginById = function(loginId){
	return this.findEntityById('logins', loginId);
};

/**************************************/

JTPasswordManager.prototype.addService = function(service){
	return this.addEntity('services', service);
};

JTPasswordManager.prototype.removeServiceById = function(serviceId){
	this.removeEntityById('services', serviceId);
	this.removeEntityBy('logins', 'serviceId', serviceId);
};

JTPasswordManager.prototype.findServiceById = function(serviceId){
	return this.findEntityById('services', serviceId);
};

/**************************************/

JTPasswordManager.prototype.addEntity = function(entityName, entity){
	this._lastIds[entityName]++;
	entity.id = this._lastIds[entityName];
	this[entityName].push(entity);

	this.sortEntity(entityName);
	this.save();

	return entity;
};

JTPasswordManager.prototype.removeEntityById = function(entityName, entityId){
	this.removeEntityBy(entityName, 'id', entityId);
};

JTPasswordManager.prototype.removeEntityBy = function(entityName, field, value){
	var entities = this[entityName];

	for(var i = 0; i < entities.length; ++i){
		var entity = entities[i];
		if(entity[field] == value){
			entities.splice(i, 1);
			--i;
		}
	}

	this.save();
};

JTPasswordManager.prototype.findEntityById = function(entityName, entityId){
	return this.findEntityBy(entityName, 'id', entityId)[0];
};

JTPasswordManager.prototype.findEntityBy = function(entityName, field, value){
	var results = [];
	var entities = this[entityName];

	for(var i = 0; i < entities.length; ++i){
		var entity = entities[i];
		if(entity[field] == value){
			results.push(entity);
		}
	}

	return results;
};

JTPasswordManager.prototype.sortEntity = function(entityName){
	var sort = function(a, b){
		a = (a ? a : '');
		b = (b ? b : '');

    	var aLower = a.toLowerCase();
    	var bLower = b.toLowerCase();
    	return (aLower < bLower) ? - 1 : (aLower > bLower) ? 1 : 0;
    };

	var entities = this[entityName];
	var field = this._sortFields[entityName][0];
	var secondField = this._sortFields[entityName][1];

	entities.sort(function(a, b){
	    var result = sort(a[field], b[field]);

	    if(result == 0 && secondField){
	    	result = sort(a[secondField], a[secondField]);
	    }

	    return result;
	});
};

/**************************************/

JTPasswordManager.prototype.loadDefaultServices = function(){
	this.addService({
		name: 'amazon',
		url: 'https://www.amazon.com/ap/signin?_encoding=UTF8&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fcss%2Fhomepage.html%3Fie%3DUTF8%26ref_%3Dgno_yam_ya',
		imageUrl: 'img/amazon.png',
		usernameSelector: 'input[name="email"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'input#signInSubmit'
	});
	this.addService({
		name: 'asana',
		url: 'https://app.asana.com/',
		imageUrl: 'img/asana.png',
		usernameSelector: 'input[name="e"]',
		passwordSelector: 'input[name="p"]',
		submitSelector: '#submit_button'
	});
	this.addService({
		name: 'bananatag',
		url: 'https://bananatag.com/login',
		imageUrl: 'img/bananatag.png',
		usernameSelector: 'input[name="txtEmail"]',
		passwordSelector: 'input[name="txtPassword"]',
		submitSelector: 'a[data-action="login"]'
	});
	this.addService({
		name: 'basecamp',
		url: 'https://launchpad.37signals.com/basecamp/signin',
		imageUrl: 'img/basecamp.png',
		usernameSelector: 'input[name="username"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'input[type="image"]'
	});
	this.addService({
		name: 'bitbucket',
		url: 'https://bitbucket.org/account/signin/?next=/',
		imageUrl: 'img/bitbucket.png',
		usernameSelector: 'input[name="username"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'button[type="submit"]'
	});
	this.addService({
		name: 'box',
		url: 'https://app.box.com/login/',
		imageUrl: 'img/box.png',
		usernameSelector: 'input[name="login"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'button#login_button_credentials'
	});
	this.addService({
		name: 'dropbox',
		url: 'https://www.dropbox.com/login',
		imageUrl: 'img/dropbox.png',
		usernameSelector: 'input[name="login_email"]',
		passwordSelector: 'input[name="login_password"]',
		submitSelector: 'input[type="submit"]'
	});
	this.addService({
		name: 'ebay',
		url: 'https://signin.ebay.com/ws/eBayISAPI.dll?SellItem',
		imageUrl: 'img/ebay.png',
		usernameSelector: 'input[name="userid"]',
		passwordSelector: 'input[name="pass"]',
		submitSelector: 'input[name="sgnBt"]'
	});
	this.addService({
		name: 'evernote',
		url: 'https://www.evernote.com/Login.action?targetUrl=%2FHome.action',
		imageUrl: 'img/evernote.png',
		usernameSelector: 'input[name="username"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'input[name="login"]'
	});
	this.addService({
		name: 'facebook',
		url: 'https://www.facebook.com/',
		imageUrl: 'img/facebook.png',
		usernameSelector: 'input[name="email"]',
		passwordSelector: 'input[name="pass"]',
		submitSelector: 'input[type="submit"]'
	});
	this.addService({
		name: 'foursquare',
		url: 'https://foursquare.com/login/',
		imageUrl: 'img/foursquare.png',
		usernameSelector: 'input[name="emailOrPhone"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'input[type="submit"]'
	});
	this.addService({
		name: 'github',
		url: 'https://github.com/login',
		imageUrl: 'img/github.png',
		usernameSelector: 'input[name="login"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'input[type="submit"]'
	});
	this.addService({
		name: 'google',
		url: 'https://accounts.google.com/ServiceLogin?continue=https://www.google.com/',
		imageUrl: 'img/google.png',
		usernameSelector: 'input[name="Email"]',
		passwordSelector: 'input[name="Passwd"]',
		submitSelector: 'input[name="signIn"]'
	});
	this.addService({
		name: 'heroku',
		url: 'https://id.heroku.com/login',
		imageUrl: 'img/heroku.png',
		usernameSelector: 'input[name="email"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'input[type="submit"]'
	});
	this.addService({
		name: 'mailchimp',
		url: 'https://login.mailchimp.com/',
		imageUrl: 'img/mailchimp.png',
		usernameSelector: 'input[name="username"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: 'button[type="submit"]'
	});
	this.addService({
		name: 'marqueed',
		url: 'https://www.marqueed.com/users/sign_in',
		imageUrl: 'img/marqueed.png',
		usernameSelector: 'input[name="user[email]"]',
		passwordSelector: 'input[name="user[password]"]',
		submitSelector: 'input[type="submit"].signin-submit'
	});
	this.addService({
		name: 'online',
		url: 'https://console.online.net/fr/login',
		imageUrl: 'img/online.png',
		usernameSelector: 'input#username',
		passwordSelector: 'input#password',
		submitSelector: '#login input[type="submit"]'
	});
	this.addService({
		name: 'ovh',
		url: 'https://www.ovh.com/managerv3/',
		imageUrl: 'img/ovh.png',
		usernameSelector: 'input[name="session_nic"]',
		passwordSelector: 'input[name="session_password"]',
		submitSelector: 'input[type="submit"]'
	});
	this.addService({
		name: 'paypal',
		url: 'https://www.paypal.com/webapps/mpp/accueil',
		imageUrl: 'img/paypal.png',
		usernameSelector: 'input[name="login_email"]',
		passwordSelector: 'input[name="login_password"]',
		submitSelector: 'form[name="login_form"] input[type="submit"]'
	});
	this.addService({
		name: 'twitter',
		url: 'https://twitter.com/',
		imageUrl: 'img/twitter.png',
		usernameSelector: 'input[name="session[username_or_email]"]',
		passwordSelector: 'input[name="session[password]"]',
		submitSelector: '.signin button[type="submit"]'
	});
	this.addService({
		name: 'uxpin',
		url: 'https://app.uxpin.com/',
		imageUrl: 'img/uxpin.png',
		usernameSelector: 'input[name="login"]',
		passwordSelector: 'input[name="password"]',
		submitSelector: '#loginform_button1'
	});
	this.addService({
		name: 'yahoo',
		url: 'https://login.yahoo.com/config/login',
		imageUrl: 'img/yahoo.png',
		usernameSelector: 'input[name="login"]',
		passwordSelector: 'input[name="passwd"]',
		submitSelector: 'button[type="submit"]'
	});
};

/**************************************/

JTPasswordManager.prototype.migrationV120 = function(){
	for(var i = 0; i < this.logins.length; ++i){
		var login = this.logins[i];
		
		var service = this.findEntityBy('services', 'name', login.service)[0];

		if(service == null){
			console.log('Error cannot find service ', login.service, ' for login ', login);
			throw 'Error migrationV2';
		}

		login.serviceId = service.id;
		login.serviceName = service.name;
		delete login.service;
	}

	this.version = 1.2;
	this._storage.set({
		logins: this.logins,
		version: this.version
	});
};

JTPasswordManager.prototype.migrationV130 = function(){
	this.addService({
		name: 'airbnb',
		url: 'https://www.airbnb.com/login',
		imageUrl: 'img/airbnb.png',
		usernameSelector: 'input#signin_email',
		passwordSelector: 'input#signin_password',
		submitSelector: 'form.signin-form button[type="submit"]'
	});
	this.addService({
		name: 'b&you',
		url: 'https://www.b-and-you.fr/customer/account/login',
		imageUrl: 'img/b-and-you.png',
		usernameSelector: 'input#emailPost',
		passwordSelector: 'input#passPost',
		submitSelector: '#loginFormPost button[type="submit"]'
	});
	this.addService({
		name: 'flurry',
		url: 'https://dev.flurry.com/secure/login.do',
		imageUrl: 'img/flurry.png',
		usernameSelector: '#emailInput',
		passwordSelector: '#passwordInput',
		submitSelector: 'button'
	});
	this.addService({
		name: 'LinkedIn',
		url: 'https://www.linkedin.com/uas/login',
		imageUrl: 'img/linkedin.png',
		usernameSelector: '#session_key-login',
		passwordSelector: '#session_password-login',
		submitSelector: 'input[name="signin"]'
	});

	this.version = 1.3;
	this._storage.set({
		version: this.version
	});
};
