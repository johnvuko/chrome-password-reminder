"use strict";

var storage = null;
var services = null;
var logins = null;

document.addEventListener('DOMContentLoaded', function(){
	loadStorage();
	loadServices();
	loadLogins();
});

function addLogin(login){
	login.id = logins.length + 1;
	logins.push(login);
	storage.set({'logins': logins});
}

function removeLoginById(login_id){
	for(var index = 0; index < logins.length; ++index){
		var current_login = logins[index];
		if(current_login.id == login_id){
			logins.splice(index, 1);
			break;
		}
	}
	storage.set({'logins': logins});
}

function findLoginById(login_id){
	var result = null;

	for(var index = 0; index < logins.length; ++index){
		var current_login = logins[index];
		if(current_login.id == login_id){
			result = current_login;
			break;
		}
	}

	return result;
}

/******************/

function loadStorage(){
	storage = chrome.storage.local;
}

function loadServices(){
	services = {
		amazon: {
			url: "https://www.amazon.com/ap/signin?_encoding=UTF8&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fcss%2Fhomepage.html%3Fie%3DUTF8%26ref_%3Dgno_yam_ya",
			username: "input[name='email']",
			password: "input[name='password']",
			submit: "input#signInSubmit"
		},
		basecamp: {
			url: "https://launchpad.37signals.com/basecamp/signin",
			username: "input[name='username']",
			password: "input[name='password']",
			submit: "input[type='image']"
		},
		bitbucket: {
			url: "https://bitbucket.org/account/signin/?next=/",
			username: "input[name='username']",
			password: "input[name='password']",
			submit: "button[type='submit']"
		},
		ebay: {
			url: "https://signin.ebay.com/ws/eBayISAPI.dll?SellItem",
			username: "input[name='userid']",
			password: "input[name='pass']",
			submit: "input[name='sgnBt']"
		},
		facebook: {
			url: "https://www.facebook.com/",
			username: "input[name='email']",
			password: "input[name='pass']",
			submit: "input[type='submit']"
		},
		github: {
			url: "https://github.com/login",
			username: "input[name='login']",
			password: "input[name='password']",
			submit: "input[type='submit']"
		},
		google: {
			url: "https://accounts.google.com/ServiceLogin?hl=fr&continue=http://www.google.com/",
			username: "input[name='Email']",
			password: "input[name='Passwd']",
			submit: "input[name='signIn']"
		},
		ovh: {
			url: "https://www.ovh.com/managerv3/",
			username: "input[name='session_nic']",
			password: "input[name='session_password']",
			submit: "input[type='submit']"
		},
		paypal: {
			url: "https://www.paypal.com/webapps/mpp/accueil",
			username: "input[name='login_email']",
			password: "input[name='login_password']",
			submit: "input[name='submit.x']"
		},
		twitter: {
			url: "https://twitter.com/",
			username: "input[name='session[username_or_email]']",
			password: "input[name='session[password]']",
			submit: ".signin button[type='submit']"
		}
	};
}

function loadLogins(){
	storage.get('logins', function(result){
		logins = result.logins;
		if(!logins){
			logins = [];
		}
		onCommonLoaded();
	});
}
