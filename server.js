const express = require('express');
const parser = require('body-parser');
const loki = require('lokijs');
const fs = require('fs');
const path = require('path')
const locales = require('./locales');
const constants = require('./data/const');

const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

const root = __dirname;
const imgpath = path.join(root, 'data', 'images');

let lang = 'sk';
let data = {};

let abcsort = (a, b) => {
	a = a.title[lang]; b = b.title[lang];
	return a < b ? -1 : (a > b ? 1 : 0);
};

const db = new loki('data/db.js', {
	autoload: true,
	autoloadCallback: () => {
		['pois', 'articles'].forEach(collection => {
			let dbcoll = db.getCollection(collection);
			data[collection] = {
				collection: dbcoll,
				all: dbcoll.data
			};
		});

		data.pois.sorted = data.pois.collection.chain().sort(abcsort).data();
		data.pois.all.forEach(poi => {
			try { poi.files = fs.readdirSync(path.join(imgpath, poi.folder)).filter(file => fs.lstatSync(path.join(imgpath, poi.folder, file)).isFile()).map(file => path.join(poi.folder, file)); }
			catch (err) { poi.files = []; }
		});
	}
});

app.use(express.static(root));
app.use(parser.json());
app.set('view engine', 'ejs');

//app
app.get('/', (req, res) => {
	res.render('index.ejs', { pois: data.pois.sorted, maps: constants.maps, groups: constants.groups, regions: constants.regions, articles: data.articles.all, locale: locales[lang], lang });
});

app.get('/lang/:lang', (req, res) => {
	lang = req.params.lang;
	data.pois.sorted = data.pois.collection.chain().sort(abcsort).data();
	res.redirect('/');
});

//admin
app.get('/admin', (req, res) => {
	res.render('admin.ejs', { pois: data.pois.all, articles: data.articles.all, groups: constants.groups, regions: constants.regions });
});

app.post('/admin/:collection', (req, res) => {
	let collection = req.params.collection;
	res.send( data[ collection ].collection.insert(req.body.data) );
	db.saveDatabase('db');
});

app.put('/admin/:collection', (req, res) => {
	let collection = req.params.collection;
	let doc = data[ collection ].collection.get(req.body.id);
	Object.assign(doc, req.body.data);
	res.send( data[ collection ].collection.update(doc) );
	db.saveDatabase('db');
});

app.delete('/admin/:collection', (req, res) => {
	let collection = req.params.collection;
	res.send( data[ collection ].collection.remove(data[ collection ].collection.get(req.body.id)) );
	db.saveDatabase('db');
});

//server
app.listen(port, host, () => {
	console.log('Server started on localhost:3000');
	console.log('Press Ctrl+C to exit...');
});





//seed
app.get('/seed', (req, res) => {
	/*
	db.removeCollection('pois');
	db.addCollection('pois').insert([
		{
			position: { left: 400, top: 400 },
			title: { sk: 'Nadpis 1', en: 'Headline 1' },
			description: { sk: 'Popis 1', en: 'Description 2'},
			group: 'flora',
			region: 'vt',
			folder: 'vt_001'
		},
		{
			position: { left: 600, top: 600 },
			title: { sk: 'Nadpis 2', en: 'Headline 2' },
			description: { sk: 'Popis 2', en: 'Description 2'},
			group: 'fauna',
			region: 'nt',
			folder: 'nt_001'
		}
	]);
	*/
	db.removeCollection('articles');
	db.addCollection('articles');
/*	db.addCollection('articles');.insert([
		{
			title: { sk: 'Fauna Spiša', en: 'Spis Fauna' },
			description: { sk: '', en: '' },
			group: 'fauna',
			region: ''
		},
		{
			title: { sk: 'Chránené územia Vysokých Tatier', en: 'Vysoke Tatry Natural Reserves' },
			description: { sk: '', en: '' },
			group: 'reserves',
			region: 'vysoke_tatry'
		}
	]);
*/
	db.saveDatabase('db');
	res.redirect('/admin')
});
