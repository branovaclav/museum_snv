module.exports = {
	maps: {
		regions: {
			title: { sk: 'Oblasti', en: 'Regions' },
			subtitle: { sk: 'Geomorfologické členenie', en: 'Geomorphological Division' },
			layers: [],
			groups: [ 'flora', 'earth' ]
		},
		landscape: {
			title: { sk: 'Reliéf', en: 'Landscape' },
			subtitle: { sk: 'Fyzicko-geografická mapa', en: 'Physical-Topographical Map' },
			layers: [],
			groups: [ 'flora', 'fauna' ]
		},
		reserves: {
			title: { sk: 'Príroda', en: 'Natural Reserves' },
			subtitle: { sk: 'Mapa chránených území a biotopov', en: 'Map of Natural Reserves and Habitats' },
			layers: [],
			groups: [ 'flora', 'fauna', 'waters' ]
		},
		waters: {
			title: { sk: 'Vodstvo', en: 'Waters' },
			subtitle: { sk: 'Vodstvo a minerálne pramene', en: 'Water and Mineral Springs' },
			layers: [],
			groups: [ 'waters', 'earth' ]
		},
		geology: {
			title: { sk: 'Zem', en: 'Geology' },
			subtitle: { sk: 'Geologická mapa', en: 'Geological Map' },
			layers: [],
			groups: [ 'earth' ]
		}
	},

	groups: {
		flora: {
			title: { sk: 'Flora', en: 'Flora' },
		},
		fauna: {
			title: { sk: 'Fauna', en: 'Fauna' },
		},
		waters: {
			title: { sk: 'Vodstvo', en: 'Waters' },
		},
		earth: {
			title: { sk: 'Zem', en: 'Earth' },
		}
	}
};
