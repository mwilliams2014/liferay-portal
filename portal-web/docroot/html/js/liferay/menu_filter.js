AUI.add(
	'liferay-menu-filter',
	function(A) {

		/**
		 * The Menu Filter Component.
		 *
		 * @module liferay-menu-filter
		 */

		var Lang = A.Lang;
		var AArray = A.Array;
		var AEvent = A.Event;
		var Util = Liferay.Util;

		var CSS_HIDDEN = 'hidden';

		var STR_EMPTY = '';

		var TPL_INPUT_FILTER = '<li class="btn-toolbar search-panel">' +
			'<div class="control-group">' +
				'<input class="field focus menu-item-filter search-query span12" placeholder="{placeholder}" type="text">' +
			'</div>' +
		'</li>';

		/**
		 * A base class for `A.MenuFilter`.
		 *
		 * @class A.MenuFilter
		 * @param {Object} config literal specifying
		 * widget configuration properties.
		 * @constructor
		 */		
		var MenuFilter = A.Component.create(
			{

				/**
				 * A static property which provides a string to identify the class
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				NAME: 'menufilter',

				/**
				 * A static property used to define which component it extends.
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				EXTENDS: A.Base,

				/**
				 * A static property used to define which component it augments.
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				AUGMENTS: A.AutoCompleteBase,

				/**
				 * A static property used to define the default attribute
				 * configuration for `A.MenuFilter`.
				 *
				 * @property ATTRS
				 * @type {Object}
				 * @static
				 */
				ATTRS: {

					/**
					 * content node for the menu filter.
					 *
					 * @attribute content
					 */
					content: {
						setter: A.one
					},

					/**
					 * Input node for the menu filter.
					 *
					 * @attribute inputNode
					 * @default '.menu-item-filter'
					 * @type String 
					 */
					inputNode: {
						validator: Lang.isString,
						value: '.menu-item-filter'
					},

					/**
					 * Object which holds the placeholder string 'Search' for the menu filter.
					 *
					 * @attribute strings
					 * @default placeholder: 'Search'
					 * @type {Object}
					 */
					strings: {
						validator: Lang.isObject,
						value: {
							placeholder: 'Search'
						}
					}
				},

				prototype: {

					/**
					 * Construction logic executed during `A.MenuFilter` instantiation.
					 * Lifecycle.
					 *
					 * @method initializer
					 * @protected
					 */
					initializer: function() {
						var instance = this;

						instance._renderUI();
						instance._bindUIACBase();
						instance._syncUIACBase();
					},

					/**
					 * Reset the menu filter. 
					 *
					 * @method reset
					 * @protected
					 */
					reset: function() {
						var instance = this;

						instance.get('inputNode').val(STR_EMPTY);

						instance._menuItems.removeClass(CSS_HIDDEN);
					},

					/**
					 * Render the MenuFilter component instance. Lifecycle.
					 *
					 * @method _renderUI
					 * @protected
					 */
					_renderUI: function() {
						var instance = this;

						var node = instance.get('content');

						var menuItems = node.all('li');

						node.prepend(
							Lang.sub(
								TPL_INPUT_FILTER,
								{
									placeholder: instance.get('strings').placeholder
								}
							)
						);

						instance._menuItems = menuItems;

						instance.on('results', instance._filterMenu, instance);
					},

					/**
					 * Filter the menu.
					 *
					 * @method _filterMenu
					 * @protected
					 */
					_filterMenu: function(event) {
						var instance = this;

						instance._menuItems.addClass(CSS_HIDDEN);

						AArray.each(
							event.results,
							function(result) {
								result.raw.node.removeClass(CSS_HIDDEN);
							}
						);
					}
				}
			}
		);

		Liferay.MenuFilter = MenuFilter;
	},
	'',
	{
		requires: ['aui-node', 'autocomplete-base', 'autocomplete-filters']
	}
);