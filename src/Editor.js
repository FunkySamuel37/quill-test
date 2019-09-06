import React from 'react';
import Quill from 'quill';
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import Counter from './modules/Counter'
import Variable from './modules/Variable'

Quill.register('modules/counter', Counter)
Quill.register('modules/variable', Variable)

const atValues = [
  { "id": "5a97b2a402de91c5b6c3e8a4", "value": "Josie Rice", "link": "http://www.josierice.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a464a8ff2d0996d2ef", "value": "Elva Bowman", "link": "mailto:elva@bowman.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4ecb768a2092a298b", "value": "Ella Cochran", "link": "http://www.ellacochran.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a418b984d2aff97657", "value": "Knowles Walls", "link": "mailto:knowles@walls.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad0", "value": "Hanson Webb", "link": "http://www.hansonwebb.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad1", "value": "Maria Cruz", "link": "mailto:maria@cruz.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad2", "value": "Pablo Escobar", "link": "http://www.pabloescobar.com", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad3", "value": "Richard Smith", "link": "mailto:richard@smith.com", "myCustomProperty": "custom value" }
];

const hashValues = [
  { "id": "5a97b2a402de91c5b6c3e8a5", "value": "Josie Price", "myCustomProperty": "custom value" },
  { "id": "5a97b2a464a8ff2d0996d2eg", "value": "Elva Showman", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4ecb768a2092a298c", "value": "Ella Coach", "myCustomProperty": "custom value" },
  { "id": "5a97b2a418b984d2aff97658", "value": "Knowles Walis", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad1", "value": "Hanson Webster", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad2", "value": "Maria Cruiser", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad3", "value": "Pablo Escobeer", "myCustomProperty": "custom value" },
  { "id": "5a97b2a4436c2c9acc6b5ad4", "value": "Richard Schmidt", "myCustomProperty": "custom value" }
];
export default class Editor extends React.Component {

  
  async componentDidMount() {

    setTimeout(() => {
      this.init();
    }, 0);
  }

  init() {
    const { template } = this.props;
    if (!this.editor) {
      return;
    }
    this.editor.innerHTML = localStorage.getItem('text') || ''
    const quill = new Quill(this.editor, {
      theme: 'snow',
      modules: {
        // Equivalent to { toolbar: { container: '#toolbar' }}
        toolbar: toolbarOptions,
        // counter: true,
        variable: {
          listItemClass: 'cql-list-item',
          mentionDenotationChars: ["@", "#"],
          dataAttributes: ['myCustomProperty'],
          source: function (searchTerm, renderList, mentionChar) {
            let values;

            if (mentionChar === "@") {
              values = atValues;
            } else {
              values = hashValues;
            }

            if (searchTerm.length === 0) {
              renderList(values, searchTerm);
            } else {
              const matches = [];
              for (let i = 0; i < values.length; i++)
                if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i]);
              renderList(matches, searchTerm);
            }
          },
        }
      }
    });
    quill.on('text-change', (delta, oldDelta, source) => {
      localStorage.setItem('text', quill.root.innerHTML);
    })
    this.quill = quill;
  }

  render() {
    if (this.quill) {
      var counter = this.quill.getModule('counter');
      // We can now access calculate() directly
      console.log(counter.calculate(), 'words');
    }
    return (
      <div>
        <div ref={ref => this.editor = ref}></div>
      </div>
    )
  }
}

var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
];

// <span class="ql-formats">
//   <select class="ql-font">
//     <option selected></option>
//     <option value="serif"></option>
//     <option value="monospace"></option>
//   </select>
//   <select class="ql-size">
//     <option value="small"></option>
//     <option selected></option>
//     <option value="large"></option>
//     <option value="huge"></option>
//   </select>
// </span>
// <span class="ql-formats">
//   <button class="ql-bold"></button>
//   <button class="ql-italic"></button>
//   <button class="ql-underline"></button>
//   <button class="ql-strike"></button>
// </span>
// <span class="ql-formats">
//   <select class="ql-color"></select>
//   <select class="ql-background"></select>
// </span>
// <span class="ql-formats">
//   <button class="ql-list" value="ordered"></button>
//   <button class="ql-list" value="bullet"></button>
//   <select class="ql-align">
//     <option selected></option>
//     <option value="center"></option>
//     <option value="right"></option>
//     <option value="justify"></option>
//   </select>
// </span>
// <span class="ql-formats">
//   <button class="ql-link"></button>
//   <button class="ql-image"></button>
// </span>
