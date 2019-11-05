// The svg
var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
// D3 Projection
var projection = d3.geoAlbersUsa()
	.translate([width / 2, height / 2]) // translate to center of screen
	.scale([1000]); // scale things down so see entire US

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
	.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
	.range(d3.schemeBlues[7]);


let promises = [];
promises.push(d3.json("http://localhost:2000/counties"));
// promises.push(d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"));


Promise.all(promises).then(function (values) {
	console.log(values);
	ready(null, values[0]);
});

function ready(error, geo) {

	let mouseOver = function (d) {
		d3.selectAll(".Country")
			.transition()
			.duration(200)
			.style("opacity", .5)
		d3.select(this)
			.transition()
			.duration(200)
			.style("opacity", 1)
			.style("stroke", "black")
	}

	let mouseLeave = function (d) {
		d3.selectAll(".Country")
			.transition()
			.duration(200)
			.style("opacity", .8)
		d3.select(this)
			.transition()
			.duration(200)
			.style("stroke", "transparent")
	}

	// Draw the map
	svg.append("g")
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
			return "#ADB7C7";
		})
		.style("stroke", "white")
		.style("stroke-width", 0.5)
		.attr("class", function (d) { return "county" })
		.style("opacity", .8)
	// .on("mouseover", mouseOver)
	// .on("mouseleave", mouseLeave)
}