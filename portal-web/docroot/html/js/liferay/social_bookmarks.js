AUI.add(
	'liferay-social-bookmarks',
	function(A) {

		/**
		 * The Social Bookmarks Component. 
		 *
		 * @module liferay-social-bookmarks
		 */

		var NAME = 'social-bookmarks';

		var SHARE_WINDOW_HEIGHT = 436;

		var SHARE_WINDOW_WIDTH = 626;

		var WIN = A.getWin();

		/**
		 * A base class for `A.SocialBookmarks`.
		 *
		 * @class A.SocialBookmarks
		 * @extends Base
		 * @param {Object} config object literal specifying
		 * widget configuration properties.
		 * @constructor
		 */
		var SocialBookmarks = A.Component.create(
			{

				/**
				 * A static property used to define the default attribute
				 * configuration for `A.SocialBookmarks`.
				 *
				 * @property ATTRS
				 * @type Object
				 * @static
				 */
				ATTRS: {

					/**
					 * The direct descendant of a widget's bounding box
					 * and houses its content.
					 *
					 * @attribute contentBox 
					 */
					contentBox: {
						setter: A.one
					}
				},

				/**
				 * A static property used to define which component it extends. 
				 *
				 * @property EXTENDS
				 * @type String
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
				NAME: NAME,

				prototype: {

					/**
				 	 * Construction logic executed during SocialBookmarks instantiation. 
				 	 * Lifecycle.
				 	 *
				 	 * @method initializer
				 	 * @protected
				 	 */
					initializer: function() {
						var instance = this;

						var portletBody = instance.get('contentBox').ancestor('.portlet-body');

						var id = portletBody.guid();

						if (!SocialBookmarks.registered[id]) {
							portletBody.delegate(
								'click',
								function(event) {
									event.preventDefault();

									var shareWindowFeatures = [
										'left=' + ((WIN.get('innerWidth') / 2) - (SHARE_WINDOW_WIDTH / 2)),
										'height=' + SHARE_WINDOW_HEIGHT,
										'toolbar=0',
										'top=' + ((WIN.get('innerHeight') / 2) - (SHARE_WINDOW_HEIGHT / 2)),
										'status=0',
										'width=' + SHARE_WINDOW_WIDTH
									];

									var url = event.currentTarget.attr('href');

									WIN.getDOM().open(url, null, shareWindowFeatures.join()).focus();
								},
								'.social-bookmark a'
							);

							SocialBookmarks.registered[id] = true;
						}
					}
				},

				registered: {}
			}
		);

		Liferay.SocialBookmarks = SocialBookmarks;
	},
	'',
	{
		requires: ['aui-component', 'aui-node']
	}
);