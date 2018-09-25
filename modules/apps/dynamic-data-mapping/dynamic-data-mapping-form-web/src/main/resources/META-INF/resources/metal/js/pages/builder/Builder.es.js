import {Config} from 'metal-state';
import {EventHandler} from 'metal-events';
import {focusedFieldStructure, pageStructure} from '../../util/config.es';
import {PagesVisitor} from '../../util/visitors.es';
import autobind from 'autobind-decorator';
import ClayModal from 'clay-modal';
import Component from 'metal-jsx';
import dom from 'metal-dom';
import FormRenderer from '../../components/Form/index.es';
import FormSupport from '../../components/Form/FormSupport.es';
import Sidebar from '../../components/Sidebar/index.es';

/**
 * Builder.
 * @extends Component
 */

class Builder extends Component {
	static STATE = {

		/**
		 * @default []
		 * @instance
		 * @memberof FormRenderer
		 * @type {?array<object>}
		 */

		indexes: Config.object()
	}

	static PROPS = {

		/**
		 * @default
		 * @instance
		 * @memberof FormRenderer
		 * @type {?number}
		 */

		activePage: Config.number().value(0),

		/**
		 * @default {}
		 * @instance
		 * @memberof Sidebar
		 * @type {?object}
		 */

		focusedField: focusedFieldStructure.value({}),

		/**
		 * @default []
		 * @instance
		 * @memberof FormRenderer
		 * @type {?array<object>}
		 */

		pages: Config.arrayOf(pageStructure).value([]),

		/**
		 * @instance
		 * @memberof LayoutProvider
		 * @type {string}
		 */

		paginationMode: Config.string().required(),

		/**
		 * @instance
		 * @memberof Builder
		 * @type {object}
		 */
		successPageSettings: Config.shapeOf(
			{
				body: Config.object(),
				enabled: Config.bool(),
				title: Config.object()
			}
		)
	};

	/**
	 * Continues the propagation of event.
	 * @param {!Object} indexAllocateField
	 * @private
	 */

	_handleFieldClicked(indexAllocateField) {
		this.emit('fieldClicked', indexAllocateField);
	}

	_handleDeleteFieldClicked(indexes) {
		this.setState(
			{
				indexes
			}
		);
		this._handleModal();
	}

	/**
	 * @param {!Event} event
	 * @private
	 */

	_handleModal() {
		const {modal} = this.refs;

		modal.show();
	}

	_handlePageAdded() {
		this.emit('pageAdded');
	}

	rendered() {
		const {sidebar} = this.refs;

		sidebar.refreshDragAndDrop();
	}

	disposeInternal() {
		super.disposeInternal();

		this._eventHandler.removeAllListeners();
	}

	/**
	 * Continues the propagation of event.
	 * @param {!Event} event
	 * @private
	 */

	_handleFieldAdded(event) {
		const {namespace} = this.props;
		const newFieldName = FormSupport.generateFieldName(event.fieldType.name);
		const settingsContext = event.fieldType.settingsContext;
		const translationManager = Liferay.component(`${namespace}translationManager`);
		const visitor = new PagesVisitor(settingsContext.pages);

		this.emit(
			'fieldAdded',
			{
				...event,
				fieldType: {
					...event.fieldType,
					fieldName: newFieldName,
					settingsContext: {
						...settingsContext,
						pages: visitor.mapFields(
							field => {
								const {fieldName} = field;

								if (fieldName === 'name') {
									field = {
										...field,
										value: newFieldName,
										visible: true
									};
								}
								else if (fieldName === 'label') {
									field = {
										...field,
										localizedValue: {
											...field.localizedValue,
											[translationManager.get('editingLocale')]: event.fieldType.label
										},
										type: 'text',
										value: event.fieldType.label
									};
								}
								else if (fieldName === 'type') {
									field = {
										...field,
										value: event.fieldType.name
									};
								}
								return field;
							}
						)
					},
					type: event.fieldType.name
				}
			}
		);

		this.openSidebar();
	}

	/**
	 * Continues the propagation of event.
	 * @param {!Event} event
	 * @private
	 */

	_handleFieldBlurred() {
		this.emit('fieldBlurred');
	}

	/**
	 * Continues the propagation of event.
	 * @param {!Object} event
	 * @private
	 */

	_handleFieldEdited({fieldInstance, property, value}) {
		const {focusedField, namespace} = this.props;
		const {settingsContext} = focusedField;
		const {columnIndex, pageIndex, rowIndex} = focusedField;
		const properties = {columnIndex, pageIndex, rowIndex};

		properties[property || fieldInstance.fieldName] = value;

		const visitor = new PagesVisitor(settingsContext.pages);

		const translationManager = Liferay.component(`${namespace}translationManager`);

		properties.settingsContext = {
			...settingsContext,
			pages: visitor.mapFields(
				field => {
					if (field.fieldName === fieldInstance.fieldName) {
						field = {
							...field,
							value
						};
						if (field.localizable) {
							field.localizedValue = {
								...field.localizedValue,
								[translationManager.get('editingLocale')]: value
							};
						}
					}
					return field;
				}
			)
		};

		this.emit('fieldEdited', properties);
	}

	_handleActivePageUpdated(activePage) {
		this.emit('activePageUpdated', activePage);
	}

	/**
	 * Continues the propagation of event.
	 * @param {!Object} event
	 * @private
	 */

	_handleFieldMoved(event) {
		this.emit('fieldMoved', event);
	}

	/**
	 * Continues the propagation of event.
	 * @param {!Object}
	 * @private
	 */

	_handleFieldDuplicated(indexes) {
		this.emit('fieldDuplicated', indexes);
	}

	willReceiveProps(changes) {
		let {activePage, pages} = this.props;
		let openSidebar = false;

		if (changes.activePage && changes.activePage.newVal !== -1) {
			activePage = changes.activePage.newVal;

			if (!this._pageHasFields(pages, activePage)) {
				openSidebar = true;
			}
		}
		if (
			changes.pages &&
			changes.pages.prevVal &&
			changes.pages.newVal.length !== changes.pages.prevVal.length
		) {
			pages = changes.pages.newVal;

			if (!this._pageHasFields(pages, activePage)) {
				openSidebar = true;
			}
		}

		if (openSidebar) {
			this.openSidebar();
		}
	}

	openSidebar() {
		const {sidebar} = this.refs;

		sidebar.open();
	}

	syncVisible(visible) {
		const addButton = document.querySelector('#addFieldButton');

		super.syncVisible(visible);

		if (visible) {
			addButton.classList.remove('hide');

			this._eventHandler.add(
				dom.on('#addFieldButton', 'click', this._handleAddFieldButtonClicked.bind(this))
			);
		}
		else {
			this._eventHandler.removeAllListeners();
		}
	}

	/**
	 * Handles click on plus button. Button shows Sidebar when clicked.
	 * @private
	 */

	_handleAddFieldButtonClicked() {
		this.openSidebar();
	}

	_handlePageDeleted(pageIndex) {
		this.emit('pageDeleted', pageIndex);
	}

	_handlePageReset() {
		this.openSidebar();

		this.emit('pageReset');
	}

	@autobind
	_handleModalButtonClicked(event) {
		event.stopPropagation();

		const {modal} = this.refs;
		const {indexes} = this.state;

		modal.emit('hide');

		if (!event.target.classList.contains('close-modal')) {
			this.emit(
				'fieldDeleted',
				{...indexes}
			);
		}
	}

	/**
	 * Continues the propagation of event.
	 * @private
	 */

	_handlePaginationModeUpdated() {
		this.emit('paginationModeUpdated');
	}

	/**
	 * Continues the propagation of event.
	 * @param {Array} pages
	 * @private
	 */

	_handlePagesUpdated(pages) {
		this.emit('pagesUpdated', pages);
	}

	/**
	 * Continues the propagation of event.
	 * @param {Array} pages
	 * @param {Number} pageIndex
	 * @private
	 */
	_pageHasFields(pages, pageIndex) {
		const visitor = new PagesVisitor([pages[pageIndex]]);

		let hasFields = false;

		visitor.mapFields(
			() => {
				hasFields = true;
			}
		);

		return hasFields;
	}

	created() {
		this._eventHandler = new EventHandler();
	}

	/**
	 * Continues the propagation of event.
	 * @param {Object} successPageSettings
	 * @private
	 */
	_handleSuccessPageChanged(successPageSettings) {
		this.emit('successPageChanged', successPageSettings);
	}

	attached() {
		const translationManager = document.querySelector('.ddm-translation-manager');

		const formBasicInfo = document.querySelector('.ddm-form-basic-info');

		if (translationManager && formBasicInfo) {
			formBasicInfo.classList.remove('hide');
			translationManager.classList.remove('hide');
		}
	}

	/**
	 * @inheritDoc
	 */

	render() {
		const {_handleModalButtonClicked, props} = this;
		const {
			activePage,
			fieldTypes,
			focusedField,
			pages,
			paginationMode,
			spritemap,
			successPageSettings,
			visible
		} = props;

		const FormRendererEvents = {
			activePageUpdated: this._handleActivePageUpdated.bind(this),
			fieldClicked: this._handleFieldClicked.bind(this),
			fieldDeleted: this._handleDeleteFieldClicked.bind(this),
			fieldDuplicated: this._handleFieldDuplicated.bind(this),
			fieldMoved: this._handleFieldMoved.bind(this),
			pageAdded: this._handlePageAdded.bind(this),
			pageDeleted: this._handlePageDeleted.bind(this),
			pageReset: this._handlePageReset.bind(this),
			pagesUpdated: this._handlePagesUpdated.bind(this),
			paginationModeUpdated: this._handlePaginationModeUpdated.bind(this),
			successPageChanged: this._handleSuccessPageChanged.bind(this)
		};

		const sidebarEvents = {
			fieldAdded: this._handleFieldAdded.bind(this),
			fieldBlurred: this._handleFieldBlurred.bind(this),
			fieldEdited: this._handleFieldEdited.bind(this)
		};

		return (
			<div>
				<div class="container">
					<div class="sheet">
						<FormRenderer
							activePage={activePage}
							editable={true}
							events={FormRendererEvents}
							pages={pages}
							paginationMode={paginationMode}
							ref="FormRenderer"
							spritemap={spritemap}
							successPageSettings={successPageSettings}
						/>
						<ClayModal
							body={Liferay.Language.get('are-you-sure-you-want-to-delete-this-field')}
							events={{
								clickButton: _handleModalButtonClicked
							}}
							footerButtons={[
								{
									alignment: 'right',
									label: Liferay.Language.get('dismiss'),
									style: 'primary',
									type: 'close'
								},
								{
									alignment: 'right',
									label: Liferay.Language.get('delete'),
									style: 'primary',
									type: 'button'
								}
							]}
							ref="modal"
							size="sm"
							spritemap={spritemap}
							title={Liferay.Language.get('delete-field-dialog-title')}
						/>
					</div>
				</div>
				<Sidebar
					events={sidebarEvents}
					fieldTypes={fieldTypes}
					focusedField={focusedField}
					ref="sidebar"
					spritemap={spritemap}
					visible={visible}
				/>
			</div>
		);
	}
}

export default Builder;
export {Builder};