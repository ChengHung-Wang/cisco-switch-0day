app.directive('numCommaHyphenOnly', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {
			function fromUser(text) {
				if (text) {
					var transformedInput = text.replace(/[a-zA-Z!-+_^@=.??|;:<>\s/g{}_\s]/, '');
					if (transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}
					return transformedInput;
				}
				return undefined;
			}
			ngModelCtrl.$parsers.push(fromUser);
		}
	};
});
app.directive('alpaOnly', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {
			function fromUser(text) {
				if (text) {
					var transformedInput = text.replace(/[0-9!-+_=.??|;:,<>\s{}_\s-]/, '');
					if (transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}
					return transformedInput;
				}
				return undefined;
			}
			ngModelCtrl.$parsers.push(fromUser);
		}
	};
});
app.directive('numOnly', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {
			function fromUser(text) {
				if (text) {
					var transformedInput = text.replace(/[a-zA-Z!-+_=.?^@|;:,<>\s/g{}_\s-]/, '');
					if (transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}
					return transformedInput;
				}
				return undefined;
			}
			ngModelCtrl.$parsers.push(fromUser);
		}
	};
});
app.directive('alpaNumericHyphenOnly', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {
			function fromUser(text) {
				if (text) {
					var transformedInput = text.replace(/[!-+_=.??|;@^:,<>\s{}_\s]/, '');
					if (transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}
					return transformedInput;
				}
				return undefined;
			}
			ngModelCtrl.$parsers.push(fromUser);
		}
	};
});
app.directive('numericDotOnly', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {
			function fromUser(text) {
				if (text) {
					var transformedInput = text.replace(/[a-zA-Z!-+_=??|;@^:,<>\s/g{}_\s-]/, '');
					if (transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}
					return transformedInput;
				}
				return undefined;
			}
			ngModelCtrl.$parsers.push(fromUser);
		}
	};
});
app.directive('myCustomUrl', ['$http', '$compile',
	function($http, $compile) {
		var tpl = "wizard/views/custom.html";
		return {
			scope: true,
			link: function(scope, element, attrs){
				scope.myCustomUrl = attrs.myCustomUrl;
				$http.get(tpl)
					.then(function(response){
						element.html($compile(response.data)(scope));
					});
			}
		};
	}
]);
