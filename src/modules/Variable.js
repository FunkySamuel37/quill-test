import Quill from 'quill';
import QuillVariable from '../blots/QuillVariable';
import Keys from '../constants/keys';
import numberIsNaN from  '../utils/numberisnan';

Quill.register(QuillVariable)

class Variable {
  constructor(quill, options) {
    console.log(options)
    this.quill = quill;

    this.isOpen = false
    this.itemIndex = 0;
    this.variableCharPos = null;
    this.cursorPos = null;
    this.values = [];
    this.suspendMouseEnter = false;
    this.options = {
      source: null,
      renderItem(item, searchTerm) {
        return `${item.value}`
      },
      onSelect(item, insertItem) {
        insertItem(item);
      },
      variableDenotationChars: ['#'],
      showDenotationChar: false,
      // allowedChars: /^[^\x00-\xff]+(\-|[^\x00-\xff])*/
      allowedChars: /^[a-zA-Z0-9_]*$/,
      minChars: 0,
      maxChars: 31,
      offsetTop: 2,
      offsetLeft: 0,
      fixVariablesToQuill: false,
      defaultMenuOrientation: 'bottom',
      dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target'],
      onOpen() {
        return true
      },
      onClose() {
        return true;
      },
      listItemClass: 'ql-variable-list-item',
      variableContainerClass: 'ql-variable-list-container',
      variableListClass: 'ql-variable-list',
    }

    this.options = Object.assign(this.options, options, {
      dataAttributes: Array.isArray(options.dataAttributes)
        ? this.options.dataAttributes.concat(options.dataAttributes)
        : this.options.dataAttributes
    });

    this.variableContainer = document.createElement('div');
    this.variableContainer.className = this.options.variableContainerClass || '';
    this.variableContainer.style.cssText = 'display: none; position: absolute;';
    this.variableContainer.onmousemove = this.onContainerMouseMove.bind(this);

    if (this.options.fixVariablesToQuill) {
      this.variableContainer.style.width = 'auto';
    }

    this.variableList = document.createElement('ul');
    this.variableList.className = this.options.variableListClass;
    this.variableContainer.appendChild(this.variableList)

    this.quill.container.appendChild(this.variableContainer);

    quill.on('text-change', this.onTextChange.bind(this));
    quill.on('selection-change', this.onSelectionChange.bind(this))

    quill.keyboard.addBinding({
      key: Keys.TAB,
    }, this.selectHandler.bind(this));
    quill.keyboard.bindings[9].unshift(quill.keyboard.bindings[9].pop());

    quill.keyboard.addBinding({
      key: Keys.ENTER,
    }, this.selectHandler.bind(this));
    quill.keyboard.bindings[13].unshift(quill.keyboard.bindings[13].pop());

    quill.keyboard.addBinding({
      key: Keys.ESCAPE,
    }, this.escapeHandler.bind(this));

    quill.keyboard.addBinding({
      key: Keys.UP,
    }, this.upHandler.bind(this));

    quill.keyboard.addBinding({
      key: Keys.DOWN,
    }, this.downHandler.bind(this));


  }

  selectHandler() {
    if (this.isOpen) {
      this.selectItem();
      return false;
    }
    return true;
  }

  escapeHandler() {
    if (this.isOpen) {
      this.hidevariableList();
      return false;
    }
    return true;
  }

  upHandler() {
    if (this.isOpen) {
      this.prevItem();
      return false;
    }
    return true;
  }

  downHandler() {
    if (this.isOpen) {
      this.nextItem();
      return false;
    }
    return true;
  }

  showvariableList() {
    this.variableContainer.style.visibility = 'hidden';
    this.variableContainer.style.display = '';
    this.setvariableContainerPosition();
    this.setIsOpen(true);
  }

  hidevariableList() {
    this.variableContainer.style.display = 'none';
    this.setIsOpen(false);
  }

  highlightItem(scrollItemInView = true) {
    for (let i = 0; i < this.variableList.childNodes.length; i += 1) {
      this.variableList.childNodes[i].classList.remove('selected');
    }
    this.variableList.childNodes[this.itemIndex].classList.add('selected');

    if (scrollItemInView) {
      const itemHeight = this.variableList.childNodes[this.itemIndex].offsetHeight;
      const itemPos = this.itemIndex * itemHeight;
      const containerTop = this.variableContainer.scrollTop;
      const containerBottom = containerTop + this.variableContainer.offsetHeight;

      if (itemPos < containerTop) {
        // Scroll up if the item is above the top of the container
        this.variableContainer.scrollTop = itemPos;
      } else if (itemPos > (containerBottom - itemHeight)) {
        // scroll down if any part of the element is below the bottom of the container
        this.variableContainer.scrollTop += (itemPos - containerBottom) + itemHeight;
      }
    }
  }

  getItemData() {
    const { link } = this.variableList.childNodes[this.itemIndex].dataset;
    const hasLinkValue = typeof link !== 'undefined';
    const itemTarget = this.variableList.childNodes[this.itemIndex].dataset.target;
    if (hasLinkValue) {
      this.variableList.childNodes[this.itemIndex].dataset.value = `<a href="${link}" target=${itemTarget || this.options.linkTarget}>${this.variableList.childNodes[this.itemIndex].dataset.value}`;
    }
    return this.variableList.childNodes[this.itemIndex].dataset;
  }

  onContainerMouseMove() {
    this.suspendMouseEnter = false;
  }

  selectItem() {
    const data = this.getItemData();
    this.options.onSelect(data, (asyncData) => {
      this.insertItem(asyncData);
    });
    this.hidevariableList();
  }

  insertItem(data) {
    const render = data;
    if (render === null) {
      return;
    }
    if (!this.options.showDenotationChar) {
      render.denotationChar = '';
    }

    const prevVariableCharPos = this.variableCharPos;

    this.quill
      .deleteText(this.variableCharPos, this.cursorPos - this.variableCharPos, Quill.sources.USER);
    this.quill.insertEmbed(prevVariableCharPos, 'variable', render, Quill.sources.USER);
    this.quill.insertText(prevVariableCharPos + 1, ' ', Quill.sources.USER);
    this.quill.setSelection(prevVariableCharPos + 2, Quill.sources.USER);
    this.hidevariableList();
  }

  onItemMouseEnter(e) {
    if (this.suspendMouseEnter) {
      return;
    }

    const index = Number(e.target.dataset.index);

    if (!numberIsNaN(index) && index !== this.itemIndex) {
      this.itemIndex = index;
      this.highlightItem(false);
    }
  }

  onItemClick(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    this.itemIndex = e.currentTarget.dataset.index;
    this.highlightItem();
    this.selectItem();
  }

  attachDataValues(element, data) {
    const variable = element;
    Object.keys(data).forEach((key) => {
      if (this.options.dataAttributes.indexOf(key) > -1) {
        variable.dataset[key] = data[key];
      } else {
        delete variable.dataset[key];
      }
    });
    return variable;
  }


  renderList(variableChar, data, searchTerm) {
    if (data && data.length > 0) {
      this.values = data;
      this.variableList.innerHTML = '';

      for (let i = 0; i < data.length; i += 1) {
        const li = document.createElement('li');
        li.className = this.options.listItemClass ? this.options.listItemClass : '';
        li.dataset.index = i;
        li.innerHTML = this.options.renderItem(data[i], searchTerm);
        li.onmouseenter = this.onItemMouseEnter.bind(this);
        li.dataset.denotationChar = variableChar;
        li.onclick = this.onItemClick.bind(this);
        this.variableList.appendChild(this.attachDataValues(li, data[i]));
      }
      this.itemIndex = 0;
      this.highlightItem();
      this.showvariableList();
    } else {
      this.hidevariableList();
    }
  }




  nextItem() {
    this.itemIndex = (this.itemIndex + 1) % this.values.length;
    this.suspendMouseEnter = true;
    this.highlightItem();
  }

  prevItem() {
    this.itemIndex = ((this.itemIndex + this.values.length) - 1) % this.values.length;
    this.suspendMouseEnter = true;
    this.highlightItem();
  }


  hasValidChars(s) {
    return this.options.allowedChars.test(s);
  }


  containerRightIsNotVisible(leftPos, containerPos) {
    if (this.options.fixVariablesToQuill) {
      return false;
    }

    const rightPos = leftPos + this.variableContainer.offsetWidth + containerPos.left;
    const browserWidth = window.pageXOffset + document.documentElement.clientWidth;
    return rightPos > browserWidth;
  }

  containerBottomIsNotVisible(topPos, containerPos) {
    const variableContainerBottom = topPos + this.variableContainer.offsetHeight + containerPos.top;
    return variableContainerBottom > window.pageYOffset + window.innerHeight;
  }

  setIsOpen(isOpen) {
    if (this.isOpen !== isOpen) {
      if (isOpen) {
        this.options.onOpen();
      } else {
        this.options.onClose();
      }
      this.isOpen = isOpen;
    }
  }

  setvariableContainerPosition() {
    const containerPos = this.quill.container.getBoundingClientRect();
    const variableCharPos = this.quill.getBounds(this.variableCharPos);
    const containerHeight = this.variableContainer.offsetHeight;

    let topPos = this.options.offsetTop;
    let leftPos = this.options.offsetLeft;

    // handle horizontal positioning
    if (this.options.fixVariablesToQuill) {
      const rightPos = 0;
      this.variableContainer.style.right = `${rightPos}px`;
    } else {
      leftPos += variableCharPos.left;
    }

    if (this.containerRightIsNotVisible(leftPos, containerPos)) {
      const containerWidth = this.variableContainer.offsetWidth + this.options.offsetLeft;
      const quillWidth = containerPos.width;
      leftPos = quillWidth - containerWidth;
    }

    // handle vertical positioning
    if (this.options.defaultMenuOrientation === 'top') {
      // Attempt to align the variable container with the top of the quill editor
      if (this.options.fixVariablesToQuill) {
        topPos = -1 * (containerHeight + this.options.offsetTop);
      } else {
        topPos = variableCharPos.top - (containerHeight + this.options.offsetTop);
      }

      // default to bottom if the top is not visible
      if (topPos + containerPos.top <= 0) {
        let overVariableCharPos = this.options.offsetTop;

        if (this.options.fixVariablesToQuill) {
          overVariableCharPos += containerPos.height;
        } else {
          overVariableCharPos += variableCharPos.bottom;
        }

        topPos = overVariableCharPos;
      }
    } else {
      // Attempt to align the variable container with the bottom of the quill editor
      if (this.options.fixVariablesToQuill) {
        topPos += containerPos.height;
      } else {
        topPos += variableCharPos.bottom;
      }

      // default to the top if the bottom is not visible
      if (this.containerBottomIsNotVisible(topPos, containerPos)) {
        let overVariableCharPos = this.options.offsetTop * -1;

        if (!this.options.fixVariablesToQuill) {
          overVariableCharPos += variableCharPos.top;
        }

        topPos = overVariableCharPos - containerHeight;
      }
    }

    this.variableContainer.style.top = `${topPos}px`;
    this.variableContainer.style.left = `${leftPos}px`;

    this.variableContainer.style.visibility = 'visible';
  }



  onSomethingChange() {
    const range = this.quill.getSelection();
    if (range == null) return;
    this.cursorPos = range.index;
    const startPos = Math.max(0, this.cursorPos - this.options.maxChars);
    const beforeCursorPos = this.quill.getText(startPos, this.cursorPos - startPos);
    const variableCharIndex = this.options.variableDenotationChars.reduce((prev, cur) => {
      const previousIndex = prev;
      const varIndex = beforeCursorPos.lastIndexOf(cur);

      return varIndex > previousIndex ? varIndex : previousIndex;
    }, -1);
    if (variableCharIndex > -1) {
      if (this.options.isolateCharacter && !(variableCharIndex === 0 || !!beforeCursorPos[variableCharIndex - 1].match(/\s/g))) {
        this.hidevariableList();
        return;
      }
      const variableCharPos = this.cursorPos - (beforeCursorPos.length - variableCharIndex);
      this.variableCharPos = variableCharPos;
      const textAfter = beforeCursorPos.substring(variableCharIndex + 1);
      if (textAfter.length >= this.options.minChars && this.hasValidChars(textAfter)) {
        const varChar = beforeCursorPos[variableCharIndex];
        this.options.source(textAfter, this.renderList.bind(this, varChar), varChar);
      } else {
        this.hidevariableList();
      }
    } else {
      this.hidevariableList();
    }
  }


  onTextChange(delta, oldDelta, source) {
    if (source === 'user') {
      this.onSomethingChange();
    }
  }

  onSelectionChange(range) {
    if (range && range.length === 0) {
      this.onSomethingChange();
    } else {
      this.hidevariableList();
    }
  }

}


export default Variable
