const container = document.querySelector('container');
let width = 600
let height = 400
const margin = ({ top: 40, right: 40, bottom: 40, left: 40 });


// Data and color scale
let data = d3.map();
let data2 = [];

let map_svg;
let scatter_svg;

// let colorScale = d3.scaleThreshold()
// 	.domain([0, 100, 1000, 100000, 1000000])
// 	.range(d3.schemeBlues[5]);


let promises = [];
promises.push(d3.json("http://localhost:2000/geo"));
promises.push(d3.csv("http://localhost:2000/data", (d) => {
	let fips = String(d.state) + String(d.county);
	data.set(fips, { population: +d.population, income: +d.median_income });

	data2.push({ fips: fips, population: +d.population, income: +d.median_income })
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

function map(error, geo) {

	// Map and projection
	let path = d3.geoPath();
	// D3 Projection
	let projection = d3.geoAlbersUsa()
		.translate([width / 2, height / 2]) // translate to center of screen
		.scale([600]); // scale things down so see entire US

	// let max = d3.max(data);
	// let min = d3.min(data);

	// console.log(max, min)
	map_svg = d3.select('#chloropleth')
		.append('svg')
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 600 400")
		.classed("svg-content-responsive", true)
		.attr("preserveAspectRatio", "xMinYMin meet")
		.classed("svg_content", true)
		// .attr('width', width + margin.left + margin.right)
		// .attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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
		.attr("fill", function (d) {
			// d.total = data.get(d.id) || 0;
			let fips = String(d.properties.STATEFP) + String(d.properties.COUNTYFP);
			d.population = data.get(fips).population || 0;
			d.income = data.get(fips).income || 0;

			return colorize(0, 1500000, d.population);
			// return colorScale(d.population);
		})
		.style("stroke", "white")
		.style("stroke-width", 0.5)
		.attr("class", d => "county")
		.style("opacity", .8)
	// .on("mouseover", mouseOver)
	// .on("mouseleave", mouseLeave)
}


function scatterplot() {
	let height = 400;
	let width = 600;

	let x = d3.scaleLinear()
		.domain(d3.extent(data2, d => d.population)).nice()
		.range([margin.left, width - margin.right]);

	let y = d3.scaleLinear()
		.domain(d3.extent(data2, d => d.income)).nice()
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
			.text("Population"))

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
		.attr("opacity", 0.5)
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1)
		.selectAll("g")
		.data(data2)
		.join("circle")
		.attr("transform", d => `translate(${x(d.population)},${y(d.income)})`)
		.attr("r", 1.5);

	scatter_svg.call(brush);

	function brushed() {
		let value = [];
		if (d3.event.selection) {
			const [
				[x0, y0],
				[x1, y1]
			] = d3.event.selection;

			value = data2.filter((d, i) => {
				let val = x0 <= x(d.population) && x(d.population) < x1 && y0 <= y(d.income) && y(d.income) < y1;
				if (val) {
					data2[i].filtered = false;
				} else {
					data2[i].filtered = true;
				}
				return val;
			});
		}
		// show on the map the selected counties
		map_svg.selectAll('path')
			.data(data2)
			.style('fill', d => { return d.filtered ? '#EEEEEE' : colorize(0, 140000, d.income) })

	}
}

Promise.all(promises).then(function (values) {
	console.log(values);
	map(null, values[0]);
	scatterplot();
});