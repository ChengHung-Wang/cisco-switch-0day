app.filter('trim', function () {
	return function (value) {
		return (!value) ? '' : value.replace(/ /g, '');
	};
});