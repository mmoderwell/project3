const census = require('citysdk');
const { parse } = require('json2csv');
const fs = require('fs');

census({
		"vintage": 2017, // required
		"geoHierarchy": { // required  
			// "state": "*",
			"county": "*"
			// "zip code tabulation area": "*"
		},
		"sourcePath": ["acs", "acs5", "subject"], // required 
		"values": ["S0101_C01_001E", "S1901_C01_012E"] // required 
	},
	(err, res) => {
		console.log(res)
		try {
			const csv = parse(res);
			fs.writeFile("county_data.csv", csv, (err) => {
				if (err) {
					return console.log(err);
				} else {
					console.log("Wrote data to file");
				}
			});
		} catch (err) {
			console.error(err);
		}
	}
)