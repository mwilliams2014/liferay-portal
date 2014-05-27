AUI.add(
	'liferay-history',
	function(A) {

		/**
		 * The History Component.
		 *
		 * @module liferay-history
		 */

		var AObject = A.Object;
		var Lang = A.Lang;
		var QueryString = A.QueryString;

		var isValue = Lang.isValue;
		var owns = AObject.owns;

		var WIN = A.config.win;

		var LOCATION = WIN.location;

		/**
		 * A base class for `A.History`.
		 *
		 * @class A.History
		 * @extends Base
		 * @param {Object} config Object literal specifying
		 * widget configuration properties.
		 * @constructor
		 */
		var History = A.Component.create(
			{

				/**
				 * Static property used to define which component it extends.
				 *
				 * @property EXTENDS
				 * @type String
				 * @static
				 */
				EXTENDS: A.History,

				/**
				 * Static property which provides a string to identify the class.
				 *
				 * @property NAME
				 * @type String
				 * @static
				 */
				NAME: 'liferayhistory',

				prototype: {

					/**
					 * Get history.
					 *
					 * @method get
					 * @param key
					 * @return value
					 * @protected
					 */
					get: function(key) {
						var instance = this;

						var value = History.superclass.get.apply(this, arguments);

						if (!isValue(value) && isValue(key)) {
							var query = LOCATION.search;

							var queryMap = instance._parse(query.substr(1));

							if (owns(queryMap, key)) {
								value = queryMap[key];
							}
						}

						return value;
					},

					/**
					 * Parse the history.
					 *
					 * @method _parse
					 * @param str
					 * @return QueryString.parse(str, History.PAIR_SEPARATOR, History.VALUE_SEPARATOR)
					 * @protected
					 */
					_parse: A.cached(
						function(str) {
							return QueryString.parse(str, History.PAIR_SEPARATOR, History.VALUE_SEPARATOR);
						}
					)
				},

				/**
				 * Static property which provides the '&' operator string.
				 *
				 * @property PAIR_SEPARATOR
				 * @type String
				 * @static
				 */
				PAIR_SEPARATOR: '&',

				/**
				 * Static property which provides the '=' operator string.
				 *
				 * @property VALUE_SEPARATOR
				 * @type String
				 * @static
				 */
				VALUE_SEPARATOR: '='
			}
		);

		Liferay.History = History;
	},
	'',
	{
		requires: ['querystring-parse-simple']
	}
);