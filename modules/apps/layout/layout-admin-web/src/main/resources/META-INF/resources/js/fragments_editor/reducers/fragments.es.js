import {
	ADD_FRAGMENT_ENTRY_LINK,
	MOVE_FRAGMENT_ENTRY_LINK,
	REMOVE_FRAGMENT_ENTRY_LINK,
	UPDATE_EDITABLE_VALUE
} from '../actions/actions.es';
import {DRAG_POSITIONS} from './placeholders.es';
import {EDITABLE_FRAGMENT_ENTRY_PROCESSOR} from '../components/fragment_entry_link/FragmentEntryLink.es';

/**
 * @param {!object} state
 * @param {!string} actionType
 * @param {!object} payload
 * @param {!string} payload.fragmentEntryLinkId
 * @param {!string} payload.fragmentEntryLinkName
 * @return {object}
 * @review
 */

function addFragmentEntryLinkReducer(state, actionType, payload) {
	return new Promise(
		(resolve, reject) => {
			let nextState = Object.assign({}, state);

			if (actionType === ADD_FRAGMENT_ENTRY_LINK) {
				let fragmentEntryLink;

				const nextData = Object.assign(
					{},
					state.layoutData,
					{
						structure: [
							...(state.layoutData.structure || [])
						]
					}
				);

				_addFragmentEntryLink(
					state.addFragmentEntryLinkURL,
					payload.fragmentEntryId,
					payload.fragmentName,
					state.classNameId,
					state.classPK,
					state.portletNamespace
				)
					.then(
						response => {
							fragmentEntryLink = response;

							const position = _getDropFragmentPosition(
								nextData.structure,
								state.hoveredFragmentEntryLinkId,
								state.hoveredFragmentEntryLinkBorder
							);

							nextData.structure.splice(
								position,
								0,
								fragmentEntryLink.fragmentEntryLinkId
							);

							return _updateData(
								state.updateLayoutPageTemplateDataURL,
								state.portletNamespace,
								state.classNameId,
								state.classPK,
								nextData
							);
						}
					)
					.then(
						() => {
							return _getFragmentEntryLinkContent(
								state.renderFragmentEntryURL,
								fragmentEntryLink,
								state.portletNamespace
							);
						}
					)
					.then(
						response => {
							fragmentEntryLink = response;

							nextState.fragmentEntryLinks = Object.assign(
								{},
								nextState.fragmentEntryLinks,
								{[fragmentEntryLink.fragmentEntryLinkId]: fragmentEntryLink}
							);

							nextState.layoutData = nextData;

							resolve(nextState);
						}
					).catch(
						() => {
							resolve(nextState);
						}
					);
			}
			else {
				resolve(nextState);
			}
		}
	);
}

/**
 * @param {!object} state
 * @param {!string} actionType
 * @param {!object} payload
 * @param {!string} payload.placeholderId
 * @param {!string} payload.placeholderId
 * @param {!string} payload.placeholderId
 * @return {object}
 * @review
 */

function moveFragmentEntryLinkReducer(state, actionType, payload) {
	return new Promise(
		(resolve, reject) => {
			if (actionType === MOVE_FRAGMENT_ENTRY_LINK) {
				let nextState = Object.assign({}, state);

				const nextData = Object.assign(
					{},
					state.layoutData,
					{
						structure: [
							...(state.layoutData.structure || [])
						]
					}
				);

				if (payload.targetId && (payload.placeholderId != payload.targetId)) {
					const placeholderIndex = nextData.structure.indexOf(
						payload.placeholderId
					);

					nextData.structure.splice(placeholderIndex, 1);

					const targetIndex = nextData.structure.indexOf(
						payload.targetId
					);

					if (payload.targetBorder === DRAG_POSITIONS.top) {
						nextData.structure.splice(targetIndex, 0, payload.placeholderId);
					}
					else {
						nextData.structure.splice(targetIndex + 1, 0, payload.placeholderId);
					}
				}

				_moveFragmentEntryLink(
					state.updateLayoutPageTemplateDataURL,
					state.portletNamespace,
					state.classNameId,
					state.classPK,
					nextData
				).then(
					(response) => {
						if (response.error) {
							throw response.error;
						}

						nextState.layoutData = nextData;
						resolve(nextState);
					}
				).catch(
					() => {
						resolve(state);
					}
				);
			}
			else {
				resolve(state);
			}
		}
	);
}

/**
 * @param {!object} state
 * @param {!string} actionType
 * @param {!object} payload
 * @param {!string} payload.fragmentEntryLinkId
 * @return {object}
 * @review
 */

function removeFragmentEntryLinkReducer(state, actionType, payload) {
	return new Promise(
		resolve => {
			if (actionType === REMOVE_FRAGMENT_ENTRY_LINK) {
				const fragmentEntryLinkId = payload.fragmentEntryLinkId;
				const nextState = Object.assign({}, state);

				const nextData = Object.assign(
					{},
					state.layoutData,
					{
						structure: [
							...(state.layoutData.structure || [])
						]
					}
				);

				const index = state.layoutData.structure.indexOf(
					fragmentEntryLinkId
				);

				nextData.structure.splice(index, 1);

				_removeFragmentEntryLink(
					state.deleteFragmentEntryLinkURL,
					state.portletNamespace,
					state.classNameId,
					state.classPK,
					fragmentEntryLinkId,
					nextData
				).then(
					(response) => {
						nextState.layoutData = nextData;

						delete nextState.fragmentEntryLinks[payload.fragmentEntryLinkId];

						resolve(nextState);
					}
				).catch(
					() => {
						resolve(nextState);
					}
				);
			}
			else {
				resolve(state);
			}
		}
	);
}

/**
 * @param {!object} state
 * @param {!string} actionType
 * @param {object} payload
 * @param {string} payload.fragmentEntryLinkId
 * @param {string} payload.editableId
 * @param {string} payload.editableValue
 * @param {string} payload.editableValueId
 * @return {object}
 * @review
 */

function updateEditableValueReducer(state, actionType, payload) {
	let nextState = state;

	return new Promise(
		resolve => {
			if (actionType === UPDATE_EDITABLE_VALUE) {
				const editableId = payload.editableId;
				const editableValue = payload.editableValue;
				const editableValueId = payload.editableValueId;
				const editableValues = state.fragmentEntryLinks[payload.fragmentEntryLinkId].editableValues;

				const nextEditableValues = _setIn(
					editableValues,
					[
						EDITABLE_FRAGMENT_ENTRY_PROCESSOR,
						editableId,
						editableValueId
					],
					editableValue
				);

				const formData = new FormData();

				formData.append(
					`${state.portletNamespace}fragmentEntryLinkId`,
					payload.fragmentEntryLinkId
				);

				formData.append(
					`${state.portletNamespace}editableValues`,
					JSON.stringify(nextEditableValues)
				);

				fetch(
					state.editFragmentEntryLinkURL,
					{
						body: formData,
						credentials: 'include',
						method: 'POST'
					}
				).then(
					() => {
						nextState = _setIn(
							nextState,
							[
								'fragmentEntryLinks',
								payload.fragmentEntryLinkId,
								'editableValues'
							],
							nextEditableValues
						);

						resolve(nextState);
					}
				);
			}
			else {
				resolve(nextState);
			}
		}
	);
}

function _addFragmentEntryLink(
	addFragmentEntryLinkURL,
	fragmentEntryId,
	fragmentName,
	classNameId,
	classPK,
	portletNamespace
) {
	const formData = new FormData();

	formData.append(`${portletNamespace}fragmentId`, fragmentEntryId);
	formData.append(`${portletNamespace}classNameId`, classNameId);
	formData.append(`${portletNamespace}classPK`, classPK);

	return fetch(
		addFragmentEntryLinkURL,
		{
			body: formData,
			credentials: 'include',
			method: 'POST'
		}
	).then(
		response => {
			return response.json();
		}
	).then(
		response => {
			if (!response.fragmentEntryLinkId) {
				throw new Error();
			}

			return {
				config: {},
				content: '',
				editableValues: JSON.parse(response.editableValues),
				fragmentEntryId: fragmentEntryId,
				fragmentEntryLinkId: response.fragmentEntryLinkId,
				name: fragmentName
			};
		}
	);
}

function _getDropFragmentPosition(
	structure,
	targetFragmentEntryLinkId,
	targetBorder
) {
	let position = structure.length;
	const targetPosition = structure.indexOf(targetFragmentEntryLinkId);

	if (targetPosition > -1 && targetBorder) {
		if (targetBorder === DRAG_POSITIONS.top) {
			position = targetPosition;
		}
		else {
			position = targetPosition + 1;
		}
	}

	return position;
}

function _getFragmentEntryLinkContent(
	renderFragmentEntryURL,
	fragmentEntryLink,
	portletNamespace
) {
	const formData = new FormData();

	formData.append(
		`${portletNamespace}fragmentEntryLinkId`,
		fragmentEntryLink.fragmentEntryLinkId
	);

	return fetch(
		renderFragmentEntryURL,
		{
			body: formData,
			credentials: 'include',
			method: 'POST'
		}
	).then(
		response => response.json()
	).then(
		response => {
			if (!response.content) {
				throw new Error();
			}

			return Object.assign(
				{},
				fragmentEntryLink,
				{content: response.content}
			);
		}
	);
}

function _moveFragmentEntryLink(
	moveFragmentEntryLinkURL,
	portletNamespace,
	classNameId,
	classPK,
	layoutData
) {
	const formData = new FormData();

	formData.append(`${portletNamespace}classNameId`, classNameId);
	formData.append(`${portletNamespace}classPK`, classPK);
	formData.append(`${portletNamespace}data`, JSON.stringify(layoutData));

	return fetch(
		moveFragmentEntryLinkURL,
		{
			body: formData,
			credentials: 'include',
			method: 'POST'
		}
	);
}

function _removeFragmentEntryLink(
	deleteFragmentEntryLinkURL,
	portletNamespace,
	classNameId,
	classPK,
	fragmentEntryLinkId,
	layoutData
) {
	const formData = new FormData();

	formData.append(`${portletNamespace}classNameId`, classNameId);
	formData.append(`${portletNamespace}classPK`, classPK);
	formData.append(`${portletNamespace}data`, JSON.stringify(layoutData));

	formData.append(
		`${portletNamespace}fragmentEntryLinkId`,
		fragmentEntryLinkId
	);

	return fetch(
		deleteFragmentEntryLinkURL,
		{
			body: formData,
			credentials: 'include',
			method: 'POST'
		}
	);
}

/**
 * Recursively inserts a value inside an object creating
 * a copy of the original target.
 * @param {!object} Original object that will be copied
 * @param {!string[]} Array of strings used for reaching the deep property
 * @param {*} value Value to be inserted
 * @return {!object} Copy of the original object with the new value
 * @review
 */

function _setIn(object, keyPath, value) {
	const nextKey = keyPath[0];
	const target = Object.assign({}, object);

	let nextValue = value;

	if (keyPath.length > 1) {
		nextValue = _setIn(
			object[nextKey] || {},
			keyPath.slice(1),
			value
		);
	}

	target[nextKey] = nextValue;

	return target;
}

/**
 * Update layoutData
 * @param {!string} updateLayoutPageTemplateDataURL
 * @param {!string} portletNamespace
 * @param {!string} classNameId
 * @param {!string} classPK
 * @param {!object} data
 * @private
 * @return {Promise}
 * @review
 */

function _updateData(
	updateLayoutPageTemplateDataURL,
	portletNamespace,
	classNameId,
	classPK,
	data
) {
	const formData = new FormData();

	formData.append(`${portletNamespace}classNameId`, classNameId);
	formData.append(`${portletNamespace}classPK`, classPK);

	formData.append(
		`${portletNamespace}data`,
		JSON.stringify(data)
	);

	return fetch(
		updateLayoutPageTemplateDataURL,
		{
			body: formData,
			credentials: 'include',
			method: 'POST'
		}
	);
}

export {
	addFragmentEntryLinkReducer,
	moveFragmentEntryLinkReducer,
	removeFragmentEntryLinkReducer,
	updateEditableValueReducer
};