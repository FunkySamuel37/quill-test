import _ from 'lodash';

export default class Counter {
  constructor(quill, options) {
    // const container = document.querySelector(options.container);
    this.quill = quill;
    this.options = _.defaultsDeep(options, {
      unit: 'word'
    });
    this.counter = document.createElement('div')
    this.counter.classList.add('ql-counter')
    quill.container.appendChild(this.counter)


    quill.on('text-change', this.update.bind(this))
  }

  update() {
    const length = this.calculate();
    let label = this.options.unit;
    if (length !== 1) {
      label += 's';
    }
    this.counter.innerText = length + ' ' + label;
  }

  calculate() {
    let text = this.quill.getText();
    if (this.options.unit === 'word') {
      text = text.trim();
      return text.length > 0 ? text.split(/\s+/).length : 0
    } else {
      return text.length;
    }
  }
}
