define(['jquery', 'alertify', 'jqueryui', 'date'], function ($, alertify) {
	$.widget( "jquery.deadlineCalculator", {
	 
			options: {
					calendarDays: true,
					businessDays: false,
					followingDay: true,
					precedingDay: false
			},
			
			startDate: Date.today(),
			days: 0,
			years: 0,
			skippedDates: [],
			skippedDatesUnique: {},
			deadline: false,
	 
			_create: function() {
				
				if(this.options.dayType == 'businessDays') {
					this.calendarDays = false;
					this.businessDays = true;
				}
				else {
					this.calendarDays = true;
					this.businessDays = false;
				}
				
				if(this.options.day == 'precedingDay') {
					this.followingDay = false;
					this.precedingDay = true;
				}
				else {
					this.followingDay = true;
					this.precedingDay = false;
				}
				
				this.days = parseInt(this.options.days);
				this.years = parseInt(this.options.years);
				this.startDate = Date.parseExact(this.options.startDate, 'yyyy-MM-dd');
				this.skippedDates = [];
				this.skippedDatesUnique = {};
				this.dayCounts = [];
				
			},
			
			_isMlkDay: function()
			{
				var testdate = Date.today().set({year:this.deadline.getFullYear(),month:0}).third().monday();
				return Date.equals(this.deadline, testdate);
			},
			
			_isPresDay: function()
			{
				var testdate = Date.today().set({year:this.deadline.getFullYear(),month:1}).third().monday();
				return Date.equals(this.deadline, testdate);
			},		
			
			_isMemDay: function()
			{
				var testdate = Date.today().set({year:this.deadline.getFullYear(),month:4}).final().monday();
				return Date.equals(this.deadline, testdate);
			},
			
			_isLabDay: function()
			{
				var testdate = Date.today().set({year:this.deadline.getFullYear(),month:8}).first().monday();
				return Date.equals(this.deadline, testdate);
			},	
			
			_isColDay: function()
			{
				var testdate = Date.today().set({year:this.deadline.getFullYear(),month:9}).second().monday();
				return Date.equals(this.deadline, testdate);
			},	
			
			_isThxDay: function()
			{
				var testdate = Date.today().set({year:this.deadline.getFullYear(),month:10}).fourth().thursday();
				return Date.equals(this.deadline, testdate);
			},
			
			_isXmasDay: function()
			{
				return this._handleFixedDateHolidays(12, 25);			
			},
			
			_isIndDay: function()
			{
				return this._handleFixedDateHolidays(7, 4);
			},
			
			_isVetsDay: function()
			{
				return this._handleFixedDateHolidays(11, 11);
			},
			
			_isNewDay: function()
			{
				return this._handleFixedDateHolidays(1, 1);
			},
			
			_handleFixedDateHolidays: function(month, day)
			{
				adjmonth = month - 1;
				if(this.deadline.getMonth() == adjmonth)
				{
					if(this.deadline.getDate() == day) return true;
					else
					{
						var tempdate = Date.parseExact(this.deadline.getFullYear()+'-'+this._strPad(month, 2)+'-'+this._strPad(day, 2), 'yyyy-MM-dd');
						
						if(tempdate.getDay() == 0)
						{
							tempdate.add({days: 1});
							if(tempdate.getDate() == this.deadline.getDate()) return true;
						}		
						
						if(tempdate.getDay() == 6)
						{
							tempdate.add({days: -1});
							if(tempdate.getDate() == this.deadline.getDate()) return true;
						}							
					}
				}
				return false;
			},
			
			_checkHoliday: function()
			{
				if(this._isMlkDay()) return {result: true, reason: "Martin Luther King Jr. Day"};
				if(this._isPresDay()) return {result: true, reason: "President's Day"};
				if(this._isMemDay()) return {result: true, reason: "Memorial Day"};
				if(this._isLabDay()) return {result: true, reason: "Labor Day"};
				if(this._isColDay()) return {result: true, reason: "Columbus Day"};
				if(this._isThxDay()) return {result: true, reason: "Thanksgiving Day"};
				if(this._isXmasDay()) return {result: true, reason: "Christmas Day"};
				if(this._isIndDay()) return {result: true, reason: "Independence Day"};
				if(this._isVetsDay()) return {result: true, reason: "Veteran's Day"};
				if(this._isNewDay()) return {result: true, reason: "New Years Day"};
				return {result: false};
			},
			
			_checkBusinessDay: function()
			{
				if(this.deadline.getDay() == 0)
				{
					this.deadline.isNotBusinessDay = true;
					if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
					{
						this.skippedDates.push({reason: 'Sunday', date: this.deadline.toString('yyyy-MM-dd')});
						this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
					}
					return {result: true, reason: "Sunday"};
				}
				if(this.deadline.getDay() == 6)
				{
					this.deadline.isNotBusinessDay = true;
					if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
					{
						this.skippedDates.push({reason: 'Saturday', date: this.deadline.toString('yyyy-MM-dd')});
						this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
					}
					return {result: true, reason: "Saturday"};
				}
				var isHoliday = this._checkHoliday();
				if(isHoliday.result)
				{
					this.deadline.isNotBusinessDay = true;
					if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
					{
						this.skippedDates.push({reason: isHoliday.reason, date: this.deadline.toString('yyyy-MM-dd')});
						this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
					}
					return isHoliday;
				}
				this.deadline.isNotBusinessDay = false;
				return false;
			},
			
			_isLeapYear: function(year)
			{
				return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
			},
			
			_adjustDeadline: function(preceding)
			{
				var inc = 1;
				if(this.precedingDay) inc = -1;
				if(preceding) this.deadline.add({days: inc});
				this._checkBusinessDay();
				
				while(this.deadline.isNotBusinessDay)
				{
					if(this.deadline.getDay() == 0)
					{
						if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
						{
							this.skippedDates.push({reason: 'Sunday', date: this.deadline.toString('yyyy-MM-dd')});
							this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
						}
						this.deadline.add({days: inc});
					}
					
					if(this.deadline.getDay() == 6)
					{
						if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
						{
							this.skippedDates.push({reason: 'Saturday', date: this.deadline.toString('yyyy-MM-dd')});
							this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
						}
						this.deadline.add({days: inc});
						if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
						{
							this.skippedDates.push({reason: 'Sunday', date: this.deadline.toString('yyyy-MM-dd')});
							this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
						}
						this.deadline.add({days: inc});
					}
					
					isHoliday = this._checkHoliday()
					if(isHoliday.result)
					{
						if(typeof this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] == 'undefined')
						{
							this.skippedDates.push({reason: isHoliday.reason, date: this.deadline.toString('yyyy-MM-dd')});
							this.skippedDatesUnique[this.deadline.toString('yyyy-MM-dd')] = true;
						}
						this.deadline.add({days: inc});
					}
					this._checkBusinessDay();
				}
				
			},
			
			getDeadline: function()
			{
				this.deadline = new Date(this.startDate);
				
				if(this.calendarDays)
				{
					this.deadline.add({days: this.days, years: this.years});					
					this._adjustDeadline();
				}				
				else         
				{
					var inc = 1;
					if(this.days < 0 || this.years < 0) inc = -1;
					
					var businessDayCount = 0;
					var nonBusinessDayCount = 0;
					var totalDays = 0;
					
					while(businessDayCount < Math.abs(this.days))
					{
						 this.deadline.add({days: inc});
						 this._checkBusinessDay();
						 if(!this.deadline.isNotBusinessDay) businessDayCount++;
						 else nonBusinessDayCount++;
						 totalDays++;
					}
					
					if(this.precedingDay) this._adjustDeadline(true);
					this.dayCounts = [businessDayCount, nonBusinessDayCount, totalDays];

				}
			},
			
			getFormattedOutput: function(dayCounts)
			{
				var skipTable = $('<table id="skipTable" cellspacing="0" />');
				$.each(this.skippedDates, function(k,v){
					var row = $('<tr />');
					var cell = $('<td class="right" />');
					cell.text('Skipped ' + v.date);
					row.append(cell);
					cell = $('<td />');
					cell.text('(' + v.reason + ')');
					row.append(cell);
					skipTable.append(row);
				});
				
				var row = $('<tr />');
				var cell = $('<td id="deadlineCell" colspan="2" />');
				cell.text('Final Deadline: ' + this.deadline.toString('yyyy-MM-dd'));
				row.append(cell);
				skipTable.prepend(row);
				if(typeof dayCounts != 'undefined' && Object.prototype.toString.call(dayCounts) === '[object Array]')
				{
					row = $('<tr />');
					cell = $('<td id="dayCounts" colspan="2" />');
					cell.html('Business Days: ' + dayCounts[0] + '&nbsp;&nbsp;&nbsp;&nbsp;Non-Business Days: ' + dayCounts[1] + '&nbsp;&nbsp;&nbsp;&nbsp;Total Days: ' + dayCounts[2]);
					row.append(cell);
					skipTable.append(row);
				}
				
				return skipTable.wrap('<div/>').parent().html();
			},
			
			getRawOutput: function(dayCounts)
			{
				return {
					deadline: this.deadline,
					skippedDates: this.skippedDates,
					dayCounts: this.dayCounts
				};
				var skipTable = $('<table id="skipTable" cellspacing="0" />');
				$.each(this.skippedDates, function(k,v){
					var row = $('<tr />');
					var cell = $('<td class="right" />');
					cell.text('Skipped ' + v.date);
					row.append(cell);
					cell = $('<td />');
					cell.text('(' + v.reason + ')');
					row.append(cell);
					skipTable.append(row);
				});
				
				var row = $('<tr />');
				var cell = $('<td id="deadlineCell" colspan="2" />');
				cell.text('Final Deadline: ' + this.deadline.toString('yyyy-MM-dd'));
				row.append(cell);
				skipTable.prepend(row);
				if(typeof dayCounts != 'undefined' && Object.prototype.toString.call(dayCounts) === '[object Array]')
				{
					row = $('<tr />');
					cell = $('<td id="dayCounts" colspan="2" />');
					cell.html('Business Days: ' + dayCounts[0] + '&nbsp;&nbsp;&nbsp;&nbsp;Non-Business Days: ' + dayCounts[1] + '&nbsp;&nbsp;&nbsp;&nbsp;Total Days: ' + dayCounts[2]);
					row.append(cell);
					skipTable.append(row);
				}
				
				return skipTable.wrap('<div/>').parent().html();
			},
			
			_strPad: function(i,l,s) {
				var o = i.toString();
				if (!s) { s = '0'; }
				while (o.length < l) {
					o = s + o;
				}
				return o;
			},
			
			_destroy: function() {
				
			}
	 
	});
	
});