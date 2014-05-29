AUI.add(
	'liferay-app-view-move',
	function(A) {

		/**
		 * The AppViewMove Component.
		 *
		 * @module liferay-app-view-move
		 */

		var History = Liferay.HistoryManager;
		var Lang = A.Lang;
		var UA = A.UA;
		var Util = Liferay.Util;

		var CSS_ACTIVE_AREA = 'active-area';

		var CSS_ACTIVE_AREA_PROXY = 'active-area-proxy';

		var DATA_FOLDER_ID = 'data-folder-id';

		var SELECTOR_DRAGGABLE_NODES = '[data-draggable]';

		var STR_BLANK = '';

		var STR_DATA = 'data';

		var STR_DELETE = 'delete';

		var STR_DISPLAY_STYLE = 'displayStyleCSSClass';

		var STR_DOT = '.';

		var STR_DRAG_NODE = 'dragNode';

		var STR_FORM = 'form';

		var STR_MOVE = 'move';

		var STR_MOVE_TO_TRASH = 'move_to_trash';

		var STR_MOVE_ENTRY_URL = 'moveEntryRenderUrl';

		var STR_NODE = 'node';

		var STR_PORTLET_GROUP = 'portletGroup';

		var TOUCH = UA.touch;
		
		/**
		 * A base class for `A.AppViewMove`.
		 *
		 * @class A.AppViewMove
		 * @extends Base
		 * @param {Object} config Object literal specifying
		 * widget configuration properties.
		 * @constructor
		 */
		var AppViewMove = A.Component.create(
			{

				/**
				 * A static property used to define the default 
				 * attribute configuration for `A.AppViewMove`.
				 *
				 * @property ATTRS
				 * @type Object
				 * @static
				 */
				ATTRS: {

					/**
					 * String which holds the row ids.
					 *
					 * @attribute allRowIds
					 * @type String
					 */
					allRowIds: {
						validator: Lang.isString
					},

					/**
					 * Empty string that displays the CSS class.
					 *
					 * @attribute displayStyleCSSClass
					 * @type String
					 */
					displayStyleCSSClass: {
						validator: Lang.isString
					},

					/**
					 * Empty String for the draggable CSS class.
					 *
					 * @attribute draggableCSSClass
					 * @type String
					 */
					draggableCSSClass: {
						validator: Lang.isString
					},

					/**
					 * Empty string which holds the url when an entry is edited.
					 *
					 * @attribute editEntryUrl
					 * @type String
					 */
					editEntryUrl: {
						validator: Lang.isString
					},

					/**
					 * String that holds a RegEx for the folder id.
					 *
					 * @attribute folderIdHashRegEx
					 * @type String
					 */
					folderIdHashRegEx: {
						setter: function(value) {
							if (Lang.isString(value)) {
								value = new RegExp(value);
							}

							return value;
						},
						validator: function(value) {
							return (value instanceof RegExp || Lang.isString(value));
						}
					},

					/**
					 * An empty object for the form.
					 *
					 * @attribute form
					 * @type Object
					 */
					form: {
						validator: Lang.isObject
					},

					/**
					 * String that holds the URL for an entry when it is moved.
					 *
					 * @attribute moveEntryRenderUrl
					 * @type String
					 */
					moveEntryRenderUrl: {
						validator: Lang.isString
					},

					/**
					 * A string used to identify the namespace.
					 *
					 * @attribute namespace
					 * @type String
					 */
					namespace: {
						validator: Lang.isString
					},

					/**
					 * String which holds the portlet container id.
					 *
					 * @attribute portletContainerId
					 * @type String
					 */
					portletContainerId: {
						validator: Lang.isString
					},

					/**
					 * A string used for a portlet group.
					 *
					 * @attribute portletGroup
					 * @type String
					 */
					portletGroup: {
						validator: Lang.isString
					},

					/**
					 * An object used to hold the process entry ids.
					 *
					 * @attribute processEntryIds
					 * @type Object
					 */
					processEntryIds: {
						validator: Lang.isObject
					},

					/**
					 * String used to hold the trash link id.
					 *
					 * @attribute trashLinkId
					 * @type String
					 */
					trashLinkId: {
						validator: Lang.isString
					},

					/**
					 * A boolean value which determines whether a entry can be moved.
					 *
					 * @attribute updateable
					 * @type Boolean
					 */
					updateable: {
						validator: Lang.isBoolean
					}
				},

				/**
				 * A static property used to identify which component it augments.
				 *
				 * @property AUGMENTS
				 * @type Object
				 * @static
				 */
				AUGMENTS: [Liferay.PortletBase],

				/**
				 * A static property used to identify which component it extends.
				 *
				 * @property EXTENDS
				 * @type Object
				 * @static
				 */
				EXTENDS: A.Base,

				/**
				 * A static property which provides a string to identify the class.
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				NAME: 'liferay-app-view-move',

				prototype: {

					/**
				 	 * Construction logic executed during `A.AppViewMove` instantiation.
				 	 * Lifecycle.
				 	 *
				 	 * @method initializer
					 * @param config
				 	 * @protected
				 	 */
					initializer: function(config) {
						var instance = this;

						instance._portletContainer = instance.byId(instance.get('portletContainerId'));

						instance._entriesContainer = instance.byId('entriesContainer');

						instance._eventEditEntry = instance.ns('editEntry');

						var eventHandles = [
							Liferay.on(instance._eventEditEntry, instance._editEntry, instance)
						];

						instance._eventHandles = eventHandles;

						instance._registerDragDrop();
					},

					/**
				 	 * Destructor lifecycle implementation for the `A.AppViewMove` class.
				 	 *
				 	 * @method destructor
				 	 * @protected
				 	 */
					destructor: function() {
						var instance = this;

						A.Array.invoke(instance._eventHandles, 'detach');

						instance._ddHandler.destroy();
					},

					/**
				 	 * Fires when an entry is edited.
				 	 *
				 	 * @method _editEntry
					 * @param event
				 	 * @protected
				 	 */
					_editEntry: function(event) {
						var instance = this;

						var action = event.action;

						var url = instance.get('editEntryUrl');

						if (action === STR_MOVE) {
							url = instance.get(STR_MOVE_ENTRY_URL);
						}

						instance._processEntryAction(action, url);
					},

					/**
				 	 * Fires when an item is moved. Gets the move text according to
					 * whether a target is available or not. 
				 	 *
				 	 * @method _getMoveText
					 * @param selectedItemsCount
					 * @param targetAvailable
				 	 * @protected
					 * @return moveText
				 	 */
					_getMoveText: function(selectedItemsCount, targetAvailable) {
						var moveText = STR_BLANK;

						if (targetAvailable) {
							moveText = Liferay.Language.get('x-item-is-ready-to-be-moved-to-x');

							if (selectedItemsCount > 1) {
								moveText = Liferay.Language.get('x-items-are-ready-to-be-moved-to-x');
							}
						}
						else {
							moveText = Liferay.Language.get('x-item-is-ready-to-be-moved');

							if (selectedItemsCount > 1) {
								moveText = Liferay.Language.get('x-items-are-ready-to-be-moved');
							}
						}

						return moveText;
					},

					/**
				 	 * Initialize the drag/drop.  
				 	 *
				 	 * @method _initDragDrop
				 	 * @protected
				 	 */
					_initDragDrop: function() {
						var instance = this;

						var ddHandler = new A.DD.Delegate(
							{
								container: instance._portletContainer,
								nodes: SELECTOR_DRAGGABLE_NODES,
								on: {
									'drag:drophit': A.bind('_onDragDropHit', instance),
									'drag:enter': A.bind('_onDragEnter', instance),
									'drag:exit': A.bind('_onDragExit', instance),
									'drag:start': A.bind('_onDragStart', instance)
								}
							}
						);

						var dd = ddHandler.dd;

						dd.set('offsetNode', false);

						dd.removeInvalid('a');

						dd.set('groups', [instance.get(STR_PORTLET_GROUP)]);

						dd.plug(
							[
								{
									cfg: {
										moveOnEnd: false
									},
									fn: A.Plugin.DDProxy
								}
							]
						);

						var trashLink = A.one('#' + instance.get('trashLinkId'));

						if (trashLink) {
							trashLink.attr('data-title', Liferay.Language.get('recycle-bin'));

							trashLink.plug(
								A.Plugin.Drop,
								{
									groups: dd.get('groups')
								}
							).drop.on(
								{
									'drop:hit': function(event) {
										instance._moveEntriesToTrash();
									}
								}
							);

							ddHandler.on(
								['drag:start', 'drag:end'],
								function(event) {
									trashLink.toggleClass('app-view-drop-active', (event.type == 'drag:start'));
								}
							);
						}

						instance._initDropTargets();

						instance._ddHandler = ddHandler;
					},

					/**
				 	 * Initialize the drop targets.
				 	 *
				 	 * @method _initDropTargets
				 	 * @protected
				 	 */
					_initDropTargets: function() {
						var instance = this;

						if (themeDisplay.isSignedIn()) {
							var items = instance._portletContainer.all('[data-folder="true"]');

							items.each(
								function(item, index, collection) {
									item.plug(
										A.Plugin.Drop,
										{
											groups: [instance.get(STR_PORTLET_GROUP)],
											padding: '-1px'
										}
									);
								}
							);
						}
					},

					/**
				 	 * Move entries.
				 	 *
				 	 * @method _moveEntries
					 * @param folderId
				 	 * @protected
				 	 */
					_moveEntries: function(folderId) {
						var instance = this;

						var form = instance.get(STR_FORM).node;

						form.get(instance.ns('newFolderId')).val(folderId);

						instance._processEntryAction(STR_MOVE, this.get(STR_MOVE_ENTRY_URL));
					},

					/**
				 	 * Move entries to the trash.
				 	 *
				 	 * @method _moveEntriesToTrash
				 	 * @protected
				 	 */
					_moveEntriesToTrash: function() {
						var instance = this;

						instance._processEntryAction(STR_MOVE_TO_TRASH, instance.get('editEntryUrl'));
					},

					/**
				 	 * Fires when a drop target is hit.
				 	 *
				 	 * @method _onDragDropHit
					 * @param event
				 	 * @protected
				 	 */
					_onDragDropHit: function(event) {
						var instance = this;

						var proxyNode = event.target.get(STR_DRAG_NODE);

						proxyNode.removeClass(CSS_ACTIVE_AREA_PROXY);

						proxyNode.empty();

						var dropTarget = event.drop.get(STR_NODE);

						dropTarget.removeClass(CSS_ACTIVE_AREA);

						var folderId = dropTarget.attr(DATA_FOLDER_ID);

						if (folderId) {
							var folderContainer = dropTarget.ancestor(STR_DOT + instance.get(STR_DISPLAY_STYLE));

							var selectedItems = instance._ddHandler.dd.get(STR_DATA).selectedItems;

							if (selectedItems.indexOf(folderContainer) == -1) {
								instance._moveEntries(folderId);
							}
						}
					},

					/**
				 	 * Fires when an item enters a drop target during drag.
				 	 *
				 	 * @method _onDragEnter
					 * @param event
				 	 * @protected
				 	 */
					_onDragEnter: function(event) {
						var instance = this;

						var dragNode = event.drag.get(STR_NODE);
						var dropTarget = event.drop.get(STR_NODE);

						dropTarget = dropTarget.ancestor(STR_DOT + instance.get(STR_DISPLAY_STYLE)) || dropTarget;

						if (!dragNode.compareTo(dropTarget)) {
							dropTarget.addClass(CSS_ACTIVE_AREA);

							var proxyNode = event.target.get(STR_DRAG_NODE);

							var dd = instance._ddHandler.dd;

							var selectedItemsCount = dd.get(STR_DATA).selectedItemsCount;

							var moveText = instance._getMoveText(selectedItemsCount, true);

							var itemTitle = Lang.trim(dropTarget.attr('data-title'));

							proxyNode.html(Lang.sub(moveText, [selectedItemsCount, Liferay.Util.escapeHTML(itemTitle)]));
						}
					},

					/**
				 	 * Fires when a item exits a drop target during drag.
				 	 *
				 	 * @method _onDragExit
					 * @param event
				 	 * @protected
				 	 */
					_onDragExit: function(event) {
						var instance = this;

						var dropTarget = event.drop.get(STR_NODE);

						dropTarget = dropTarget.ancestor(STR_DOT + instance.get(STR_DISPLAY_STYLE)) || dropTarget;

						dropTarget.removeClass(CSS_ACTIVE_AREA);

						var proxyNode = event.target.get(STR_DRAG_NODE);

						var selectedItemsCount = instance._ddHandler.dd.get(STR_DATA).selectedItemsCount;

						var moveText = instance._getMoveText(selectedItemsCount);

						proxyNode.html(Lang.sub(moveText, [selectedItemsCount]));
					},

					/**
				 	 * Triggers when drag starts on an item.
				 	 *
				 	 * @method _onDragStart
					 * @param event
				 	 * @protected
				 	 */
					_onDragStart: function(event) {
						var instance = this;

						var target = event.target;

						var node = target.get(STR_NODE);

						Liferay.fire(
							'liferay-app-view-move:dragStart',
							{
								node: node
							}
						);

						var proxyNode = target.get(STR_DRAG_NODE);

						proxyNode.setStyles(
							{
								height: STR_BLANK,
								width: STR_BLANK
							}
						);

						var selectedItems = instance._entriesContainer.all(STR_DOT + instance.get(STR_DISPLAY_STYLE) + '.selected');

						var selectedItemsCount = selectedItems.size();

						var moveText = instance._getMoveText(selectedItemsCount);

						proxyNode.html(Lang.sub(moveText, [selectedItemsCount]));

						proxyNode.addClass(CSS_ACTIVE_AREA_PROXY);

						var dd = instance._ddHandler.dd;

						dd.set(
							STR_DATA,
							{
								selectedItemsCount: selectedItemsCount,
								selectedItems: selectedItems
							}
						);
					},

					/**
				 	 * Fires when an edit, move, or move to trash action occurs on an entry.
				 	 *
				 	 * @method _processEntryAction
					 * @param action
					 * @param url
				 	 * @protected
				 	 */
					_processEntryAction: function(action, url) {
						var instance = this;

						var form = instance.get(STR_FORM).node;

						var redirectUrl = location.href;

						if ((action === STR_DELETE || action == STR_MOVE_TO_TRASH) && !History.HTML5 && location.hash) {
							redirectUrl = instance._updateFolderIdRedirectUrl(redirectUrl);
						}

						form.attr('method', instance.get(STR_FORM).method);

						form.get(instance.ns('cmd')).val(action);
						form.get(instance.ns('redirect')).val(redirectUrl);

						var allRowIds = instance.get('allRowIds');

						var allRowsIdCheckbox = instance.ns(allRowIds + 'Checkbox');

						var processEntryIds = instance.get('processEntryIds');

						var entryIds = processEntryIds.entryIds;

						var checkBoxesIds = processEntryIds.checkBoxesIds;

						for (var i = 0, checkBoxesIdsLength = checkBoxesIds.length; i < checkBoxesIdsLength; i++) {
							var listEntryIds = Util.listCheckedExcept(form, allRowsIdCheckbox, checkBoxesIds[i]);

							form.get(entryIds[i]).val(listEntryIds);
						}

						submitForm(form, url);
					},

					/**
				 	 * Register the drag/drop event.
				 	 *
				 	 * @method _registerDragDrop
				 	 * @protected
				 	 */
					_registerDragDrop: function() {
						var instance = this;

						instance._eventHandles.push(Liferay.after(instance.ns('dataRetrieveSuccess'), instance._initDropTargets, instance));

						if (themeDisplay.isSignedIn() && this.get('updateable')) {
							instance._initDragDrop();
						}
					},

					/**
				 	 * Update the folder id redirect URL.
				 	 *
				 	 * @method _updateFolderIdRedirectUrl
					 * @param redirectUrl
				 	 * @protected
					 * @return redirectUrl
				 	 */
					_updateFolderIdRedirectUrl: function(redirectUrl) {
						var instance = this;

						var currentFolderMatch = instance.get('folderIdHashRegEx').exec(redirectUrl);

						if (currentFolderMatch) {
							var currentFolderId = currentFolderMatch[1];

							redirectUrl = redirectUrl.replace(
								this.get('folderIdRegEx'),
								function(match, folderId) {
									return match.replace(folderId, currentFolderId);
								}
							);
						}

						return redirectUrl;
					}
				}
			}
		);

		Liferay.AppViewMove = AppViewMove;
	},
	'',
	{
		requires: ['aui-base', 'dd-constrain', 'dd-delegate', 'dd-drag', 'dd-drop', 'dd-proxy', 'liferay-history-manager', 'liferay-portlet-base', 'liferay-util-list-fields']
	}
);