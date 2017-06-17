$(window).on('load', () => {
	let pois = $('.poi');
	let form = $('#form');

	$('.poi').on('click', event => {
		let poi = $(event.target).closest(pois);
		if (form.closest(poi).length)
			return;

		pois.removeClass('selected').filter(poi).addClass('selected').append(form);
		$(form.prop('elements')).val('').filter('[name=id]').val(poi.data('id'));
	});

	let send = function (method, { id, data }, callback = () => window.location.reload()) {
		fetch('/admin', {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, data })
		})
			.then(res => res.ok ? res.json() : null)
			.then(data => callback.call(undefined, data))
			.catch(err => console.error('Error', err));
	};

	let structurize = function (fields) {
		return {
			position: {
				left: fields.position_left.value,
				top: fields.position_top.value
			},
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
			folder: fields.folder.value
		};
	};

	form.on('submit', () => {
		let id = form.find('[name=id]').val();
		send(id.length ? 'put' : 'post', { id, data: structurize(form.prop('elements')) });
		return false;
	});

	$('.delete').on('click', event => {
		send('delete', { id: $(event.target).closest('[data-id]').data('id') });
	});
});
