var FriendSearch = (function() {
  function FriendSearch(input, friends) {
    var self = this;

    this.input = input;
    this.graph = new Graph();

    for (var i=0; i < friends.length; i++) {
      this.graph.insert(friends[i].name, friends[i].id);
    }

    $(function() {
      var select = function(item) {
        if (item.length > 0) {
          $(self.input).trigger('selected', item.data('facebook-id'));
          self.dismissHints();
        }
      };

      $(self.input).on('input', function(e) { self.search($(self.input).val()); });
      $(self.input).on('keydown', function(e) {
        console.log("keydown " + e.which);
        if (e.which == 40) { // Down arrow
          self.moveSelection('down');
        }
        else if (e.which == 38) { // Up arrow
          self.moveSelection('up');
        }
        else if (e.which == 13) { // Enter/return
          var active = $('.fac-container .fac-item.active');
          select(active);
        }
        else if (e.which == 27) {
          self.dismissHints();
        }
      });

      self.appendStyle();
      $('.fac-container').remove();
      $('body').append('<div class="fac-container"></div>');
      $('.fac-container .fac-item').live('mouseenter', function() {
        var current = $('.fac-container .fac-item.active');
        current.removeClass('active');
        $(this).addClass('active');
      });

      $('.fac-container .fac-item').live('click', function() {
        select($(this));
      });

      $(self.input).focusout(function() {
        self.dismissHints();
      });

      $(self.input).focusin(function() {
        self.search($(self.input).val());
      });
    });
  };


  FriendSearch.prototype.search = function(prefix) {
    prefix = this.graph.normalize(prefix);

    if (prefix == "") {
      this.dismissHints();
    }
    else {
      var results = {};
      var tokens = prefix.split(/\s/);

      for (var i=0; i < tokens.length; i++) {
        var friends = this.graph.prefixedBy(tokens[i]);

        if (i == 0) {
          results = friends;
        }
        else {
          for (var key in results) {
            if (!friends.hasOwnProperty(key)) {
              delete results[key];
            }
          }
        }
      }

      this.displayHints(results);
    }
  };

  FriendSearch.prototype.dismissHints = function() {
    $('.fac-container').css('display', 'none');
  }

  FriendSearch.prototype.moveSelection = function(direction) {
    var current = $('.fac-container .fac-item.active');
    if (current.length == 0) {
      if (direction == 'up') {
        $('.fac-container .fac-item:last').addClass('active');
      }
      else {
        $('.fac-container .fac-item:first').addClass('active');
      }
    }
    else {
      current.removeClass('active');

      if (direction == 'up') {
        current.prev().addClass('active');
      }
      else {
        current.next().addClass('active');
      }
    }
  };

  FriendSearch.prototype.appendStyle = function() {
    var styles = [
      ".fac-container { background-color: white; border: 1px solid #000; overflow: hidden; display: none; }",
      ".fac-item { cursor: pointer; min-height: 50px; padding: 2px 30px 2px 63px;  border-top: 1px solid white; border-bottom: 1px solid white; }",
      ".fac-item img { position: absolute; left: 6px; height: 50px; width: 50px; }",
      ".fac-name, .fac-footer { color: #3b5998; font-weight: bold; font-family: 'lucida grande',tahoma,verdana,arial,sans-serif; font-size: 11px; line-height: 18px; }",
      ".fac-item.active { background-color: #6d84b4; border-color: #3b5998; }",
      ".fac-item.active .fac-name { color: #fff; }",
      ".fac-footer { background-color: #f7f7f7; border: 1px solid #ddd; text-align: center; min-height: 20px; padding: 10px; }"
    ];
    $('head').append('<style type="text/css">' + styles.join("\n") + '</style>');
  };

  FriendSearch.prototype.clear = function() {
    $('.fac-container').empty();
    $('.fac-container').
      css('display', 'block').
      css('position', 'absolute').
      css('left', $(this.input).offset().left).
      css('top', $(this.input).offset().top + $(this.input).outerHeight()).
      css('width', $(this.input).outerWidth());
  };

  FriendSearch.prototype.displayHints = function(friends) {
    this.clear();

    var i = 0;
    for (var id in friends) {
      if (i > 4) {
        break;
      }

      var friendId = id;
      var friendName = friends[id];

      var friendDiv = $('<div class="fac-item" data-facebook-id="' + friendId + '"></div>');
      var friendImg = $('<img src="//graph.facebook.com/' + friendId + '/picture" />');
      var friendName = $('<div class="fac-name">' + friendName + '</div>');

      friendDiv.append(friendImg);
      friendDiv.append(friendName);

      $('.fac-container').append(friendDiv);

      i++;
    }

    if (i > 0) {
      var footer = $('<div class="fac-footer"> Showing results for ' + $(this.input).val() + '</div>');
      $('.fac-container').append(footer);
    }
    else {
      var footer = $('<div class="fac-footer">No friends for ' + $(this.input).val() + ' :-(</div>');
      $('.fac-container').append(footer);
    }
  };

  return FriendSearch;
})();

var Graph = (function() {
  function Graph() {
    this.root = 0;
    this.graph = {0: []};
    this.ids = [0]
    this.accepts = {};
  };

  Graph.prototype.insert = function(name, id) {
    var self = this;
    var orig = name

    var rinsert = function(node, fragment) {
      if (fragment.length == 0) {
        if (typeof self.accepts[node] == 'undefined') {
          self.accepts[node] = {}
        }

        self.accepts[node][id] = orig;
      }
      else {
        var letters = [];
        var nodes = [];

        for (var i=0; i < self.graph[node].length; i++) {
          var pair = self.graph[node][i];
          letters.push(pair.letter);
          nodes.push(pair.node);
        }

        var node_index = letters.indexOf(fragment[0]);
        if (node_index > -1) {
          // This edge already exists in the graph, move along...
          rinsert(nodes[node_index], fragment.slice(1));
        }
        else {
          // The edge doesn't already exist, so make it...
          var next_node_id = self.ids.length;
          self.graph[node].push({letter: fragment[0], node: next_node_id});
          self.graph[next_node_id] = [];
          self.ids.push(next_node_id);

          rinsert(next_node_id, fragment.slice(1));
        }
      }
    };

    var names = name.split(/\s+/);

    for (var i=0; i < names.length; i++) {
      rinsert(this.root, this.normalize(names[i]));
    }
  };

  Graph.prototype.normalize = function(name) {
    var diacritics = {
      a: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g,
      aa: /[\uA733]/g,
      ae: /[\u00E6\u01FD\u01E3]/g,
      ao: /[\uA735]/g,
      au: /[\uA737]/g,
      av: /[\uA739\uA73B]/g,
      ay: /[\uA73D]/g,
      b: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g,
      c: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g,
      d: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g,
      dz: /[\u01F3\u01C6]/g,
      e: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g,
      f: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g,
      g: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g,
      h: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g,
      hv: /[\u0195]/g,
      i: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g,
      j: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g,
      k: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g,
      l: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g,
      lj: /[\u01C9]/g,
      m: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g,
      n: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g,
      nj: /[\u01CC]/g,
      o: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g,
      oi: /[\u01A3]/g,
      ou: /[\u0223]/g,
      oo: /[\uA74F]/g,
      p: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g,
      q: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g,
      r: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g,
      s: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g,
      t: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g,
      tz: /[\uA729]/g,
      u: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g,
      v: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g,
      vy: /[\uA761]/g,
      w: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g,
      x: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g,
      y: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g,
      z: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
    };

    name = name.toLowerCase().trim();

    for (var normal in diacritics) {
      name = name.replace(diacritics[normal], normal);
    }

    return name;
  };

  Graph.prototype.words = function() {
    var words = [];

    for (var key in this.accepts) {
      if (this.accepts.hasOwnProperty(key)) {
        words.push(this.accepts[key]);
      }
    }

    return words;
  };

  Graph.prototype.prefixedBy = function(prefix) {
    return this.wordsFrom(this.nodeFor(this.normalize(prefix)));
  };

  Graph.prototype.wordsFrom = function(node) {
    var self = this;

    var rwords = function(node, results) {
      if (typeof self.accepts[node] != 'undefined') {
        for (var key in self.accepts[node]) {
          results[key] = self.accepts[node][key];
        }
      }

      for (var i=0; i < self.graph[node].length; i++) {
        var next = self.graph[node][i].node;
        rwords(next, results);
      }

      return results;
    };

    if (node !== null) {
      return rwords(node, {});
    }
    else {
      return {};
    }
  }

  Graph.prototype.nodeFor = function(word) {
    var self = this;

    var rnode = function(node, fragment) {
      if (fragment.length == 0) {
        return node;
      }
      else {
        for (var i=0; i < self.graph[node].length; i++) {
          var n = self.graph[node][i];
          if (n.letter == fragment[0]) {
            return rnode(n.node, fragment.slice(1));
          }
        }

        return null;
      }
    };

    return rnode(this.root, this.normalize(word));
  };

  return Graph;
})();

