require.config({
	baseUrl: 'js',
  // app entry point
  deps: ["main"],
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
		jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
		date: 'date',
		alertify: 'alertify.min',
		deadlineCalculator: 'jquery.deadlineCalculator'
	}
});