/**
 Description: Toggle Button Directive
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.directive('toggleButton', function($rootScope, WizardHandler) {
	return {
		restrict : 'E',

		replace : true,

		require : "ngModel",

		template : '<div class=\"btn-toggle right\">' + '<span class=\"\" name="firstToggleButton"></span>' + '<div class=\"toggle-slider\"></div>' + '<span class=\"active\" name="secondToggleButton"></span>' + '</div>',

		link : function($scope, $element, $attrs, ngModel) {
			if (!ngModel){
				return;
			}
			var enableToggleButton = true;
			var buttonClicked = false;

			var element = angular.element($element);
			var firstButton = angular.element($element[0].childNodes[0]);

			var options = $attrs.buttonOptions.split(",");

			// This will be used for displaying the text now.
			var displayOptions = $attrs.displayOptions;
			if(displayOptions){
				displayOptions = $attrs.displayOptions.split(",");
				$element[0].childNodes[0].innerHTML = displayOptions[0];
				//Set div text
				$element[0].childNodes[2].innerHTML = displayOptions[1];
			} else {
				$element[0].childNodes[0].innerHTML = options[0];
				//Set div text
				$element[0].childNodes[2].innerHTML = options[1];
			}

			$scope.$watch($attrs.ngModel, function(value) {
				var currentModelValue = firstButton.hasClass('active') ? options[0] : options[1];
				if ((value !== currentModelValue) && buttonClicked == false) {
					element.find('span').toggleClass('active');
					element.toggleClass('right');
				}

			});

			$scope.$watch($attrs.ngDisabled, function(value) {
				enableToggleButton = !(value && value == true);
			});

			$element.on("click", function(event) {

				if (enableToggleButton && enableToggleButton === true) {
					buttonClicked = true;
					element.find('span').toggleClass('active');
					element.toggleClass('right');
					$scope.$apply(function() {
						ngModel.$setViewValue(firstButton.hasClass('active') ? options[0] : options[1]);
					});

					var wizard = WizardHandler.wizard();
					$rootScope.$broadcast("toggleButtonEvent : clicked", event);
					buttonClicked = false;
				}
			});

		}
	};

});

