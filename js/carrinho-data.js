var CarrinhoData = {
  KEY: 'ze_carrinho',

  get: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { items: [] }; }
    catch(e) { return { items: [] }; }
  },

  save: function(c) {
    localStorage.setItem(this.KEY, JSON.stringify(c));
  },

  adicionar: function(produto, quantidade, obs) {
    var c = this.get();
    // Agrupa com item igual (mesmo id e mesma obs)
    var existing = c.items.findIndex(function(i) {
      return i.id === produto.id && i.obs === (obs || '');
    });
    if (existing >= 0) {
      c.items[existing].quantidade += quantidade;
    } else {
      c.items.push({ id: produto.id, nome: produto.nome, preco: produto.preco, img: produto.img, quantidade: quantidade, obs: obs || '' });
    }
    this.save(c);
  },

  remover: function(index) {
    var c = this.get();
    c.items.splice(index, 1);
    this.save(c);
  },

  setQty: function(index, qty) {
    var c = this.get();
    if (qty <= 0) { c.items.splice(index, 1); }
    else { c.items[index].quantidade = qty; }
    this.save(c);
  },

  limpar: function() { localStorage.removeItem(this.KEY); },

  totalItens: function() {
    return this.get().items.reduce(function(s, i) { return s + i.quantidade; }, 0);
  },

  totalValor: function() {
    return this.get().items.reduce(function(s, i) { return s + i.preco * i.quantidade; }, 0);
  }
};
