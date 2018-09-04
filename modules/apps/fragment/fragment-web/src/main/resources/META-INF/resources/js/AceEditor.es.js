import Component from 'metal-component';
import Soy from 'metal-soy';
import {Config} from 'metal-state';

import templates from './AceEditor.soy';

/**
 * Creates a Ace Editor Component
 *
 * Lets you use an instance of Ace editor to edit code
 */

class AceEditor extends Component {

	/**
	 * @inheritDoc
	 */

	attached() {
		this._editorDocument = null;
		this._handleDocumentChanged = this._handleDocumentChanged.bind(this);

		AUI().use(
			'aui-ace-editor',
			A => {
				const editor = new A.AceEditor(
					{
						boundingBox: this.refs.wrapper,
						highlightActiveLine: false,
						mode: this.syntax,
						tabSize: 2
					}
				);

				this._overrideSetAnnotations(editor.getSession());
				this._editorSession = editor.getSession();
				this._editorDocument = editor.getSession().getDocument();

				this.refs.wrapper.style.height = '';
				this.refs.wrapper.style.width = '';

				this._editorDocument.on('change', this._handleDocumentChanged);

				editor.getSession().on('changeAnnotation', this._handleDocumentChanged);

				if (this.initialContent) {
					this._editorDocument.setValue(this.initialContent);
				}
			}
		);
	}

	/**
	 * @inheritDoc
	 */

	shouldUpdate() {
		return false;
	}

	/**
	 * Callback that propagates the `contentChanged` event when 
	 * the internal Ace editor is modified
	 * @private
	 */

	_handleDocumentChanged() {
		const valid = this._editorSession.getAnnotations().reduce(
			(acc, annotation) => {
				return (!acc || (annotation.type === 'error')) ?
					false : acc;
			},
			true
		);

		this.emit(
			'contentChanged',
			{
				content: this._editorDocument.getValue(),
				valid: valid
			}
		);
	}

	/**
	 * Overrides AceEditor's session `setAnnotations` method to avoid showing
	 * misleading messages
	 * @param {Object} session AceEditor session
	 * @private
	 */

	_overrideSetAnnotations(session) {
		const setAnnotations = session.setAnnotations.bind(session);

		session.setAnnotations = annotations => {
			setAnnotations(
				annotations.filter(annotation => annotation.type !== 'info')
			);
		};
	}
}

/**
 * Available AceEditor syntax
 * @static
 * @type {Object}
 */

AceEditor.SYNTAX = {
	css: 'css',
	html: 'html',
	javascript: 'javascript'
};

/**
 * State definition.
 * @static
 * @type {!Object}
 */

AceEditor.STATE = {

	/**
	 * Initial content sent to the editor
	 * @default ''
	 * @instance
	 * @memberOf AceEditor
	 * @type {string}
	 */

	initialContent: Config.string().value(''),

	/**
	 * Syntax used for the Ace editor that is rendered on the interface
	 * @default undefined
	 * @instance
	 * @memberOf AceEditor
	 * @see {@link AceEditor.SYNTAX|SYNTAX}
	 * @type {!string}
	 */

	syntax: Config.oneOf(Object.values(AceEditor.SYNTAX)).required()
};

Soy.register(AceEditor, templates);

export {AceEditor};
export default AceEditor;