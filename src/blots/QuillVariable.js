import Quill from 'quill';
import './QuillVariable.css'

const Embed = Quill.import('blots/embed');

class QuillVariable extends Embed {

  constructor(dom: HTMLElement, context: QuillVariableContext) {
    super(dom)
    dom.addEventListener('compositionstart', () => {
      this.composing = true;
      console.log('compositionstart')
    });
    dom.addEventListener('compositionend', () => {
      this.composing = false;
      console.log('compositionend')
    });
  }

  static create(data) {
    const {value, name} = data;
    const node = super.create();
    node.innerText = value || name;
    if (value && name !== value) {
      console.log(value, name)
      node.classList.add('filled')
    }
    return QuillVariable.setDataValues(node, data);
  }

  static setDataValues(element, data) {
    const domNode = element;
    Object.keys(data).forEach((key) => {
      domNode.dataset[key] = data[key];
    });
    return domNode;
  }


  static value(node) {
    return node.dataset
  }
}

QuillVariable.blotName = 'variable';
QuillVariable.className = 'ql-variable';
QuillVariable.tagName = 'span';
export default QuillVariable
