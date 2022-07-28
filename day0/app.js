/**
 Description: Start of Angular application
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';

// Make this variable true if running the application locally.
var runFromLocalhost = properties.useLocalData;
var httpServerBasePath = "";

var app = angular.module('webUiDevApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'angular-wizard',
	'kendo.directives',
	'ngDraggable'
]).config(function ($routeProvider) {
	$routeProvider.when('/day0', {
			templateUrl : 'wizard/views/dayzeroView.html',
			controller : 'DayZeroCtrl'
		}).
		otherwise({
		redirectTo : '/day0'
		});
});

