AUI.add(
	'liferay-pagination',
	function(A) {

		/**
		 * The Pagination Component.
		 *
		 * @module liferay-pagination
		 */

		var Lang = A.Lang;
		var AArray = A.Array;
		var ANode = A.Node;
		var AObject = A.Object;

		var BOUNDING_BOX = 'boundingBox';

		var ITEMS_PER_PAGE = 'itemsPerPage';

		var ITEMS_PER_PAGE_LIST = 'itemsPerPageList';

		var NAME = 'pagination';

		var PAGE = 'page';

		var RESULTS = 'results';

		var STR_SPACE = ' ';

		var STRINGS = 'strings';

		/**
		 * A base class for `A.Pagination`.
		 *
		 * @class A.Pagination
		 * @extends Base
		 * @param {Object} config Object literal specifying
		 * widget configuration properties.
		 * @constructor
		 */
		var Pagination = A.Component.create(
			{
				/**
				 * static property used to define the default attribute
				 * configuration for the `A.Pagination`.
				 *
				 * @property ATTRS
				 * @type Object
				 * @static
				 */
				ATTRS: {

					/**
					 * Defines the number of items per page.
					 *
					 * @attribute itemsPerPage
					 * @default 20
					 * @type Number
					 */
					itemsPerPage: {
						validator: Lang.isNumber,
						value: 20
					},

					/**
					 * Defines the list of items per page.
					 *
					 * @attribute itemsPerPageList
					 * @default [5, 10, 20, 30, 50, 75]
					 * @type Array
					 */
					itemsPerPageList: {
						validator: Lang.isArray,
						value: [5, 10, 20, 30, 50, 75]
					},

					/**
					 * Provides a string to identify the namespace.
					 *
					 * @attribute namespace
					 * @type String
					 */
					namespace: {
						validator: Lang.isString
					},

					/**
					 * Defines the number of results found in a search.
					 *
					 * @attribute results
					 * @default 0
					 * @type Number
					 */
					results: {
						validator: Lang.isNumber,
						value: 0
					},

					/**
					 * Defines the selected Item.
					 *
					 * @attribute selectedItem
					 * @default 0
					 * @type Number
					 */
					selectedItem: {
						validator: Lang.isNumber,
						value: 0
					},

					/**
					 * Collection of strings used to label elements of the UI.
					 *
					 * @attribute Strings
					 * @type Object
					 */
					strings: {
						setter: function(value) {
							return A.merge(
								value,
								{
									items: Liferay.Language.get('items'),
									of: Liferay.Language.get('of'),
									page: Liferay.Language.get('page'),
									per: Liferay.Language.get('per'),
									results: Liferay.Language.get('results'),
									showing: Liferay.Language.get('showing')
								}
							);
						},
						validator: Lang.isObject
					},

					/**
					 * If true, the results are visible.
					 *
					 * @attribute visible
					 * @type Boolean
					 */
					visible: {
						setter: '_uiSetVisible',
						validator: Lang.isBoolean
					}
				},

				/**
				 * Static property used to define which component it extends.
				 *
				 * @property EXTENDS
				 * @type String
				 * @static
				 */
				EXTENDS: A.Pagination,

				/**
				 * Static property which provides a string to identify the class.
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				NAME: NAME,

				prototype: {
					TPL_CONTAINER: '<div class="lfr-pagination-controls" id="{id}"></div>',

					TPL_DELTA_SELECTOR: '<div class="lfr-pagination-delta-selector">' +
						'<div class="btn-group lfr-icon-menu">' +
							'<a class="btn direction-down dropdown-toggle max-display-items-15" href="javascript:;" id="{id}" title="{title}">' +
								'<span class="lfr-pagination-delta-selector-amount">{amount}</span>' +
								'<span class="lfr-icon-menu-text">{title}</span>' +
								'<i class="icon-caret-down"></i>' +
							'</a>' +
						'</div>' +
					'</div>',

					TPL_ITEM_CONTAINER: '<ul class="direction-down dropdown-menu lfr-menu-list" id="{id}" role="menu" />',

					TPL_ITEM: '<li id="{idLi}" role="presentation">' +
						'<a href="javascript:;" class="lfr-pagination-link taglib-icon" id="{idLink}" role="menuitem">' +
							'<span class="taglib-text-icon" data-index="{index}" data-value="{value}">{value}</span>' +
						'</a>' +
					'</li>',

					TPL_LABEL: ' {items} {per} {page}',

					TPL_RESULTS: '<small class="search-results" id="{id}">{value}</small>',

					TPL_RESULTS_MESSAGE: '{showing} {from} - {to} {of} {x} {results}.',

					TPL_RESULTS_MESSAGE_SHORT: '{showing} {x} {results}.',

					/**
				 	 * Render the Pagination component instance. Lifecycle.
				 	 *
				 	 * @method renderUI
				 	 * @protected
				 	 */
					renderUI: function() {
						var instance = this;

						Pagination.superclass.renderUI.apply(instance, arguments);

						var boundingBox = instance.get(BOUNDING_BOX);

						boundingBox.addClass('lfr-pagination');

						var namespace = instance.get('namespace');

						var deltaSelectorId = namespace + 'dataSelectorId';

						var selectorLabel = instance._getLabelContent();

						var deltaSelector = ANode.create(
							Lang.sub(
								instance.TPL_DELTA_SELECTOR,
								{
									amount: selectorLabel.amount,
									id: deltaSelectorId,
									title: selectorLabel.title
								}
							)
						);

						var itemContainer = ANode.create(
							Lang.sub(
								instance.TPL_ITEM_CONTAINER,
								{
									id: namespace + 'itemContainerId'
								}
							)
						);

						var itemsContainer = ANode.create(
							Lang.sub(
								instance.TPL_CONTAINER,
								{
									id: namespace + 'itemsContainer'
								}
							)
						);

						var searchResults = ANode.create(
							Lang.sub(
								instance.TPL_RESULTS,
								{
									id: namespace + 'searchResultsId',
									value: instance._getResultsContent()
								}
							)
						);

						var buffer = AArray.map(
							instance.get(ITEMS_PER_PAGE_LIST),
							function(item, index, collection) {
								return Lang.sub(
									instance.TPL_ITEM,
									{
										idLi: namespace + 'itemLiId' + index,
										idLink: namespace + 'itemLinkId' + index,
										index: index,
										value: item
									}
								);
							}
						);

						itemContainer.appendChild(buffer.join(''));

						deltaSelector.one('#' + deltaSelectorId).ancestor().appendChild(itemContainer);

						itemsContainer.appendChild(deltaSelector);
						itemsContainer.appendChild(searchResults);

						boundingBox.appendChild(itemsContainer);

						instance._deltaSelector = deltaSelector;
						instance._itemContainer = itemContainer;
						instance._itemsContainer = itemsContainer;
						instance._paginationContentNode = boundingBox.one('.pagination-content');
						instance._paginationControls = boundingBox.one('.lfr-pagination-controls');
						instance._searchResults = searchResults;

						Liferay.Menu.register(deltaSelectorId);
					},

					/**
				 	 * Bind the events on the Pagination UI. Lifecycle.
				 	 *
				 	 * @method bindUI
				 	 * @protected
				 	 */
					bindUI: function() {
						var instance = this;

						Pagination.superclass.bindUI.apply(instance, arguments);

						instance._eventHandles = [
							instance._itemContainer.delegate('click', instance._onItemClick, '.lfr-pagination-link', instance)
						];

						instance.after('resultsChange', instance._afterResultsChange, instance);
						instance.on('changeRequest', instance._onChangeRequest, instance);
						instance.on('itemsPerPageChange', instance._onItemsPerPageChange, instance);
					},

					/**
				 	 * Destructor lifecycle implementation for the `A.Pagination` class.
				 	 *
				 	 * @method destructor
				 	 * @protected
				 	 */
					destructor: function() {
						var instance = this;

						(new A.EventHandle(instance._eventHandles)).detach();
					},

					/**
				 	 * Fires after a change in the results.
				 	 *
				 	 * @method _afterResultsChange
					 * @param event
				 	 * @protected
				 	 */
					_afterResultsChange: function(event) {
						var instance = this;

						instance._syncResults();
					},

					/**
				 	 * Updates the 'state' Object when there is a 
					 * change in the number of items per page.
					 *
				 	 * @method _dispatchRequest
					 * @param {Object} state
				 	 * @protected
				 	 */
					_dispatchRequest: function(state) {
						var instance = this;

						if (!AObject.owns(state, ITEMS_PER_PAGE)) {
							state.itemsPerPage = instance.get(ITEMS_PER_PAGE);
						}

						Pagination.superclass._dispatchRequest.call(instance, state);
					},

					/**
				 	 * Gets the strings for the items per page labels.
				 	 *
				 	 * @method _getLabelContent
					 * @param itemsPerPage
				 	 * @protected
				 	 */
					_getLabelContent: function(itemsPerPage) {
						var instance = this;

						var results = {};

						var strings = instance.get(STRINGS);

						if (!itemsPerPage) {
							itemsPerPage = instance.get(ITEMS_PER_PAGE);
						}

						results.amount = itemsPerPage;

						results.title = Lang.sub(
							instance.TPL_LABEL,
							{
								items: strings.items,
								page: strings.page,
								per: strings.per
							}
						);

						return results;
					},

					/**
				 	 * Retrieves the content to populate the results.
				 	 *
				 	 * @method _getResultsContent
					 * @param page
					 * @param itemsPerPage
				 	 * @protected
				 	 */					
					_getResultsContent: function(page, itemsPerPage) {
						var instance = this;

						var results = instance.get(RESULTS);
						var strings = instance.get(STRINGS);

						if (!Lang.isValue(page)) {
							page = instance.get(PAGE);
						}

						if (!Lang.isValue(itemsPerPage)) {
							itemsPerPage = instance.get(ITEMS_PER_PAGE);
						}

						var tpl = instance.TPL_RESULTS_MESSAGE_SHORT;

						var values = {
							results: strings.results,
							showing: strings.showing,
							x: results
						};

						if (results > itemsPerPage) {
							var tmp = page * itemsPerPage;

							tpl = instance.TPL_RESULTS_MESSAGE;

							values.from = ((page - 1) * itemsPerPage) + 1;
							values.of = strings.of;
							values.to = tmp < results ? tmp : results;
						}

						return Lang.sub(tpl, values);
					},

					/**
				 	 * Fires when the page changes.
				 	 *
				 	 * @method _onChangeRequest
					 * @param event
				 	 * @protected
				 	 */
					_onChangeRequest: function(event) {
						var instance = this;

						var state = event.state;
						var page = state.page;

						var itemsPerPage = state.itemsPerPage;

						instance._syncLabel(itemsPerPage);
						instance._syncResults(page, itemsPerPage);
					},

					/**
				 	 * Fires when a page number is clicked on. 
				 	 *
				 	 * @method _onItemClick
					 * @param event
				 	 * @protected
				 	 */	
					_onItemClick: function(event) {
						var instance = this;

						var itemsPerPage = Lang.toInt(event.currentTarget.one('.taglib-text-icon').attr('data-value'));

						instance.set(ITEMS_PER_PAGE, itemsPerPage);
					},

					/**
				 	 * Fires when the items per page change. 
				 	 *
				 	 * @method _onItemsPerPageChange
					 * @param event
				 	 * @protected
				 	 */
					_onItemsPerPageChange: function(event) {
						var instance = this;

						var page = instance.get(PAGE);

						var itemsPerPage = event.newVal;

						instance._dispatchRequest(
							{
								itemsPerPage: itemsPerPage,
								page: page
							}
						);

						var results = instance.get(RESULTS);

						instance.set('visible', !!(results && results > itemsPerPage));
					},

					/**
				 	 * Syncs the page numbers with the amount of results. 
				 	 *
				 	 * @method _syncLabel
					 * @param itemsPerPage
				 	 * @protected
				 	 */
					_syncLabel: function(itemsPerPage) {
						var instance = this;

						var results = instance._getLabelContent(itemsPerPage);

						instance._deltaSelector.one('.lfr-pagination-delta-selector-amount').html(results.amount);
						instance._deltaSelector.one('.lfr-icon-menu-text').html(results.title);
					},

					/**
				 	 * Updates the results.  
				 	 *
				 	 * @method _syncResults
					 * @param page
					 * @param itemsPerPage
				 	 * @protected
				 	 */
					_syncResults: function(page, itemsPerPage) {
						var instance = this;

						var result = instance._getResultsContent(page, itemsPerPage);

						instance._searchResults.html(result);
					},

					/**
				 	 * Sets the visibility on the UI. 
				 	 *
				 	 * @method _uiSetVisible
					 * @param val
				 	 * @protected
				 	 */
					_uiSetVisible: function(val) {
						var instance = this;

						var hideClass = instance.get('hideClass');

						var hiddenClass = instance.getClassName('hidden');

						if (hideClass !== false) {
							hiddenClass += STR_SPACE + (hideClass || 'hide');
						}

						var results = instance.get(RESULTS);

						var itemsPerPageList = instance.get(ITEMS_PER_PAGE_LIST);

						instance._paginationControls.toggleClass(hiddenClass, (results <= itemsPerPageList[0]));

						instance._paginationContentNode.toggleClass(hiddenClass, !val);
					}
				}
			}
		);

		Liferay.Pagination = Pagination;
	},
	'',
	{
		requires: ['aui-pagination']
	}
);