const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
// app.use(express.static('data'));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.header("Access-Control-Allow-Methods", "GET,POST");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

app.get('/flowers', (req, res, next) => {
	// res.sendFile('flowers.csv');
	let file_path = path.join(__dirname, '/data', 'flowers.csv');
	const contents = fs.readFileSync(file_path, 'utf8');
	res.send(contents);
});

app.get('/names', (req, res, next) => {
	// res.sendFile('flowers.csv');
	let file_path = path.join(__dirname, '/data', 'names.csv');
	const contents = fs.readFileSync(file_path, 'utf8');
	res.send(contents);
});

app.listen(2000, () => {
	console.log('Web server running on port 2000.');
});