AUI.add(
	'liferay-icon',
	function(A) {

		/**
		 * The Icon component.
		 *
		 * @module liferay-icon
		 */

		var Icon = {
				
			/**
			 * Sets up the variables and conditions for the methods that follow.  
			 * 
			 * @method register
			 * @param config
			 */
			register: function(config) {
				var instance = this;

				var icon = A.one('#' + config.id);

				var forcePost = config.forcePost;
				var src = config.src;
				var srcHover = config.srcHover;
				var useDialog = config.useDialog;

				if (icon) {
					if (srcHover) {
						instance._onMouseOver = A.rbind('_onMouseHover', instance, srcHover);
						instance._onMouseOut = A.rbind('_onMouseHover', instance, src);

						icon.hover(instance._onMouseOver, instance._onMouseOut);
					}

					if (useDialog) {
						icon.on('click', instance._useDialog, instance);
					}
					else if (forcePost) {
						icon.on('click', instance._forcePost, instance);
					}
				}
			},

			/**
			 * Triggers when a click is fired on the icon, if the icon 
			 * is a link.
			 * If the icon is not configured to use dialog, prevent the
			 * default submission.
			 *
			 * @method _forcePost
			 * @param event
			 * @private
			 */
			_forcePost: function(event) {
				var instance = this;

				if (!Liferay.Surface || !Liferay.Surface.app) {
					Liferay.Util.forcePost(event.currentTarget);

					event.preventDefault();
				}
			},

			/**
			 * Triggers when the mouse hovers over the icon.
			 * If the current target is an image, set the img src 
			 * attribute to the src param.
			 * 
			 * @method _onMouseHover
			 * @param event
			 * @param src
			 * @private
			 */
			_onMouseHover: function(event, src) {
				var instance = this;

				var img = event.currentTarget.one('img');

				if (img) {
					img.attr('src', src);
				}
			},

			/**
			 * Triggers when a click is fired on the icon, if the icon is
			 * configured to use a dialog and opens a dialog window.
			 *
			 * @method _useDialog
			 * @param event
			 * @private
			 */
			_useDialog: function(event) {
				Liferay.Util.openInDialog(event, event.currentTarget);
			}
		};

		Liferay.Icon = Icon;
	},
	'',
	{
		requires: ['aui-base', 'liferay-util-window']
	}
);