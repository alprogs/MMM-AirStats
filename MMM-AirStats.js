Module.register("MMM-AirStats", {
	// defualt module config 
	defaults: {
		updateInterval: 1, // UNIT: seconds
	},
	
	// style
	getStyles: function() {
		return ['MMM-AirStats.css'];
	},

	// define sstart sequence 
	start: function() {
		Log.info("Starting module: "+ this.name);

		this.loaded 		= false;
		this.pm1_0			= "-"; 
		this.pm2_5			= "-"; 
		this.pm10_0			= "-"; 
		this.formaldehyde	= "-"; 
		this.temperature 	= "-"; 
		this.humidity		= "-"; 
		this.temperature2 	= "-"; 
		this.co2 			= "-"; 

		this.update();
		setInterval(
			this.update.bind( this ),
			this.config.updateInterval * 1000
		);
	},

	update: function() {
		this.sendSocketNotification("REQUEST", this.config);
	},

	addAirStatComponent: function(koTitle, enLeft, enRight, value) {
		var divTempRoot 	= document.createElement( (enLeft !== "CO²") ? "p" : "div" );
		divTempRoot.className 	= "MMM-AIRSTAT_COMPONENT_P";

		var divTempKoTitle 	= document.createElement("div");
		divTempKoTitle.innerHTML 	= koTitle;
		divTempKoTitle.className 	= "MMM-AIRSTAT_COMPONENT_TITLE";
		divTempRoot.appendChild( divTempKoTitle );

		var divTempEnTitle 	= document.createElement("div");
		divTempEnTitle.className 	= "MMM-AIRSTAT_COMPONENT_SUB_TITLE";
		var divTempEnLeft 	= document.createElement("div");
		divTempEnLeft.innerHTML 	= enLeft;
		divTempEnLeft.className 	= "MMM-AIRSTAT_COMPONENT_SUB_TITLE_LEFT";

		var divTempEnRight 	= document.createElement("div");
		divTempEnRight.innerHTML 	= enRight;
		divTempEnRight.className 	= "MMM-AIRSTAT_COMPONENT_SUB_TITLE_RIGHT";
		divTempEnTitle.appendChild( divTempEnLeft );
		divTempEnTitle.appendChild( divTempEnRight );
		divTempRoot.appendChild( divTempEnTitle );

		var fineDustType 	= ["PM 1.0", "PM 2.5", "PM 10.0"];
		var divTempData 	= document.createElement("div");
		divTempData.innerHTML 	= value;
		divTempData.className	= "MMM-AIRSTAT_COMPONENT_DATA";
		if (fineDustType.includes( enLeft )) {
			divTempData.className 	+= this.getFineDustLevelClass( enLeft, value );
		} else if ( "CO²" === enLeft ) {
			divTempData.className 	+= this.getCo2LevelClass( value );
		}
		divTempRoot.appendChild( divTempData );

		return divTempRoot; //wrapper.appendChild( divTempRoot );
	},

	getFineDustLevelClass: function(size, value) {
		if ("PM 1.0" === size || "PM 2.5" === size) {
			if ( value <= 15 ) {
				return (" FIND_DUST_GOOD");
			} else if ( 16 <= value  && value <= 25 ) {
				return (" FIND_DUST_NORMAL");
			} else if ( 26 <= value  && value <= 50 ) {
				return (" FIND_DUST_BAD");
			} else if ( 51 <= value ) {
				return (" FIND_DUST_VERY_BAD");
			}
		} else if ("PM 10.0" === size) {
			if ( value <= 30 ) {
				return (" FIND_DUST_GOOD");
			} else if ( 31 <= value  && value <= 50 ) {
				return (" FIND_DUST_NORMAL");
			} else if ( 51 <= value  && value <= 100 ) {
				return (" FIND_DUST_BAD");
			} else if ( 101 <= value ) {
				return (" FIND_DUST_VERY_BAD");
			}
		}
	},

	getCo2LevelClass: function(value) {
		if ( value <= 700 ) {
			return " CO2_GOOD";
		} else if ( 701 <= value  && value <= 1000 ) {
			return " CO2_NORMAL";
		} else if ( 1001 <= value  && value <= 2000 ) {
			return " CO2_BAD";
		} else if ( 2001 <= value ) {
			return " CO2_VERY_BAD";
		}
	},

	// Override dom generator
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "bright light big";

		if (!this.loaded) {
			wrapper.innerHTML = "Loading ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

	
		var divTempRoot 	= this.addAirStatComponent("온도", "TEMPERATURE&nbsp;&nbsp;&nbsp;&nbsp;", " ℃", this.temperature);
		wrapper.appendChild( divTempRoot );

		var divHumRoot 	= this.addAirStatComponent("습도", "HUMIDITY", "%", this.humidity);
		wrapper.appendChild( divHumRoot );

		var divPm1_0Root 	= this.addAirStatComponent("초미세먼지", "PM 1.0", "μg/m³", this.pm1_0);
		wrapper.appendChild( divPm1_0Root );

		var divPm2_5Root 	= this.addAirStatComponent("미세먼지", "PM 2.5", "μg/m³", this.pm2_5);
		wrapper.appendChild( divPm2_5Root );

		var divPm10_0Root 	= this.addAirStatComponent("부유먼지", "PM 10.0", "μg/m³", this.pm10_0);
		wrapper.appendChild( divPm10_0Root );

		// mg/㎥ = ppm x [분자량 ÷ 22.4]
		// 포름알데히드 분자량: 30
		var divFormaldehydeRoot 	= this.addAirStatComponent("포름알데히드", "CH2O", "mg/m³", this.formaldehyde);
		wrapper.appendChild( divFormaldehydeRoot );

		var divCo2Root 	= this.addAirStatComponent("이산화탄소", "CO²", "ppm", this.co2);
		wrapper.appendChild( divCo2Root );

		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === 'DATA') {
			this.pm1_0			= payload.pm1_0; 
			this.pm2_5			= payload.pm2_5; 
			this.pm10_0			= payload.pm10_0; 
			this.formaldehyde	= payload.formaldehyde; 
			this.temperature 	= payload.temperature; 
			this.humidity		= payload.humidity; 
			this.temperature2	= payload.temperature2; 
			this.co2			= payload.co2; 

			this.loaded = true;
			this.updateDom();
		}
	},
});

