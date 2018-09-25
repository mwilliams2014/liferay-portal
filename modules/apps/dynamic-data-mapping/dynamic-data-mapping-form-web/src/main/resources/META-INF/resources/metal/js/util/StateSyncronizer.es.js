import {Config} from 'metal-state';
import {EventHandler} from 'metal-events';
import {PagesVisitor} from './visitors.es';
import Component from 'metal-jsx';
import FormSupport from '../components/Form/FormSupport.es';

class StateSyncronizer extends Component {
	static PROPS = {
		descriptionEditor: Config.any(),
		layoutProvider: Config.any(),
		localizedDescription: Config.object().value({}),
		localizedName: Config.object().value({}),
		nameEditor: Config.any(),
		namespace: Config.string().required(),
		settingsDDMForm: Config.any(),
		translationManager: Config.any()
	};

	created() {
		const {descriptionEditor, nameEditor} = this.props;

		this._eventHandler = new EventHandler();

		this._eventHandler.add(
			descriptionEditor.on('change', this._handleDescriptionEditorChanged.bind(this)),
			nameEditor.on('change', this._handleNameEditorChanged.bind(this))
		);
	}

	disposeInternal() {
		super.disposeInternal();

		this._eventHandler.removeAllListeners();
	}

	getState() {
		const {layoutProvider, localizedDescription, translationManager} = this.props;

		return {
			availableLanguageIds: translationManager.get('availableLocales'),
			defaultLanguageId: translationManager.get('defaultLocale'),
			description: localizedDescription,
			name: this._getLocalizedName(),
			pages: layoutProvider.state.pages,
			paginationMode: layoutProvider.state.paginationMode,
			rules: [],
			successPageSettings: layoutProvider.state.successPageSettings
		};
	}

	isEmpty() {
		const {layoutProvider} = this.props;

		return FormSupport.emptyPages(layoutProvider.state.pages);
	}

	syncInputs() {
		const {namespace, settingsDDMForm} = this.props;
		const state = this.getState();
		const {
			description,
			name
		} = state;

		const publishedField = settingsDDMForm.getField('published');

		publishedField.set('value', this.published);

		document.querySelector(`#${namespace}name`).value = JSON.stringify(name);
		document.querySelector(`#${namespace}description`).value = JSON.stringify(description);
		document.querySelector(`#${namespace}serializedFormBuilderContext`).value = this._getSerializedFormBuilderContext();
		document.querySelector(`#${namespace}serializedSettingsContext`).value = JSON.stringify(settingsDDMForm.toJSON());
	}

	_getLocalizedName() {
		const {localizedName, translationManager} = this.props;
		const defaultLocale = translationManager.get('defaultLocale');

		if (!localizedName[defaultLocale].trim()) {
			localizedName[defaultLocale] = Liferay.Language.get('untitled-form');
		}

		return localizedName;
	}

	_getSerializedFormBuilderContext() {
		const state = this.getState();

		const visitor = new PagesVisitor(state.pages);

		return JSON.stringify(
			{
				...state,
				pages: visitor.mapPages(
					page => {
						return {
							...page,
							description: page.localizedDescription,
							title: page.localizedTitle
						};
					}
				)
			}
		);
	}

	_handleDescriptionEditorChanged(event) {
		const {descriptionEditor, localizedDescription, translationManager} = this.props;
		const editor = window[descriptionEditor.name];

		localizedDescription[translationManager.get('editingLocale')] = editor.getHTML();
	}

	_handleNameEditorChanged(event) {
		const {localizedName, nameEditor, translationManager} = this.props;
		const editor = window[nameEditor.name];

		localizedName[translationManager.get('editingLocale')] = editor.getHTML();
	}
}

export default StateSyncronizer;