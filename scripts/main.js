let Component = class {
	constructor () {
		Component[ this.constructor.name.toLowerCase() ] = this;
	}
};

let Menu = class extends Component {
	constructor () {
		super();

		this.el = {
			items: $('.menu .item')
		};

		this.el.items.find('.title').each((i, item) => $(item).clone().addClass('colored').insertBefore(item));
		this.el.items.on('click', evt => this.select( $(evt.target).closest('[data-map]').data('map') ));
	}

	select (map) {
		let item = this.el.items.removeClass('selected').filter(`[data-map=${ map }]`).addClass('selected');
		Component.map.select(map);
		Component.groups.select(item.data('groups'));
		Component.sidebar.headline(map, item.find('.subtitle').text());
	}
};

let Sidebar = class extends Component {
	constructor () {
		super();

		this.el = {
			panel: $('.sidebar'),
			headline: $('.sidebar .headline')
		}
	}

	headline (map, subtitle) {
		this.el.headline.attr({ 'class': `headline map_${ map }`}).find('.subtitle').text(subtitle);
	}
};

let Map = class extends Component {
	constructor () {
		super();

		this.el = {
			map: $('.map')
		};
	}

	select (map) {
		this.el.map.attr({ 'data-map': map });
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

	groups () {
		return this.el.groups.filter(':not(.inactive)').map((i, group) => $(group).data('group')).toArray().join(',');
	}

	select (groups) {
		this.el.groups.addClass('inactive').filter((i, group) => groups.indexOf( $(group).data('group') ) >= 0).removeClass('inactive');
		Component.points.filter(this.groups(), 'vt');
	}

	toggle (group) {
		this.el.groups.filter(`[data-group=${ group }]`).toggleClass('inactive');
		Component.points.filter(this.groups(), 'vt');
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
			// images
			actions: {
				prev: $('.detail .actions .back'),
				next: $('.detail .actions .forward'),
				close: $('.detail .actions .close')
			}
		};

		this.el.actions.prev.add(this.el.actions.next).on('click', evt => $(evt.target).is('.disabled') ? null : this.navigate( $(evt.target).is(this.el.actions.prev) ? 0 : 1 ) );
		this.el.actions.close.on('click', () => Component.points.select());
	}

	select (poi) {
		this.el.panel.toggleClass('hidden', poi == undefined);
		if (poi == undefined)
			return;

		this.el.headline.attr({ 'class': `headline grp_${ data[poi].group }`}).text( data[poi].title );
		this.el.description.text( data[poi].description );
		// panel.find('img').attr({ src: `/data/images/${ data[id].images[0] }` }); //FIXME

		$([0, 1]).each(i => this.el.actions[ ['prev', 'next'][i] ].toggleClass('disabled', Component.points.next(i) == undefined));
	}

	navigate (direction) {
		Component.points.select( Component.points.next(direction) );
	}
};

$(window).on('load', () => {
	new Menu();
	new Sidebar();
	new Map();
	new Groups();
	new Points();
	new Detail();

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
