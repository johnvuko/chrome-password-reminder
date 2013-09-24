"use strict";

var storage = null;
var services = null;
var logins = null;
var lastLoginId = 0;

document.addEventListener('DOMContentLoaded', function(){
	loadStorage();
	loadServices();
	loadLogins();
});

function addLogin(login){
	lastLoginId++;
	login.id = lastLoginId;
	logins.push(login);

	storage.set({'logins': logins});
}

function removeLoginById(login_id){
	for(var i = 0; i < logins.length; ++i){
		var current_login = logins[i];
		if(current_login.id == login_id){
			logins.splice(i, 1);
			break;
		}
	}

	storage.set({'logins': logins});
}

function findLoginById(login_id){
	var result = null;

	for(var i = 0; i < logins.length; ++i){
		var current_login = logins[i];
		if(current_login.id == login_id){
			result = current_login;
			break;
		}
	}

	return result;
}

function rebuildLoginsId(){
	for(var i = 0; i < logins.length; ++i){
		var login = logins[i];
		login.id = i;
		lastId = i;
	}

	storage.set({'logins': logins});
}

/******************/

function getLoginPosition(login_id){
	for(var i = 0; i < logins.length; ++i){
		if(logins[i].id == login_id){
			return i;
		}
	}
}

function moveLoginToPosition(login_id, position){
	var current_position = getLoginPosition(login_id);
	var login = logins[current_position];
	
	logins.splice(current_position, 1);
	logins.splice(position, 0, login);

	storage.set({'logins': logins});
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
		box: {
			url: "https://app.box.com/login/",
			username: "input[name='login']",
			password: "input[name='password']",
			submit: "button#login_button_credentials"
		},
		dropbox: {
			url: "https://www.dropbox.com/login",
			username: "input[name='login']",
			password: "input[name='password']",
			submit: "input[type='submit']"
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
		foursquare: {
			url: "https://foursquare.com/login/",
			username: "input[name='emailOrPhone']",
			password: "input[name='password']",
			submit: "input[type='submit']"
		},
		github: {
			url: "https://github.com/login",
			username: "input[name='login']",
			password: "input[name='password']",
			submit: "input[type='submit']"
		},
		google: {
			url: "https://accounts.google.com/ServiceLogin?continue=https://www.google.com/",
			username: "input[name='Email']",
			password: "input[name='Passwd']",
			submit: "input[name='signIn']"
		},
		heroku: {
			url: "https://id.heroku.com/login",
			username: "input[name='email']",
			password: "input[name='password']",
			submit: "input[type='submit']"
		},
		mailchimp: {
			url: "https://login.mailchimp.com/",
			username: "input[name='username']",
			password: "input[name='password']",
			submit: "button[type='submit']"
		},
		marqueed: {
			url: "https://www.marqueed.com/users/sign_in",
			username: "input[name='user[email]']",
			password: "input[name='user[password]']",
			submit: "input[type='submit'].signin-submit"
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
		},
		uxpin: {
			url: "https://app.uxpin.com/",
			username: "input[name='login']",
			password: "input[name='password']",
			submit: "#loginform_button1"
		}
	};
}

function loadLogins(){
	storage.get('logins', function(result){
		logins = result.logins;
		if(!logins){
			logins = [];
		}

		for(var i = 0; i < logins.length; ++i){
			lastLoginId = Math.max(lastLoginId, logins[i].id);
		}

		onCommonLoaded();
	});
}
