AUI.add(
	'liferay-sign-in-modal',
	function(A) {

		/**
		 * the Liferay Sign in Modal module
		 *
		 * @module liferay-sign-in-modal
		 */

		var	NAME = 'signinmodal';

		var WIN = A.config.win;

		/**
		 * A base class for `A.SignInModal`
		 *
		 * @class A.SignInModal
		 * @extends Base
		 * @param {Object} config Object literal specifying
		 * widget configuration properties.
		 * @constructor
		 */
		var SignInModal = A.Component.create(
			{

				/**
				 * static property used to define the default attribute 
				 * configuration for the `A.SignInModal`.
				 *
				 * @property ATTRS
				 * @type Object
				 * @static
				 */
				ATTRS: {
					resetFormValidator: {
						value: true
					},

					signInPortlet: {
						setter: A.one,
						value: '#p_p_id_58_'
					}
				},

				/**
				 * static property used to define which component it extends. 
				 *
				 * @property EXTENDS
				 * @type Object
				 * @static
				 */
				EXTENDS: A.Plugin.Base,

				/**
				 * static property which provides a string to identify the class. 
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				NAME: NAME,

				/**
				 * Static property provides a string to identify the namespace. 
				 *
				 * @property NS
				 * @type String
				 * @static
				 */
				NS: NAME,

				prototype: {

					/**
				 	 * Construction logic executed during SignInModal instantiation.
				 	 * Lifecycle.
				 	 *
				 	 * @method initializer
				 	 * @protected
				 	 */
					initializer: function(config) {
						var instance = this;

						var signInPortlet = instance.get('signInPortlet');

						if (signInPortlet) {
							instance._signInPortletBody = signInPortlet.one('.portlet-body');
						}

						var host = instance.get('host');

						instance._host = host;
						instance._signInPortlet = signInPortlet;

						instance._signInURL = host.attr('href');

						if (signInPortlet) {
							var formNode = signInPortlet.one('form');

							if (formNode) {
								var form = Liferay.Form.get(formNode.attr('id'));

								instance._formValidator = form.formValidator;

								instance._hasSignInForm = formNode.hasClass('sign-in-form');
							}
						}

						instance._bindUI();
					},

					/**
				 	 * Bind the events on the SignInModal UI. Lifecycle.
				 	 *
				 	 * @method _bindUI
				 	 * @protected
				 	 */
					_bindUI: function() {
						var instance = this;

						instance._host.on('click', A.bind('_load', instance));
					},

					/**
				 	 * If the sign in nodes are loaded, call the `_loadDOM` method.
				 	 *
				 	 * @method _load
				 	 * @protected
				 	 */
					_load: function(event) {
						var instance = this;

						event.preventDefault();

						if (instance._signInPortletBody && instance._hasSignInForm) {
							instance._loadDOM();
						}
						else {
							instance._loadIO();
						}
					},

					/**
				 	 * Load the DOM.
				 	 *
				 	 * @method _loadDOM
				 	 * @protected
				 	 */
					_loadDOM: function() {
						var instance = this;

						var signInPortletBody = instance._signInPortletBody;

						if (!instance._originalParentNode) {
							instance._originalParentNode = signInPortletBody.ancestor();
						}

						instance._setModalContent(signInPortletBody);

						Liferay.Util.focusFormField('input:text');
					},

					/**
				 	 * Fires if the sign in nodes have not been loaded.
				 	 *
				 	 * @method _loadIO
				 	 * @protected
				 	 */
					_loadIO: function() {
						var instance = this;

						var modalSignInURL = Liferay.Util.addParams('windowState=exclusive', instance._signInURL);

						A.io.request(
							modalSignInURL,
							{
								on: {
									failure: A.bind('_redirectPage', instance),
									success: function(event, id, obj) {
										var responseData = this.get('responseData');

										if (responseData) {
											instance._setModalContent(responseData);
										}
										else {
											instance._redirectPage();
										}
									}
								}
							}
						);
					},

					/**
				 	 * Redirect the browser to the host URL.
				 	 *
				 	 * @method _redirectPage
				 	 * @protected
				 	 */
					_redirectPage: function() {
						var instance = this;

						WIN.location.href = instance._signInURL;
					},

					/**
				 	 * Fires after the DOM is loaded and sets the sign-in content for the DOM.
				 	 *
				 	 * @method _setModalContent
				 	 * @protected
				 	 */
					_setModalContent: function(content) {
						var instance = this;

						var dialog = Liferay.Util.getWindow(NAME);

						if (!dialog) {
							Liferay.Util.openWindow(
								{
									dialog: {
										after: {
											visibleChange: function(event) {
												var signInPortletBody = instance._signInPortletBody;

												var formValidator = instance._formValidator;

												if (formValidator && instance.get('resetFormValidator')) {
													formValidator.resetAllFields();
												}

												if (!event.newVal && signInPortletBody) {
													var originalParentNode = instance._originalParentNode;

													if (originalParentNode) {
														originalParentNode.append(signInPortletBody);
													}
												}
											}
										},
										height: 390,
										width: 560
									},
									id: NAME,
									title: Liferay.Language.get('sign-in')
								},
								function(dialogWindow) {
									var bodyNode = dialogWindow.bodyNode;

									bodyNode.plug(A.Plugin.ParseContent);

									bodyNode.setContent(content);
								}
							);
						}
						else {
							dialog.bodyNode.setContent(content);

							dialog.show();
						}
					}
				}
			}
		);

		Liferay.SignInModal = SignInModal;
	},
	'',
	{
		requires: ['aui-base', 'aui-component', 'aui-io-request', 'aui-parse-content', 'liferay-portlet-url', 'liferay-util-window', 'plugin']
	}
);