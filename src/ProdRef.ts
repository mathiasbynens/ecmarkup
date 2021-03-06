import Builder = require('./Builder');
import Production = require('./Production');
import utils = require('./utils');

/*@internal*/
class ProdRef extends Builder {
  build() {
    const namespace = utils.getNamespace(this.spec, this.node);
    const entry = this.spec.biblio.byProductionName(this.node.getAttribute('name')!, namespace);
    const prod = entry ? entry._instance : null;

    let copy: HTMLElement;

    if (!prod) {
      console.error('Could not find production named ' + this.node.getAttribute('name'));
      return;
    }

    if (utils.shouldInline(this.node)) {
      const cls = this.node.getAttribute('class') || '';

      if (cls.indexOf('inline') === -1) {
        this.node.setAttribute('class', cls + ' inline');
      }
    }

    if (this.node.hasAttribute('a')) {
      this.node.setAttribute('collapsed', '');
      if (!prod.rhsesById[this.node.getAttribute('a')!]) {
        console.error('Could not find alternative ' + this.node.getAttribute('a') + ' of production ' + prod.name);
        return;
      }

      copy = prod.node.cloneNode(false) as HTMLElement;

      // copy nodes until the first RHS. This captures the non-terminal name and any annotations.
      for (let j = 0; j < prod.node.childNodes.length; j++) {
        if (prod.node.childNodes[j].nodeName === 'EMU-RHS') break;

        copy.appendChild(prod.node.childNodes[j].cloneNode(true));
      }

      copy.appendChild(prod.rhsesById[this.node.getAttribute('a')!].node.cloneNode(true));
    } else {
      copy = prod.node.cloneNode(true) as HTMLElement;
    }

    copy.removeAttribute('id');

    this.node.parentNode.replaceChild(copy, this.node);

    // copy attributes over (especially important for 'class').
    for (let j = 0; j < this.node.attributes.length; j++) {
      const attr = this.node.attributes[j];

      if (!copy.hasAttribute(attr.name)) {
        copy.setAttribute(attr.name, attr.value);
      }
    }

  }
}

/*@internal*/
export = ProdRef;