import Builder from '../Builder.es';
import dom from 'metal-dom';
import Pages from './__mock__/mockPages.es';
import SucessPageSettings from './__mock__/mockSuccessPage.es';

const spritemap = 'icons.svg';

let addButton;
let basicInfo;
let component;
let pages;
let translationManager;
let successPageSettings;

const mockFieldType = {
	description: 'Single line or multiline text area.',
	icon: 'text',
	label: 'Text Field',
	name: 'text',
	settingsContext: {
		pages: [
			{
				rows: [
					{
						columns: [
							{
								fields: [
									{
										fieldName: 'label',
										localizable: true
									},
									{
										fieldName: 'name'
									},
									{
										fieldName: 'required'
									},
									{
										fieldName: 'type'
									}
								]
							}
						]
					}
				]
			}
		]
	},
	type: 'text'
};

const fieldTypes = [
	{
		description: 'Select date from a Datepicker.',
		icon: 'calendar',
		label: 'Date',
		name: 'date',
		settingsContext: {
			pages: []
		}
	},
	mockFieldType,
	{
		description: 'Select only one item with a radio button.',
		icon: 'radio-button',
		label: 'Single Selection',
		name: 'radio',
		settingsContext: {
			pages: []
		}
	},
	{
		description: 'Choose one or more options from a list.',
		icon: 'list',
		label: 'Select from list',
		name: 'select',
		settingsContext: {
			pages: []
		}
	},
	{
		description: 'Select options from a matrix.',
		icon: 'grid',
		label: 'Grid',
		name: 'grid',
		settingsContext: {
			pages: []
		}
	},
	{
		description: 'Select multiple options using a checkbox.',
		icon: 'select-from-list',
		label: 'Multiple Selection',
		name: 'checkbox',
		settingsContext: {
			pages: []
		}
	}
];

describe(
	'Builder',
	() => {
		beforeEach(
			() => {
				pages = JSON.parse(JSON.stringify(Pages));
				successPageSettings = JSON.parse(JSON.stringify(SucessPageSettings));

				jest.useFakeTimers();

				dom.enterDocument('<button id="addFieldButton"></button>');
				dom.enterDocument('<div class="ddm-translation-manager"></div>');
				dom.enterDocument('<div class="ddm-form-basic-info"></div>');

				addButton = document.querySelector('#addFieldButton');
				basicInfo = document.querySelector('.ddm-form-basic-info');
				translationManager = document.querySelector('.ddm-translation-manager');

				component = new Builder(
					{
						fieldTypes,
						pages,
						paginationMode: 'wizard',
						spritemap,
						successPageSettings
					}
				);
			}
		);

		afterEach(
			() => {
				dom.exitDocument(addButton);
				dom.exitDocument(basicInfo);
				dom.exitDocument(translationManager);

				if (component) {
					component.dispose();
				}

				jest.clearAllTimers();
			}
		);

		it(
			'should render the default markup',
			() => {
				expect(component).toMatchSnapshot();
			}
		);

		it(
			'should continue to propagate the fieldAdded event',
			() => {
				const {sidebar} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				sidebar.emit(
					'fieldAdded',
					{
						fieldType: mockFieldType
					}
				);

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('fieldAdded', expect.anything());
			}
		);

		it(
			'should continue to propagate the fieldBlurred event',
			() => {
				const {sidebar} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				sidebar.emit('fieldBlurred');

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('fieldBlurred');
			}
		);

		it(
			'should continue to propagate the fieldClicked event',
			() => {
				const {FormRenderer} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				FormRenderer.emit('fieldClicked', 1);

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('fieldClicked', 1);
			}
		);

		it(
			'should continue to propagate the pageAdded event',
			() => {
				const {FormRenderer} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				FormRenderer.emit('pageAdded');

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('pageAdded');
			}
		);

		it(
			'should continue to propagate the pageDeleted event',
			() => {
				const {FormRenderer} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				FormRenderer.emit('pageDeleted');

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('pageDeleted', expect.anything());
			}
		);

		it(
			'should continue to propagate the pagesUpdated event',
			() => {
				const {FormRenderer} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				FormRenderer.emit('pagesUpdated');

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('pagesUpdated', expect.anything());
			}
		);

		it(
			'should continue to propagate the activePageUpdated event',
			() => {
				const {FormRenderer} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				FormRenderer.emit('activePageUpdated');

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('activePageUpdated', expect.anything());
			}
		);

		it(
			'should continue to propagate the fieldDuplicated event',
			() => {
				const {FormRenderer} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				FormRenderer.emit('fieldDuplicated');

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('fieldDuplicated', expect.anything());
			}
		);

		it(
			'should continue to propagate the fieldEdited event',
			() => {
				const {sidebar} = component.refs;
				const spy = jest.spyOn(component, 'emit');

				component.props.focusedField = mockFieldType;

				sidebar.emit(
					'fieldEdited',
					{
						fieldInstance: {
							...mockFieldType,
							fieldName: 'label'
						}
					}
				);

				jest.runAllTimers();

				expect(spy).toHaveBeenCalledWith('fieldEdited', expect.anything());
			}
		);

		it(
			'should continue to propagate the fieldMoved event',
			() => {
				const spy = jest.spyOn(component, 'emit');
				const {FormRenderer} = component.refs;
				const mockEvent = jest.fn();

				FormRenderer.emit('fieldMoved', mockEvent);

				expect(spy).toHaveBeenCalled();
				expect(spy).toHaveBeenCalledWith('fieldMoved', expect.anything());
			}
		);

		it(
			'should open sidebar when the "pageReset" event is received',
			() => {
				const {FormRenderer, sidebar} = component.refs;

				FormRenderer.emit('pageReset');

				jest.runAllTimers();

				expect(sidebar.state.open).toBeTruthy();
			}
		);

		it(
			'should open sidebar when activePage changes and new page has no fields',
			() => {
				const spy = jest.spyOn(component, 'openSidebar');

				component.props.pages = [
					...pages,
					{
						rows: []
					}
				];
				component.props.activePage = 1;

				jest.runAllTimers();

				expect(spy).toHaveBeenCalled();
			}
		);

		it(
			'should not open sidebar when activePage changes and new page has fields',
			() => {
				const spy = jest.spyOn(component, 'openSidebar');

				component.props.pages = [
					...pages,
					...pages
				];
				component.props.activePage = 1;

				jest.runAllTimers();

				expect(spy).not.toHaveBeenCalled();
			}
		);

		it(
			'should show modal when trash button gets clicked',
			() => {
				const {FormRenderer} = component.refs;

				FormRenderer.emit(
					'fieldDeleted',
					{
						columnIndex: 0,
						pageIndex: 1,
						rowIndex: 0
					}
				);

				jest.runAllTimers();

				const modal = document.querySelector('.modal');

				expect(modal.classList.contains('show')).toEqual(true);

				expect(component).toMatchSnapshot();
			}
		);

		it(
			'should emit deleteField event when yes is clicked in the modal',
			() => {
				const spy = jest.spyOn(component, 'emit');
				const {FormRenderer} = component.refs;
				const mockEvent = jest.fn();

				FormRenderer.emit('deleteFieldClicked', mockEvent);

				component.element.querySelectorAll('.modal-content .btn-group .btn-group-item button')[1].click();

				jest.runAllTimers();

				expect(spy).toHaveBeenCalled();
				expect(spy).toHaveBeenCalledWith('fieldDeleted', expect.anything());
			}
		);

		it(
			'should not open sidebar when the delete current page option item is clicked',
			() => {
				const spy = jest.spyOn(component, 'openSidebar');

				const componentPages = [...pages, ...pages];

				const builderComponent = new Builder(
					{
						fieldTypes,
						pages: componentPages,
						paginationMode: 'wizard',
						spritemap,
						successPageSettings
					}
				);
				const data = {
					item: {
						settingsItem: 'reset-page'
					}
				};
				const {FormRenderer} = builderComponent.refs;

				FormRenderer._handlePageSettingsClicked(
					{
						data
					}
				);

				jest.runAllTimers();

				expect(spy).not.toHaveBeenCalled();
			}
		);
	}
);