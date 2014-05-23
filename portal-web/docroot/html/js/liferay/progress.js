AUI.add(
	'liferay-progress',
	function(A) {

		/**
		 * the Liferay Progress module.
		 *
		 * @module liferay-progress
		 */

		var Lang = A.Lang;

		var STR_EMPTY = '';

		var STR_VALUE = 'value';

		var STR_UPDATE_PERIOD = 'updatePeriod';

		var TPL_FRAME = '<iframe frameborder="0" height="0" id="{0}-poller" src="javascript:;" style="display:none" tabindex="-1" title="empty" width="0"></iframe>';

		var TPL_URL_UPDATE = themeDisplay.getPathMain() + '/portal/progress_poller?progressId={0}&sessionKey={1}&updatePeriod={2}';

		/**
		 * A base class for `A.Progress`
		 *
		 * @class A.Progress
		 * @extends Base
		 * @param {Object} config Object literal specifying
		 * widget configuration properties.
		 * @constructor
		 */
		var Progress = A.Component.create(
			{
				
				/**
				 * Static property used to define the default attribute 
				 * configuration for the `A.Progress`.
				 *
				 * @property ATTRS
				 * @type Object
				 * @static
				 */
				ATTRS: {

					/**
					 * Displays the progress value in a string. 
					 *
					 * @attribute message
					 * @default " "
					 * @type String
					 */
					message: {
						validator: Lang.isString,
						value: STR_EMPTY
					},

					/**
					 * Holds a string value of the sessionKey.
					 *
					 * @attribute sessionKey
					 * @default " "
					 * @type String
					 */
					sessionKey: {
						validator: Lang.isString,
						value: STR_EMPTY
					},

					/**
					 * Defines the time it takes to update the progress in ms.
					 *
					 * @attribute updatePeriod
					 * @default 1000
					 * @type Number
					 */
					updatePeriod: {
						validator: Lang.isNumber,
						value: 1000
					}
				},

				/**
				 * static property used to define which component it extends.
				 *
				 * @property EXTENDS
				 * @type Object
				 * @static
				 */
				EXTENDS: A.ProgressBar,

				/**
				 * static property which provides a string to identify the class.
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				NAME: 'progress',

				prototype: {

					/**
					 * Render the Progress component instance. Lifecycle.
					 *
					 * @method renderUI
					 * @protected
					 */
					renderUI: function() {
						var instance = this;

						Progress.superclass.renderUI.call(instance, arguments);

						var tplFrame = Lang.sub(TPL_FRAME, [instance.get('id')]);

						var frame = A.Node.create(tplFrame);

						instance.get('boundingBox').placeBefore(frame);

						instance._frame = frame;
					},

					/**
					 * Bind the events on the Progress UI. Lifecycle.
					 *
					 * @method bindUI
					 * @protected
					 */
					bindUI: function() {
						var instance = this;

						Progress.superclass.bindUI.call(instance, arguments);

						instance.after('complete', instance._afterComplete);
						instance.after('valueChange', instance._afterValueChange);

						instance._iframeLoadHandle = instance._frame.on('load', instance._onIframeLoad, instance);
					},

					/**
					 * Start the progress.
					 *
					 * @method startProgress
					 * @protected
					 */
					startProgress: function() {
						var instance = this;

						if (!instance.get('rendered')) {
							instance.render();
						}

						instance.set(STR_VALUE, 0);

						instance.get('boundingBox').addClass('lfr-progress-active');

						setTimeout(
							function() {
								instance.updateProgress();
							},
							instance.get(STR_UPDATE_PERIOD)
						);
					},

					/**
					 * Update the progress.
					 *
					 * @method updateProgress
					 * @protected
					 */
					updateProgress: function() {
						var instance = this;

						var url = Lang.sub(
							TPL_URL_UPDATE,
							[
								instance.get('id'),
								instance.get('sessionKey'),
								instance.get(STR_UPDATE_PERIOD)
							]
						);

						instance._frame.set('src', url);
					},

					/**
					 * After the progress completes remove the UI for the progress.
					 *
					 * @method _afterComplete
					 * @protected
					 */
					_afterComplete: function(event) {
						var instance = this;

						instance.get('boundingBox').removeClass('lfr-progress-active');

						instance.set('label', instance.get('strings.complete'));

						instance._iframeLoadHandle.detach();
					},

					/**
					 * Update the message label with the current progress value.
					 *
					 * @method _afterValueChange
					 * @protected
					 */
					_afterValueChange: function(event) {
						var instance = this;

						var label = instance.get('message');

						if (!label) {
							label = event.newVal + '%';
						}

						instance.set('label', label);
					},

					/**
					 * Fires after the `updatePeriod` has completed and sets the 
					 * location of the contentWindow for the progress.
					 *
					 * @method _onIframeLoad
					 * @protected
					 */
					_onIframeLoad: function(event) {
						var instance = this;

						setTimeout(
							function() {
								instance._frame.get('contentWindow.location').reload();
							},
							instance.get(STR_UPDATE_PERIOD)
						);
					}
				}
			}
		);

		Liferay.Progress = Progress;
	},
	'',
	{
		requires: ['aui-progressbar']
	}
);