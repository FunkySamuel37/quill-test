import React from 'react';
import Quill from 'quill';
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default class Editor extends React.Component {

  
  async componentDidMount() {

    setTimeout(() => {
      this.init();
    }, 0);
  }

  init() {
    const { template, onChange } = this.props;
    if (!this.editor) {
      return;
    }
    const quill = new Quill(this.editor, {
      theme: 'snow',
      modules: {
        // Equivalent to { toolbar: { container: '#toolbar' }}
        toolbar: toolbarOptions
      }
    });
    // quill.on('text-change', (delta, oldDelta, source) => {
    //   onChange(quill.root.innerHTML);
    // })
    // quill.on('click-variable', ({ context, target }: { target: HTMLElement, context: QuillVariableContext }) => {
    //   this.setState({ contextFormOpen: true, contextFormFields: [context.name] })
    //   this.variable = { target, context }
    // })
    this.quill = quill;
  }

  render() {
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
