AUI.add(
	'liferay-form',
	function(A) {
		
		/**
 		 * the Liferay Form module.
 		 *
 		 * @module liferay-form
 		 */

		var DEFAULTS_FORM_VALIDATOR = A.config.FormValidator;

		var defaultAcceptFiles = DEFAULTS_FORM_VALIDATOR.RULES.acceptFiles;

		var acceptFiles = function(val, node, ruleValue) {
			if (ruleValue == '*') {
				return true;
			}

			return defaultAcceptFiles(val, node, ruleValue);
		};

		var number = function(val, node, ruleValue) {
			var regex = /^[+\-]?(\d+)(\.\d+)?([eE][+-]?\d+)?$/;

			return regex && regex.test(val);
		};

		A.mix(
			DEFAULTS_FORM_VALIDATOR.RULES,
			{
				acceptFiles: acceptFiles,
				number: number
			},
			true
		);

		A.mix(
			DEFAULTS_FORM_VALIDATOR.STRINGS,
			{
				DEFAULT: Liferay.Language.get('please-fix-this-field'),
				acceptFiles: Liferay.Language.get('please-enter-a-file-with-a-valid-extension-x'),
				alpha: Liferay.Language.get('please-enter-only-alpha-characters'),
				alphanum: Liferay.Language.get('please-enter-only-alphanumeric-characters'),
				date: Liferay.Language.get('please-enter-a-valid-date'),
				digits: Liferay.Language.get('please-enter-only-digits'),
				email: Liferay.Language.get('please-enter-a-valid-email-address'),
				equalTo: Liferay.Language.get('please-enter-the-same-value-again'),
				max: Liferay.Language.get('please-enter-a-value-less-than-or-equal-to-x'),
				maxLength: Liferay.Language.get('please-enter-no-more-than-x-characters'),
				min: Liferay.Language.get('please-enter-a-value-greater-than-or-equal-to-x'),
				minLength: Liferay.Language.get('please-enter-at-list-x-characters'),
				number: Liferay.Language.get('please-enter-a-valid-number'),
				range: Liferay.Language.get('please-enter-a-value-between-x-and-x'),
				rangeLength: Liferay.Language.get('please-enter-a-value-between-x-and-x-characters-long'),
				required: Liferay.Language.get('this-field-is-required'),
				url: Liferay.Language.get('please-enter-a-valid-url')
			},
			true
		);
                
                /**
 		 * A base class for `A.Form`
		 *
		 * @class A.Form
		 * @extends Base
		 * @param {Object} config Object literal specifying 
		 * widget configuration properties.
		 * @constructor
		 */
		var Form = A.Component.create(
			{

				/**
 		 		 * static property used to define the default attribute
		 		 * configuration for the `A.Form`. 
		 		 *
		 		 * @property ATTRS
		 		 * @type Object
				 * @static
		 		 */
				ATTRS: {

					/**
					 * Holds the id for the form.
					 *
					 * @attribute id
					 * @default {}
					 * @type Object
					 */
					id: {},

					/**
					 * Holds name of form.
					 *
					 * @attribute namespace
					 * @default {}
					 * @type Object
					 */
					namespace: {},

					/**
					 * Holds the fieldRules for the form.
					 *
					 * @attribute fieldRules
					 * @default {}
					 * @type Object
					 */
					fieldRules: {},

					/**
					 * Returns _onSubmit method.
					 *
					 * @attribute onSubmit
					 * @type Object
					 * @return _onSubmit
					 */
					onSubmit: {
						valueFn: function() {
							var instance = this;

							return instance._onSubmit;
						}
					}
				},


				/**
				 * Static property used to define which component it extends.
				 *
				 * @property EXTENDS
				 * @type Object
				 * @static
				 */
				EXTENDS: A.Base,

				prototype: {

					/**
					 * Construction logic executed during `A.Form` instantiation.
					 * Lifecycle.
					 * 
					 * @method initializer
					 * @protected
					 */
					initializer: function() {
						var instance = this;

						var id = instance.get('id');

						var fieldRules = instance.get('fieldRules');

						var rules = {};
						var fieldStrings = {};

						for (var rule in fieldRules) {
							instance._processFieldRule(rules, fieldStrings, fieldRules[rule]);
						}

						var form = document[id];
						var formNode = A.one(form);

						instance.form = form;
						instance.formNode = formNode;

						if (formNode) {
							var formValidator = new A.FormValidator(
								{
									boundingBox: formNode,
									fieldStrings: fieldStrings,
									rules: rules
								}
							);
							instance.formValidator = formValidator;

							instance._bindForm();
						}
					},

					/**
              				 * Bind the events on the `A.Form` Lifecycle. 
					 *
					 * @method _bindForm
					 * @protected
					 */
					_bindForm: function() {
						var instance = this;

						var formNode = instance.formNode;
						var formValidator = instance.formValidator;

						formValidator.on('submit', A.bind('_onValidatorSubmit', instance));

						formNode.delegate(['blur', 'focus'], A.bind('_onFieldFocusChange', instance), 'button,input,select,textarea');
					},

					/**
					 * Default submission method for the form.
					 * 
					 * @method _defaultSubmitFn
					 * @param event
					 * @protected
  					 */
					_defaultSubmitFn: function(event) {
						var instance = this;

						if (!event.stopped) {
							submitForm(instance.form);
						}
					},

					/**
					 * Changes focus to a newly selected field.
					 * 
					 * @method _onFieldFocusChange
					 * @param event
					 * @protected
  					 */
					_onFieldFocusChange: function(event) {
						var instance = this;

						var row = event.currentTarget.ancestor('.field');

						if (row) {
							row.toggleClass('field-focused', (event.type == 'focus'));
						}
					},

					/**
					 * Triggers when the form is submitted.
					 *
					 * @method _onSubmit
					 * @param event
					 * @protected
  					 */
					_onSubmit: function(event) {
						var instance = this;

						event.preventDefault();

						setTimeout(
							function() {
								instance._defaultSubmitFn.call(instance, event);
							},
							0
						);
					},

					/**
					 * Triggers when the form is submitted.
					 *
					 * @method _onValidatorSubmit
					 * @param event
					 * @protected
  					 */
					_onValidatorSubmit: function(event) {
						var instance = this;

						var onSubmit = instance.get('onSubmit');

						onSubmit.call(instance, event.validator.formEvent);
					},

					/**
					 * Processes the fieldRules attribute for 
					 * the form.
					 *
					 * @method _processFieldRule
					 * @param rules
					 * @param strings
					 * @param rule
					 * @protected
  					 */
					_processFieldRule: function(rules, strings, rule) {
						var instance = this;

						var value = true;

						var fieldName = rule.fieldName;
						var validatorName = rule.validatorName;

						if (rule.body && !rule.custom) {
							value = rule.body;
						}

						var fieldRules = rules[fieldName];

						if (!fieldRules) {
							fieldRules = {};

							rules[fieldName] = fieldRules;
						}

						fieldRules[validatorName] = value;

						fieldRules.custom = rule.custom;

						if (rule.custom) {
							DEFAULTS_FORM_VALIDATOR.RULES[validatorName] = rule.body;
						}

						var errorMessage = rule.errorMessage;

						if (errorMessage) {
							var fieldStrings = strings[fieldName];

							if (!fieldStrings) {
								fieldStrings = {};

								strings[fieldName] = fieldStrings;
							}

							fieldStrings[validatorName] = errorMessage;
						}
					}
				},

				/**
				 * Gets the id of the form.
				 *
				 * @method get
				 * @param id
				 * @return _INSTANCES[id]
				 * @protected
				 */
				get: function(id) {
					var instance = this;

					return instance._INSTANCES[id];
				},

				/**
				 * Registers the form.
				 *
				 * @method register
				 * @param config
				 * @return form 
				 * @protected
				 */
				register: function(config) {
					var instance = this;

					var form = new Liferay.Form(config);

					var formName = config.id || config.namespace;

					instance._INSTANCES[formName] = form;

					Liferay.fire(
						'form:registered',
						{
							form: form,
							formName: formName
						}
					);

					return form;
				},

				/**
				 * Creates a new empty Object.
				 *
				 * @method _INSTANCES
				 */
				_INSTANCES: {}
			}
		);

		Liferay.Form = Form;
	},
	'',
	{
		requires: ['aui-base', 'aui-form-validator']
	}
);