import Component from 'metal-component';
import core from 'metal';
import Soy from 'metal-soy';

import templates from './ToggleDisableInputs.soy';

/**
 * ToggleDisableInputs
 *
 * This class creates a switch button that enable/disable different inputs
 * based on its state.
 */
class ToggleDisableInputs extends Component {

	/**
	 * Toggles the state of the switch
	 */
	toggleSwitch() {
		this.checked = !this.checked;

		this.disableInputs_();
	}

	/**
	 * Disables the inputs based on switch state and disableOnChecked logic
	 */
	disableInputs_() {
		const {checked, disableOnChecked, inputSelector} = this;

		const inputs = document.querySelectorAll(inputSelector);

		for (let i=0; i < inputs.length; i++) {
			let input = inputs[i];

			input.disabled = disableOnChecked ? checked : !checked;
		}
	}
}

/**
 * State definition.
 * @type {!Object}
 * @static
 */
ToggleDisableInputs.STATE = {
	/**
	 * Switch state
	 * @instance
	 * @type {Boolean}
	 * @memberof ToggleDisableInputs#
	 */
	checked: {
		validator: core.isBoolean,
		value: false
	},

	/**
	 * Flag to specify the logic for disabling inputs based on switch state
	 * @instance
	 * @type {Boolean}
	 * @memberof ToggleDisableInputs#
	 */
	disableOnChecked: {
		validator: core.isBoolean,
		value: true
	},

	/**
	 * CSS Selector for the inputs to enable/disable
	 * @instance
	 * @type {String}
	 * @memberof ToggleDisableInputs#
	 */
	inputSelector: {
		validator: core.isString
	},

	/**
	 * Label of the switch
	 * @instance
	 * @type {String}
	 * @memberof ToggleDisableInputs#
	 */
	label: {
		validator: core.isString
	}
}

// Register component
Soy.register(ToggleDisableInputs, templates);

export default ToggleDisableInputs;