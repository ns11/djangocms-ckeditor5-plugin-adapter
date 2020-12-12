import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {toWidget, viewToModelPositionOutsideModelElement} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import DemoCommand from './command';

export default class Editing extends Plugin {
    static get requires() {                                                    
        return [ Widget ];
    }

    init() {
        this._defineSchema();
        this._defineConverters();                                              

        this.editor.commands.add( 'demo', new DemoCommand( this.editor ) );

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'demo' ) )
        );

        this.editor.config.define( 'demoConfig', {
            types: [ 'Title', 'Text', 'Author', 'Editor' ]
        } );        
    }

    _defineSchema() {
        // ...
    }

    _defineConverters() {                                                      
        const conversion = this.editor.conversion;

        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'span',
                classes: [ 'demo' ]
            },
            model: ( viewElement, { writer: modelWriter } ) => {
                // Extract the "name" from "{name}".
                const name = viewElement.getChild( 0 ).data.slice( 1, -1 );

                return modelWriter.createElement( 'demo', { name } );
            }
        } );

        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'demo',
            view: ( modelItem, { writer: viewWriter } ) => {
                const widgetElement = createdemoView( modelItem, viewWriter );

                // Enable widget handling on a demo element inside the editing view.
                return toWidget( widgetElement, viewWriter );
            }
        } );

        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'demo',
            view: ( modelItem, { writer: viewWriter } ) => createdemoView( modelItem, viewWriter )
        } );

        // Helper method for both downcast converters.
        function createdemoView( modelItem, viewWriter ) {
            const name = modelItem.getAttribute( 'name' );

            const demoView = viewWriter.createContainerElement( 'span', {
                class: 'demo'
            } );

            // Insert the demo name (as a text).
            const innerText = viewWriter.createText( '{' + name + '}' );
            viewWriter.insert( viewWriter.createPositionAt( demoView, 0 ), innerText );

            return demoView;
        }
    }
}