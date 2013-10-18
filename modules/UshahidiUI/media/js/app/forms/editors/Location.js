define(['underscore', 'handlebars', 'backbone', 'marionette', 'leaflet', 'text!forms/templates/LocationEditor.html', 'backbone-forms/backbone-forms'],
	function(_, Handlebars, Backbone, Marionette, L, template)
{
	var Location = Backbone.Form.editors.Location = Backbone.Form.editors.Base.extend({
		tagName : 'div',
		template : Handlebars.compile(template),
		marker : L.marker([-36.85, 174.78], { draggable : true }),
		defaultValue : {
			lat : null,
			lon : null
		},

		events: {

		},

		initialize : function(options)
		{
			// Call parent constructor
			Backbone.Form.editors.Base.prototype.initialize.call(this, options);

			// Init map once form has rendered
			this.form.on('render', this.onDomRefresh, this);
		},

		render : function()
		{
			var that = this,
					$editor = this.template(_.result(this, 'templateData')),
					osm,
					cloudmadeUrl,
					cloudmadeAttribution,
					minimal,
					map,
					marker;

			//this.setElement($editor);
			this.$el.append($editor);
			//this.setValue(this.value);

			// Don't re-render the map
			if (typeof this.map !== 'undefined')
			{
				return this;
			}

			// add an OpenStreetMap tile layer
			osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			});

			cloudmadeUrl = 'http://{s}.tile.cloudmade.com/528babad266546698317425055510f96/{styleId}/256/{z}/{x}/{y}.png';
			cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';
			minimal = L.tileLayer(cloudmadeUrl, {styleId: 22677, attribution: cloudmadeAttribution});

			// create a map in the 'map' div, set the view to a given place and zoom
			map = this.map = L.map(this.$('.map')[0], {
				center : new L.LatLng(-36.85, 174.78),
				zoom : 5,
				layers : [minimal],
				scrollWheelZoom : false
			});

			marker = this.marker = L.marker([-36.85, 174.78], { draggable : true }).addTo(map);
			marker.addEventListener('dragend', function ()
			{
				this.value = this.getValue();
			}, this);

			// Fix any leaflet weirdness after map resizes
			// @TODO check if this works in older browsers, add backup delayed call if not
			this.$el.on('transitionend', function ()
			{
				that.map.invalidateSize();
			});

			return this;
		},

		/**
		 * Returns the data to be passed to the template
		 *
		 * @return {Object}
		 */
		templateData: function()
		{
			//var schema = this.schema;

			return {
				id : this.id,
				name: this.getName()
			};
		},

		getValue: function()
		{
			var latlng = this.marker.getLatLng(),
				label = this.$('#' + this.id + '_label').val();

			return {
				label : label,
				lat : latlng.lat,
				lon : latlng.lng
			};
		},

		setValue: function(value)
		{
			if (value.lat && value.lon)
			{
				this.marker.setLatLng(new L.LatLng(value.lat, value.lon));
			}
		}
	});
	return Location;
});