const container = document.querySelector('container');
let width = 600
let height = 400
const margin = ({ top: 40, right: 40, bottom: 40, left: 40 });


// Data and color scale
let data = d3.map();
let data_array = [];
let data_obj = {}
let geo;

let map_svg;
let scatter_svg;


let promises = [];
promises.push(d3.json("http://localhost:2001/api/geo"));
promises.push(d3.csv("http://localhost:2001/api/data", (d) => {
	let fips = String(d.state) + String(d.county);
	let data = {
		population: +d.S0101_C01_001E,
		income: +d.S1901_C01_012E,
		filtered: false,
		median_commute: d.S0801_C01_046E,
		percent_no_computer: d.S2801_C02_011E,
		unemployment_rate: d.S2301_C04_001E,
		fips: fips
	};
	data_obj[fips] = data;
	data_array.push(data);
}));

function colorize(min, max, value) {
	let bins = 5;
	let increment = (max - min) / bins;

	if (value <= min + increment) { return '#eff3ff' } // includes lower outliers
	if (value <= min + (increment * 2)) { return '#bdd7e7' }
	if (value <= min + (increment * 3)) { return '#6baed6' }
	if (value <= min + (increment * 4)) { return '#3182bd' }
	if (value <= min + (increment * 5) || value >= max) { return '#08519c' } // also captures outliers
}

function map() {

	let path = d3.geoPath();
	// D3 Projection
	let projection = d3.geoAlbersUsa()
		.translate([width / 2, height / 2])
		.scale([600]); // scale things down

	map_svg = d3.select('#chloropleth')
		.append('svg')
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 600 400")
		.classed("svg-content-responsive", true)
		.attr("preserveAspectRatio", "xMinYMin meet")
		.classed("svg_content", true)
		// .attr('width', width + margin.left + margin.right)
		// .attr('height', height + margin.top + margin.bottom)
		.append('g');
	// .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	// Draw the map
	map_svg.append("g")
		.selectAll("path")
		.data(geo.features)
		.enter()
		.append("path")
		// draw each country
		.attr("d", d3.geoPath()
			.projection(projection)
		)
		// // set the color of each county
		.attr("fill", (d) => {
			let fips = String(d.properties.STATEFP) + String(d.properties.COUNTYFP);
			return colorize(0, 60, data_obj[fips].median_commute);
		})
		.style("stroke", "white")
		.style("stroke-width", 0.5)
		.attr("class", d => "county")
		.style("opacity", .8);
}


function scatterplot() {
	let height = 400;
	let width = 600;

	let x = d3.scaleLinear()
		.domain(d3.extent(data_array, d => d.population))
		.range([margin.left, width - margin.right]);

	let y = d3.scaleLinear()
		.domain(d3.extent(data_array, d => d.income)).nice()
		.range([height - margin.bottom, margin.top]);

	let xAxis = g => g
		.attr("transform", `translate(0, ${height - margin.bottom})`)
		.call(d3.axisBottom(x))
		.call(g => g.select(".domain").remove())
		.call(g => g.append("text")
			.attr("x", width - margin.right)
			.attr("y", -4)
			.attr("fill", "#000")
			.attr("font-weight", "bold")
			.attr("text-anchor", "end")
			.text("Population"));

	let yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
			.attr("y", -20)
			.attr("text-anchor", "start")
			.attr("font-weight", "bold")
			.text("Income"));

	scatter_svg = d3.select('#scatterplot')
		.append('svg')
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 600 400")
		.classed("svg-content-responsive", true)
		.attr("preserveAspectRatio", "xMinYMin meet")
		.classed("svg_content", true)
		// .attr('width', width + margin.left + margin.right)
		// .attr('height', height + margin.top + margin.bottom)
		.append('g');
	// .attr('transform', `translate(${margin.left}, ${margin.top})`);


	const brush = d3.brush()
		.on("start brush end", brushed);

	scatter_svg.append("g")
		.call(xAxis);

	scatter_svg.append("g")
		.call(yAxis);

	const dot = scatter_svg.append("g")
		.attr("fill", "steelblue")
		.attr("stroke-width", 1)
		.selectAll("g")
		.data(data_array)
		.join("circle")
		.attr("transform", d => `translate(${x(d.population)},${y(d.income)})`)
		.attr("r", 2.5)
		.attr("fill-opacity", 0.5);

	scatter_svg.call(brush);

	function brushed() {

		if (d3.event.selection) {
			const [
				[x0, y0],
				[x1, y1]
			] = d3.event.selection;

			let clearing = false;
			// if the brush doesn't contain anything, reset the filtered
			if (x0 === x1 || y0 === y1) {
				clearing = true;
			}

			data_array.forEach((d, i) => {
				let val = x0 <= x(d.population) && x(d.population) < x1 && y0 <= y(d.income) && y(d.income) < y1;
				// if there was no selection, reset and show all
				if (clearing) {
					data_obj[d.fips].filtered = false;
					return;
				}
				if (val) {
					data_obj[d.fips].filtered = false;
				} else {
					data_obj[d.fips].filtered = true;
				}
			});
		}
		// show on the map the selected counties
		map_svg.selectAll('path')
			.data(geo.features)
			.style('fill', (d) => {
				let fips = String(d.properties.STATEFP) + String(d.properties.COUNTYFP);
				let { filtered, population } = data_obj[fips];
				return filtered ? '#EEEEEE' : colorize(0, 1000000, population);
				// return filtered ? '#EEEEEE' : '#CD6F6F';
			});

		scatter_svg.selectAll('circle')
			.data(data_array)
			.style('fill', d => { return d.filtered ? 'steelblue' : '#A54132' });

	}
}

// pull in all the data and draw it
Promise.all(promises).then(function (values) {
	// console.log(values);
	geo = values[0];
	map();
	scatterplot();
});