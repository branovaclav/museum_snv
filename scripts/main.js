const imgpath = '/data/images';
const thumbpath = '/data/images/thumbnails';

let Component = class {
	constructor () {
		Component[ this.constructor.name.toLowerCase() ] = this;
	}

	toggle (state) {
		this.el.panel.toggleClass('hidden', !state);
	}
};

let Menu = class extends Component {
	constructor () {
		super();

		this.el = {
			panel: $('.menu'),
			items: $('.menu .item')
		};

		this.el.items.find('.title').each((i, item) => $(item).clone().addClass('colored').insertBefore(item));
		this.el.items.on('click', evt => this.select( $(evt.target).closest('[data-map]').data('map') ));
	}

	select (map) {
		let item = this.el.items.removeClass('selected').filter(`[data-map=${ map }]`).addClass('selected');
		Component.map.select(map);
		Component.groups.select(item.data('groups'));
	}
};

let Sidebar = class extends Component {
	constructor () {
		super();

		this.el = {
			panel: $('.sidebar'),
			back: $('.sidebar .back'),
			article: {
				headline: $('.sidebar .headline'),
				title: $('.sidebar .headline .title'),
				subtitle: $('.sidebar .headline .subtitle'),
				paragraph: $('.sidebar p')
			},
			regions: $('.sidebar .regions'),
			groups: $('.sidebar .groups'),
			points: $('.sidebar .pois')
		}

		this.el.back.on('click', () => Component.map.select());
	}

	article (map, region) {
		region = region || 'global';

		let art = this.el.article;
		art.headline.attr({ 'data-map': map });
		art.title.text( data.articles[ map ][ region ].title );
		art.subtitle.text( $(`.menu .item[data-map="${ map }"]`).find('.subtitle').text() );
		art.paragraph.text( data.articles[ map ][ region ].description );

		this.el.regions.toggleClass('hidden', region != 'global');
		this.el.groups.add(this.el.points).add(this.el.back).toggleClass('hidden', region == 'global');
	}
};

let Map = class extends Component {
	constructor () {
		super();
		let padding = 30; //viewport padding

		this.el = {
			panel: $('.map'),
			maps: $('.map .maps'),
			regions: $('.map .regions .region')
		};

		this.map = { x: this.el.panel.position().left, y: this.el.panel.position().top, width: this.el.panel.width(), height: this.el.panel.height() };
		this.viewport = { x: 0 + padding, y: 149 + padding, width: $(window).width() - 586 - 2 * padding, height: $(window).height() - 148 - 2 * padding };

		this.initial = {
			left: this.map.x - this.viewport.x - (this.viewport.width - this.map.width) / 2,
			top: this.map.y - this.viewport.y - (this.viewport.height - this.map.height) / 2
		};
		window.setTimeout(() => { window.scrollTo(this.initial.left, this.initial.top); }, 1);
	}

	select (map, region) {
		let _map = this.el.maps.attr('data-map');
		let _region = this.el.maps.attr('data-region');

		if (map == undefined && region == undefined)
			map = _map;
		if (map) {
			this.el.maps.attr({ 'data-map': map });
			if (map == _map)
				this.zoom();
		}
		if (region && !_region)
			this.zoom(region);

		Component.sidebar.article(this.el.maps.attr('data-map'), this.el.maps.attr('data-region'));
	}

	zoom (region) {
		if (region == undefined) {
			this.el.panel.css({ transform: 'none' });
			$('body').animate({ scrollLeft: this.initial.left, scrollTop: this.initial.top }, .8 * 1000);
			this.el.maps.removeAttr('data-region');
			return;
		}

		let map = this.el.regions.filter(`[data-region="${ region }"]`);
		let	box = map.get(0).getBBox();
		let scale = Math.min(this.viewport.width / box.width, this.viewport.height / box.height);
		let pos = {
			left: map.offset().left + (1 - scale) * box.width / 2 - this.viewport.x - (this.viewport.width - box.width * scale) / 2,
			top: map.offset().top + (1 - scale) * box.height / 2 - this.viewport.y - (this.viewport.height - box.height * scale) / 2
		};

		this.el.panel.css({ 'transform-origin': `${ (box.x + box.width / 2) / this.map.width * 100 }% ${ (box.y + box.height / 2) / this.map.height * 100 }%` });
		this.el.panel.css({ transform: `scale(${ scale })` });
		$('body').animate({ scrollTop: pos.top, scrollLeft: pos.left }, .5 * 1000);
		this.el.maps.attr({ 'data-region': region });
	}
};

let Groups = class extends Component {
	constructor () {
		super();

		this.el = {
			groups: $('.groups .group')
		};

		this.el.groups.on('click', evt => this.toggle( $(evt.target).data('group') ));
	}

	select (groups) {
		this.el.groups.addClass('inactive').filter((i, group) => groups.indexOf( $(group).data('group') ) >= 0).removeClass('inactive');
		this.toggle();
	}

	toggle (group) {
		this.el.groups.filter(`[data-group=${ group }]`).toggleClass('inactive');
		Component.points.filter(this.el.groups.filter(':not(.inactive)').map((i, group) => $(group).data('group')).toArray().join(','), 'vt');
		Component.detail.check();
	}
};

let Regions = class extends Component {
	constructor () {
		super();

		this.el = {
			regions: $('.regions .region')
		};

		this.el.regions.on('click', evt => this.select( $(evt.target).closest('[data-region]').data('region') ));
	}

	select (region) {
		Component.map.select(null ,region);
	}
};

let Points = class extends Component {
	constructor () {
		super();

		this.el = {
			points: $('.pois .poi')
		};

		this.el.points.on('click', evt => this.select( $(evt.target).closest('[data-poi]').data('poi'), $(evt.target).closest('.map').length ));
	}

	next (direction) {
		return this.el.points.filter((i, point) => $(point).parents('.sidebar').length).filter(`.selected`).parent()[ ['prevAll', 'nextAll'][direction] ]().find(':not(.hidden)')[ ['last', 'first'][direction] ]().data('poi');
	}

	select (poi, scroll) {
		let point = this.el.points.removeClass('selected').filter(`[data-poi=${ poi }]`).addClass('selected');
		if (scroll) {
			let position = point.data('position').split(',');
			//$('body').animate({ scrollLeft: position[0] - $(window).width() / 2, scrollTop: position[1] - ($(window).height() - 1206) / 2 }, 350);
		}
		Component.detail.select(poi);
	}

	filter (groups, region) {
		this.el.points.each((i, point) => $(point).toggleClass('hidden', $(point).data('region') != region || groups.indexOf($(point).data('group')) < 0));
		if (this.el.points.filter('.selected.hidden').length)
			this.select();
	}
};

let Detail = class extends Component {
	constructor () {
		super();

		this.el = {
			panel: $('.detail'),
			headline: $('.detail .headline'),
			description: $('.detail .description'),
			actions: {
				prev: $('.detail .titlebar .actions .back'),
				next: $('.detail .titlebar .actions .forward'),
				close: $('.detail .titlebar .actions .close')
			}
		};

		this.el.actions.prev.add(this.el.actions.next).on('click', evt => $(evt.target).is('.disabled') ? null : this.navigate( $(evt.target).is(this.el.actions.prev) ? 0 : 1 ) );
		this.el.actions.close.on('click', () => this.el.panel.hasClass('maximized') ? this.maximize(false) : Component.points.select());
	}

	maximize (state) {
		this.el.panel.toggleClass('maximized', state);
		Component.menu.toggle(!state);
		Component.sidebar.toggle(!state);
		if (!state)
			Component.viewer.image();
	}

	select (poi) {
		this.toggle(poi != undefined);
		if (poi == undefined)
			return;

		this.el.headline.attr({ 'class': `headline grp_${ data[poi].group }`}).text( data[poi].title );
		this.el.description.text( data[poi].description );
		Component.viewer.select(poi, this.el.panel.is('.maximized'));
		this.check();
	}

	check () {
		$([0, 1]).each(i => this.el.actions[ ['prev', 'next'][i] ].toggleClass('disabled', Component.points.next(i) == undefined));
	}

	navigate (direction) {
		Component.points.select( Component.points.next(direction) );
	}
};

let Viewer = class extends Component {
	constructor () {
		super();

		this.el = {
			images: $('.detail .photo .images'),
			thumbnails: $('.detail .thumbnails'),
			actions: {
				prev: $('.detail .photo .actions a.back'),
				next: $('.detail .photo .actions a.forward')
			}
		};

		this.el.thumbnails.on('click', 'a', evt => this.image( $(evt.target).closest('[data-file]').data('file') ));
		this.el.actions.prev.add(this.el.actions.next).on('click', evt => $(evt.target).closest('a').is('.disabled') ? null : this.navigate( $(evt.target).closest('a').is(this.el.actions.prev) ? 0 : 1 ) );
	}

	select (poi, image) {
		$(data[poi].files.map(file => `<li><a data-file="${ file }"><img src="${ thumbpath }/${ file }" /></a></li>`).join('')).appendTo(this.el.thumbnails.empty());
		if (image)
			this.image(this.el.thumbnails.find('[data-file]').data('file'));
	}

	image (file) {
		this.el.thumbnails.find('a').removeClass('selected').filter(`[data-file="${ file }"]`).addClass('selected');
		if (file == undefined) {
			this.el.images.empty();
			return;
		}

		window.setTimeout(() => {
			let existing = this.el.images.find('li').addClass('fadeout');
			let current = $(`<li class="fadein"><img src="${ imgpath }/${ file }" /></li>`).appendTo(this.el.images);
			window.setTimeout(() => existing.remove(), .33 * 1000);
		}, this.el.images.closest('.maximized').length ? 0 : .33 * 1000);
		Component.detail.maximize(true);
		this.check();
	}

	navigate (direction) {
		this.image(this.next(direction));
	}

	next (direction) {
		return this.el.thumbnails.find('.selected').parent()[ ['prev', 'next'][direction] ]().find('[data-file]').data('file');
	}

	check () {
		$([0, 1]).each(i => this.el.actions[ ['prev', 'next'][i] ].toggleClass('disabled', this.next(i) == undefined));
	}
};


$(window).on('load', () => {
	new Menu();
	new Sidebar();
	new Map();
	new Groups();
	new Regions();
	new Points();
	new Detail();
	new Viewer();

	$('.menu .item').first().click();
	// $(document).on('contextmenu', event => event.preventDefault());
});


/*
	let panels = function () {
		let assign = function (obj, elems) {
			elems.each((i, elem) => obj[ $(elem).data('panel') ] = $(elem));
			return obj;
		};

		let triggers = assign({}, $('.triggers .trigger'));
		let buttons = assign({}, $('.panel .buttons .close'));
		let pois = $('.poi');
		let panels = assign({}, $('.panel'));
		let state = $();

		let dur = 220;
		let check = () => {
			triggers.tags.toggleClass('selected', panels.tags.is(':visible'));
			triggers.list.toggleClass('selected', panels.list.is(':visible'));
		};

		triggers.tags.add(triggers.list).on('click', event => {
			if (panels.detail.is(':visible')) {
				panels.detail.slideUp(dur);
				pois.removeClass('selected');
			}
			($(event.target).is(triggers.tags) ? panels.tags : panels.list).slideToggle(dur, check);
		});

		pois.on('click', event => {
			if (panels.detail.is(':visible'))
				return;
			state = panels.tags.add(panels.list).filter(':visible').slideUp(dur, check);
			panels.detail.slideDown(dur);
		});

		buttons.tags.add(buttons.list).on('click', event => {
			$(event.target).closest(panels.tags.add(panels.list)).slideUp(dur, check);
		});

		buttons.detail.on('click', () => {
			panels.detail.slideUp(dur);
			state.slideDown(dur, check);
			pois.removeClass('selected');
		});
	};

	let tags = function () {
		let triggers = $('.panel.tags .tag');
		let states = triggers.map((i, tag) => $(tag).data('tag')).toArray().reduce((obj, tag) => { obj[tag] = true; return obj; }, {});
		let pois = $('.poi');

		triggers.on('click', event => {
			let trigger = $(event.target);
			let tag = trigger.data('tag');

			switch (event.originalEvent.detail) {
				case 2:
					let mode = Object.values(states).filter(value => value).length <= 1;
					for (let tag in states)
						states[tag] = mode;
					states[tag] = true;
					triggers.toggleClass('disabled', !mode).filter(trigger).removeClass('disabled');
					break;
				default:
					trigger.toggleClass('disabled');
					states[tag] = !states[tag];
			}

			pois.attr({ 'data-inactive': 1 }).hide();
			pois.filter((i, item) => {
				let tag = $(item).data('tags').split(' ').find(tag => states[tag]);
				$(item).attr({ 'class': `poi ${ tag }` });
				return tag;
			}).removeAttr('data-inactive').show();
		});
	};

	let zoom = function () {
		let triggers = {
			in: $('.toolbar .buttons .plus'),
			out: $('.toolbar .buttons .minus')
		};
		let map = $('.map');
		let pois = map.find('.poi');
		let position = { left: 500, top: 500 };
		let scale = $(window).width() / map.width();
		let scroll = (left, top) => $(window).scrollLeft(left).scrollTop(top);

		triggers.in.add(triggers.out).on('click', event => {
			let direction = $(event.target).hasClass('minus');

			map.css({ transform: `scale(${ direction ? scale : 1 })` });
			pois.each((i, poi) => { $(poi).attr({ transform: $(poi).attr('transform').replace(/scale\(.*?\)/g, `scale(${ direction ? 1 / scale : 1 })`) }) });
			$('body').toggleClass('lock', direction);
			scroll(direction ? 0 : position.left, direction ? 0 : position.top);

			triggers.in.add(triggers.out).toggle();
		});

		scroll(position.left, position.top);
	};
*/
