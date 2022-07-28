app.filter('trimValue', function () {
	return function (value) {
		return (!value) ? '' : value.replace(/\s/g, '');
	};
});


