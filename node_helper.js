'use strict';

/* Magic Mirror
 * Module: MMM-AirStats
 *
 * By Brad Kim
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const exec = require('child_process').exec;

module.exports = NodeHelper.create({
	start: function () {
		console.log('[MMM-AirStats] MMM-AirStats helper started ...');
	},

	socketNotificationReceived: function(notification, payload) {
		const self = this;
		if (notification === 'REQUEST') {
			const self = this;
			this.config = payload;

			exec("java -jar ./modules/MMM-AirStats/pms5003st-tool.jar -ext.tool;sudo python3 -m mh_z19 --all", (error, stdout) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}

				console.log('[MMM-AirStats] ext.tool log: '+ stdout);
				var full_result = stdout.split("\n");
				var pms5003st 	= full_result[0].split(",");

				try {
					var mh_z19 		= JSON.parse(full_result[1]);
				} catch (e) {
					console.log("ERR: "+ e);
				}

				/* 
				 * SAMPLE
				 * PM  1.0(ATMO) : 4
				 * PM  2.5(ATMO) : 5
				 * PM 10.0(ATMO) : 5
				 * FORMALDEHYDE  : 0.001
				 * TEMPERATURE   : 24.4
				 * HUMIDITY      : 64.8
				 */

				self.sendSocketNotification('DATA', {
					pm1_0 		: pms5003st[0],
					pm2_5 		: pms5003st[1],
					pm10_0 		: pms5003st[2],
					formaldehyde: pms5003st[3],
					temperature : pms5003st[4],
					humidity 	: pms5003st[5],
					temperature2: mh_z19["temperature"],
					co2 		: mh_z19["co2"]
				});
			});
		}
	}
});

