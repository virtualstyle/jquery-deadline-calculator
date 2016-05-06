define(['jquery', 'alertify', 'deadlineCalculator', 'jqueryui', 'date'], function($, alertify) {
	
	$( document ).ready(function() {
		
		$('#startDate').val($.datepicker.formatDate('yy-mm-dd', new Date())).datepicker({dateFormat: "yy-mm-dd", defaultDate:0});
		
		$('#calculateDeadline').on('click', function(e){
			
			var days = $('#days').val();
			var years = $('#years').val();
			var startDate = $('#startDate').val();
			var dayType = 'calendarDays';
			var day = 'followingDay';
			if($('input[name=dayType]:checked').val() == 'businessDays') dayType = 'businessDays';
			if($('input[name=day]:checked').val() == 'precedingDay') day = 'precedingDay';
			
			if((days == "" || days == 0) && (years == "" || years == 0)) 
			{
				alertify.alert('No days or years entered!');
				return false;
			}
			
			if(startDate == "") 
			{
				alertify.alert('No start date entered!');
				return false;
			}
			
			if((years < 0 && days > 0) || (years > 0 && days < 0))
			{
				alertify.alert('Years and days must both be positive or both negative (or one must equal zero)!');
				return false;
			}
			
			if(years != 0 && dayType == 'businessDays')
			{
				alertify.alert('Years are ignored when using business days.');
				$('#years').val(0);
			}
							
			if(typeof $('#deadline-calculator').deadlineCalculator('instance') != 'undefined') 
			{
				$("#deadline-calculator").deadlineCalculator("destroy");
			}
			var opts = {days:days, years:years, startDate:startDate, dayType:dayType, day:day};
			var calc = $('#deadline-calculator').deadlineCalculator(opts);
			
			calc.deadlineCalculator('getDeadline');				
			alertify.alert(calc.deadlineCalculator('getFormattedOutput'));
			
		});
		
	});

		
});