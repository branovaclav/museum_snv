let Tabs = class {
	constructor () {
		this.el = {
			tabs: $('.tabs .tab'),
			panels: $('.panels .panel')
		};

		this.el.tabs.on('click', evt => { evt.preventDefault(); this.toggle( $(evt.target) ); })
	}

	toggle (tab) {
		this.el.tabs.removeClass('selected').filter(tab).addClass('selected');
		this.el.panels.hide().filter( tab.attr('href') ).show();
	}
};

let Collection = class {
	constructor () {
		this.collection = this.constructor.name.toLowerCase();

		this.el = {
			form: $(`#${ this.collection } .form`),
			btn: {
				create: $(`#${ this.collection } .create`),
				edit: $(`#${ this.collection } .edit`),
				delete: $(`#${ this.collection } .delete`),

				cancel: $(`#${ this.collection } .cancel`),
				submit: $(`#${ this.collection } .submit`)
			}
		};
	}

	send (action, id = this.el.form.find('[name="id"]').val()) {
		let method = (action == 'submit') ? (id.length ? 'put' : 'post') : 'delete'
		let data = (action == 'submit') ? this.structurize(this.el.form.prop('elements')) : null
		let callback = () => window.location.reload()

		fetch(`/admin/${ this.collection }`, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, data })
		})
		.then(res => res.ok ? res.json() : null)
		.then(data => callback.call(undefined, data))
		.catch(err => console.error('Error: ', err));
	}

	structurize (fields) {
		let result = {
			title: {
				sk: fields.title_sk.value,
				en: fields.title_en.value
			},
			description: {
				sk: fields.description_sk.value,
				en: fields.description_en.value
			},
			group: fields.group.value,
			region: fields.region.value,
		};
		if (fields.position && fields.folder)
			Object.assign(result, {
				position: {
					left: fields.position.value.split(',')[0],
					top: fields.position.value.split(',')[1]
				},
				folder: fields.folder.value
			});

		return result;
	}
}

let Articles = class extends Collection {
	constructor () {
		super()

		Object.assign(this.el, {
			groups: $('#articles .groups a'),
			regions: $('#articles .regions a')
		});

		this.el.groups.add(this.el.regions).on('click', evt => this.toggle( $(evt.target) ))
			.filter(this.el.groups.first().add(this.el.regions.first())).click();

		this.el.btn.submit.on('click', () => this.send('submit'));
	}

	toggle (link) {
		let type = link.is(this.el.groups) ? 'group' : 'region';
		let fields = this.el.form.prop('elements');
		fields[type].value = link.data(type);

		let article = data.articles.find(article => article.group == fields.group.value && article.region == fields.region.value);

		fields.id.value = article ? article.$loki : '';
		['title_sk', 'title_en', 'description_sk', 'description_en'].forEach(field => fields[field].value = article ? article[field.split('_')[0]][field.split('_')[1]] : '');

		this.el[`${ type }s`].removeClass('selected').filter(link).addClass('selected');
	}
};

let Pois = class extends Collection {
	constructor() {
		super()

		Object.assign(this.el, {
			pois: $('#pois .pois')
		});

		this.el.btn.create.add(this.el.btn.edit).on('click', evt => this.toggle( $(evt.target).data('id') ));
		this.el.btn.cancel.on('click', () => { this.el.pois.show(); this.el.form.parent().hide() });

		this.el.btn.submit.on('click', () => this.send('submit'));
		this.el.btn.delete.on('click', () => this.send('delete', $(event.target).data('id')));
	}

	toggle (id) {
		this.el.pois.hide()
		this.el.form.parent().show();
		let fields = this.el.form.prop('elements');

		let poi = data.pois.find(poi => poi.$loki == id);
		fields.id.value = poi ? poi.$loki : '';
		['group', 'region', 'folder'].forEach(field => fields[field].value = poi ? poi[field] : '');
		['title_sk', 'title_en', 'description_sk', 'description_en'].forEach(field => fields[field].value = poi ? poi[field.split('_')[0]][field.split('_')[1]] : '');
		fields.position.value = poi ? `${ poi.position.left },${ poi.position.top }` : '';
	}
}

$(window).on('load', () => {
	new Tabs();
	new Articles();
	new Pois();
});
