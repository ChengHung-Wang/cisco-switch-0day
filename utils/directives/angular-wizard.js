/**
 Description: Angular Wizard Directive
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */

angular.module('angular-wizard', []);
angular.module('angular-wizard').directive('wizardStep', function(onlineHelpService) {
	return {
		restrict : 'EA',
		replace : true,
		transclude : true,
		scope : {
			wzTitle : '@',
			title : '@',
			finish : '@',
			nextLabel : '@',
			prevLabel : '@',
			templatePath : '@',
			stepNumber : '@',
			conditionalStepNumber : '@'
		},
		require : '^wizard',
		template : function(element, attributes) {
			return '<div ng-show=\"selected\" class=\"centerpanel-container\" ng-class=\"{current: selected, done: completed}\">' + '<div class=\"webui-centerpanel\">' + '<div class=\"main-wizard-header\">' + '<i class=\"icon-question\" ng-click=\"openOnlineHelpWindow()\" /></i>' + '<div class=\"main-wizard-title\">QUICK SETUP</div>' + '<div class=\"wizard-step-title\">{{title}}</div>' + '</div>' + '<hr>' + '<section ng-show=\"selected\" ng-class=\"{current: selected, done: completed}\" class=\"step\">' + '   <ng-include src=\"templatePath\"></ng-include>' + '</section>' + '</div>' + '</div>';
		},
		link : function($scope, $element, $attrs, wizard) {
			$scope.openOnlineHelpWindow = function() {
				onlineHelpService.openOnlineHelpWindow("/dayzero");
			};
			$scope.title = $scope.title || $scope.wzTitle;
			wizard.addStep($scope);
		}
	};
});

angular.module('angular-wizard').directive('wizard', function() {
	return {
		restrict : 'EA',
		replace : true,
		transclude : true,
		scope : {
			currentStep : '=',
			onFinish : '&',
			hideIndicators : '=',
			editMode : '=',
			name : '@'
		},
		template : function(element, attributes) {
			//return attributes.template || "common/directives/wizard/wizard.html";
			return '<div class=\"steps\">' + '<div style=\"display: inline-block;\">' + '<div ng-transclude></div>' + '<div class=\"wizard-buttons clearfix\">' + '<div wz-previous class=\"btn btn-primary left-button \" ng-if=\"selectedStep.prevLabel!=undefined\"><i class=\"icon-arrow-right\"></i>{{selectedStep.prevLabel}}</div>' + '<div wz-next=\"$parent.getData($parent.wzModel,\'{{finish}}\',{{selectedStep.stepNumber}})\" class=\"btn btn-primary right-button \">{{selectedStep.nextLabel}}<i class=\"icon-arrow-right\"></i></div>' + '<ul class=\"steps-indicator steps-{{steps.length}}\" ng-if=\"!hideIndicators\">' + '<li ng-class=\"{default: !step.completed && !step.selected, current: step.selected && !step.completed, done: step.completed && !step.selected, editing: step.selected && step.completed}\" ng-repeat=\"step in steps\" ng-if=\"step.showIndicator\">' + '<a></a>' +
			// '<a ng-click=\"goTo(step)\">{{step.title || step.wzTitle}}</a>' +
			'</li>' + '</ul>' + '</div>' + '</div>' + '</div>';
		},
		controller : ['$scope', '$element', '$rootScope', 'wizardPathService', 'WizardHandler', 'validationService',
		function($scope, $element, $rootScope, wizardPathService, WizardHandler, validationService) {

			//Json holder for the wz-step HTML scope elements
			var isLastStep = false;
			WizardHandler.addWizard($scope.name || WizardHandler.defaultName, this);
			$scope.$on('$destroy', function() {
				WizardHandler.removeWizard($scope.name || WizardHandler.defaultName);
			});

			$scope.steps = [];

			$scope.$watch('currentStep', function(step) {
				if (!step)
					return;
				var stepTitle = $scope.selectedStep.title || $scope.selectedStep.wzTitle;
				if ($scope.selectedStep && stepTitle !== $scope.currentStep) {
					$scope.goTo(_.findWhere($scope.steps, {
						title : $scope.currentStep
					}));
				}

			});

			$scope.$watch('[editMode, steps.length]', function() {
				var editMode = $scope.editMode;
				if (_.isUndefined(editMode) || _.isNull(editMode))
					return;

				if (editMode) {
					_.each($scope.steps, function(step) {
						step.completed = true;
					});
				}
			}, true);

			this.addStep = function(step) {
				//pushing next and previous labels inside the arrays
				wizardPathService.pushLabels(step.prevLabel, step.nextLabel);
				step.showIndicator = true;
				$scope.steps.push(step);
				if ($scope.steps.length === 1) {
					$scope.goTo($scope.steps[0]);
				}
			};

			$scope.goTo = function(step) {
				unselectAll();
				$scope.selectedStep = step;
				if (!_.isUndefined($scope.currentStep)) {
					$scope.currentStep = step.title || step.wzTitle;
				}
				step.selected = true;
				$scope.$emit('wizard:stepChanged', {
					step : step,
					index : _.indexOf($scope.steps, step)
				});
			};

			$scope.currentStepNumber = function() {
				return _.indexOf($scope.steps, $scope.selectedStep) + 1;
			}
			function unselectAll() {
				_.each($scope.steps, function(step) {
					step.selected = false;
				});
				$scope.selectedStep = null;
			}


			this.next = function(draft) {

				var index = _.indexOf($scope.steps, $scope.selectedStep);
				var validator = validationService.getValidator(index);

				var result = _.isUndefined(validator) ? true : validator.validate();

				if (result) {

					if (!draft) {
						$scope.selectedStep.completed = true;

						if (index === $scope.steps.length - 1) {
							isLastStep = true;
							this.finish();
						} else {
							if (wizardPathService.getConditionSatisfied(index)) {
								$scope.goTo($scope.steps[$scope.steps[index].conditionalStepNumber - 1]);
							} else {
								($scope.selectedStep.next === "last") ? this.finish() : _.isUndefined($scope.selectedStep.next) ? $scope.goTo($scope.steps[index + 1]) : $scope.goTo($scope.steps[$scope.selectedStep.next]);
							}

						}
					}
				}
			};

			this.goTo = function(step) {
				var stepTo;
				if (_.isNumber(step)) {
					stepTo = $scope.steps[step];
				} else {
					stepTo = _.findWhere($scope.steps, {
						title : step
					});
				}
				$scope.goTo(stepTo);
			};

			this.finish = function() {

				var index = _.indexOf($scope.steps, $scope.selectedStep);
				var validator = validationService.getValidator(index);

				var result = _.isUndefined(validator) ? true : validator.validate();
				if (result) {

					console.log($scope.onFinish);

					if ($scope.onFinish) {
						$scope.onFinish();

					}
				}
			};

			this.cancel = this.previous = function() {
				var index = _.indexOf($scope.steps, $scope.selectedStep);
				if (index === 0) {
					throw new Error("Can't go back. It's already in step 0");
				} else {
					var previousStepNumber = $scope.steps[$scope.currentStepNumber() - 1].previousStepNumber;
					previousStepNumber = _.isUndefined(previousStepNumber) ? index - 1 : previousStepNumber;
					$scope.goTo($scope.steps[previousStepNumber]);

				}
			};

			this.islaststep = function() {
				var index = _.indexOf($scope.steps, $scope.selectedStep);
				if (index === $scope.steps.length - 1) {
					return true;
				} else {
					return false;
				}
			};

			//this method returns the current step
			this.getStep = function(stepNumber) {
				stepNumber = _.isUndefined(stepNumber) ? $scope.currentStepNumber() : stepNumber;
				return $scope.steps[stepNumber - 1];
			};

			//this method sets the next Label of the wizard step
			this.setNextLabel = function(stepNumber, label) {
				$scope.steps[stepNumber - 1].nextLabel = label;
			};

			//this method sets the previous Label of the wizard step
			this.setPrevLabel = function(stepNumber, label) {
				$scope.steps[stepNumber - 1].prevLabel = label;
			};
			//this method is used to solve the path divergence in the wizard
			this.setPreviousStepNumber = function(nextStepNumber, prevStepNumber) {
				var previousStepNumber = _.isUndefined(prevStepNumber) ? $scope.currentStepNumber() : prevStepNumber;

				//setting up the previous step number of the next step we are going so when previous button is clicked it
				//should go to the step from where it is arrived
				$scope.steps[nextStepNumber - 1].previousStepNumber = previousStepNumber - 1;
			};

			//sets all steps to pristine declarative config
			this.setStepDefaults = function(skipSteps) {
				if (skipSteps === undefined || _.isEmpty(skipSteps)) {
					skipSteps = -1;
				} else if (!_.isArray(skipSteps)) {
					skipSteps = [skipSteps];
				}
				for (var n = 0; n < ($scope.steps.length); n++) {
					if (!_.contains(skipSteps, n)) {
						$scope.steps[n].prevLabel = wizardPathService.getDefaultPrevLabel(n + 1);
						$scope.steps[n].nextLabel = wizardPathService.getDefaultNextLabel(n + 1);
						$scope.steps[n].next = $scope.steps[n].previousStepNumber = undefined;
						$scope.steps[n].showIndicator = true;
					}
				}
			};
		}]

	};
});

function wizardButtonDirective(action) {
	angular.module('angular-wizard').directive(action, function() {
		return {
			restrict : 'A',
			replace : false,
			require : '^wizard',
			link : function($scope, $element, $attrs, wizard) {

				$element.on("click", function(e) {
					e.preventDefault();
					$scope.$apply(function() {
						$scope.$eval($attrs[action]);
						if (action === "wzNext" && wizard.islaststep()) {
							wizard.finish();
						} else {
							wizard[action.replace("wz", "").toLowerCase()]();
						}
					});
				});
			}
		};
	});
}

wizardButtonDirective('wzNext');
wizardButtonDirective('wzPrevious');
wizardButtonDirective('wzFinish');
wizardButtonDirective('wzCancel');

angular.module('angular-wizard').factory('WizardHandler', function() {
	var service = {};

	var wizards = {};

	service.defaultName = "defaultWizard";

	service.addWizard = function(name, wizard) {
		wizards[name] = wizard;
	};

	service.removeWizard = function(name) {
		delete wizards[name];
	};

	service.wizard = function(name) {
		var nameToUse = name;
		if (!name) {
			nameToUse = service.defaultName;
		}

		return wizards[nameToUse];
	};

	return service;
});

angular.module('angular-wizard').factory("wizardPathService", function() {
	var stepNumber = 0;
	var wizardStepsPreviousLabels = [];
	var wizardStepsNextLabels = [];
	var conditionSatisfied = [];
	return {

		getConditionSatisfied : function(index) {
			return (_.isUndefined(conditionSatisfied[index])) ? undefined : conditionSatisfied[index];
		},
		getDefaultNextLabel : function(stepNumber) {
			return wizardStepsNextLabels[stepNumber - 1];
		},
		getDefaultPrevLabel : function(stepNumber) {
			return wizardStepsPreviousLabels[stepNumber - 1];
		},
		pushLabels : function(prevLabel, nextLabel) {
			wizardStepsNextLabels[stepNumber] = nextLabel;
			wizardStepsPreviousLabels[stepNumber++] = prevLabel;
		}
	}
});
