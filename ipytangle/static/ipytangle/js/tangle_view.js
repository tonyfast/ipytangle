// Generated by CoffeeScript 1.9.2
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  define(["underscore", "jquery", "backbone", "moment", "../lib/d3/d3.js", "../lib/mathjs/dist/math.min.js", "../lib/numeral/min/numeral.min.js", "../lib/rangy/rangy-core.js", "widgets/js/widget", "base/js/events", "base/js/namespace"], function(_, $, Backbone, moment, d3, math, numeral, rangy, widget, events, IPython) {
    var $win, TangleView;
    $win = $(window);
    d3.select("head").selectAll("#tangle-styles").data([1]).enter().append("link").attr({
      id: "tangle-styles",
      href: "/nbextensions/ipytangle/css/tangle.css",
      rel: "stylesheet"
    });
    return {
      TangleView: TangleView = (function(superClass) {
        extend(TangleView, superClass);

        function TangleView() {
          this.initVariableNumeric = bind(this.initVariableNumeric, this);
          this.initVariableChoices = bind(this.initVariableChoices, this);
          this.initVariable = bind(this.initVariable, this);
          this.updateVariable = bind(this.updateVariable, this);
          this.updateIf = bind(this.updateIf, this);
          this.context = bind(this.context, this);
          this.stackMatch = bind(this.stackMatch, this);
          this.updateOutput = bind(this.updateOutput, this);
          this.initOutput = bind(this.initOutput, this);
          this.onMarkdown = bind(this.onMarkdown, this);
          this.template = bind(this.template, this);
          return TangleView.__super__.constructor.apply(this, arguments);
        }

        TangleView.prototype.EVT = {
          MD: "rendered.MarkdownCell"
        };

        TangleView.prototype.render = function() {
          var cell, i, len, ref, results, view;
          TangleView.__super__.render.apply(this, arguments);
          this._modelChange = {};
          view = this;
          this.templates = {};
          this._env = {
            moment: moment,
            math: math,
            numeral: numeral,
            $: function(x) {
              return numeral(x).format("$0.0a");
            },
            floor: function(x) {
              return Math.floor(x);
            },
            ceil: function(x) {
              return Math.ceil(x);
            }
          };
          this.d3 = d3.select(this.el).classed({
            "widget-tangle": 1,
            panel: 1,
            "panel-info": 1
          }).style({
            width: "100%"
          });
          this.heading = this.d3.append("div").classed({
            "panel-heading": 1
          });
          this.title = this.heading.append("h3").classed({
            "panel-title": 1
          });
          this.title.append("span").text("Tangle");
          this.title.append("button").classed({
            "pull-right": 1,
            btn: 1,
            "btn-link": 1
          }).style({
            "margin-top": 0,
            "padding": 0,
            height: "24px"
          }).on("click", (function(_this) {
            return function() {
              _this.model.set("_expanded", !_this.model.get("_expanded"));
              return _this.update();
            };
          })(this)).append("i").classed({
            fa: 1,
            "fa-fw": 1,
            "fa-ellipsis-h": 1,
            "fa-2x": 1
          });
          this.body = this.d3.append("div").classed({
            "panel-body": 1
          }).append("div").classed({
            row: 1
          });
          events.on(this.EVT.MD, this.onMarkdown);
          this.update();
          ref = IPython.notebook.get_cells();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            cell = ref[i];
            if (cell.cell_type === "markdown" && cell.rendered) {
              cell.unrender();
              results.push(cell.execute());
            } else {
              results.push(void 0);
            }
          }
          return results;
        };

        TangleView.prototype.update = function() {
          var changed, expanded, key, now, row, rows, view;
          TangleView.__super__.update.apply(this, arguments);
          view = this;
          now = new Date();
          changed = this.model.changed;
          for (key in this.model.changed) {
            this._modelChange[key] = now;
          }
          expanded = this.model.get("_expanded");
          this.d3.classed({
            docked: expanded
          });
          rows = d3.entries(this.model.attributes).filter(function(attr) {
            return attr.key[0] !== "_";
          }).filter(function(attr) {
            var ref;
            return ref = attr.key, indexOf.call(view.model.attributes._tangle_upstream_traits, ref) < 0;
          });
          rows.sort((function(_this) {
            return function(a, b) {
              return d3.descending(_this._modelChange[a.key], _this._modelChange[b.key]) || d3.ascending(a.key, b.key);
            };
          })(this));
          row = this.body.data([rows]).order().classed({
            hide: !expanded
          }).selectAll(".variable").data(function(data) {
            return data;
          }).call(function() {
            var init;
            init = this.enter().append("div").classed({
              variable: 1
            });
            init.append("h6");
            return init.append("input").classed({
              "form-control": 1
            }).on("input", function(arg) {
              var key, value;
              key = arg.key, value = arg.value;
              view.model.set(key, d3.select(this).property("value"));
              return view.touch();
            });
          });
          row.select("h6").text(function(arg) {
            var key;
            key = arg.key;
            return key;
          });
          row.select("input").property({
            value: function(arg) {
              var value;
              value = arg.value;
              return value;
            }
          });
          row.filter(function(d) {
            return d.key in changed;
          }).select("input").style({
            "background-color": "yellow"
          }).transition().style({
            "background-color": "white"
          });
          return this;
        };

        TangleView.prototype.remove = function() {
          events.off(this.EVT.MD, this.onMarkdown);
          return TangleView.__super__.remove.apply(this, arguments);
        };

        TangleView.prototype.tmplUpdateClasses = function(arg) {
          var down, up;
          up = arg.up, down = arg.down;
          return {
            "tangle-unupdated": !(up || down),
            "tangle-updated": up,
            "tangle-downdated": down
          };
        };

        TangleView.prototype.template = function(el, config) {
          var _update, codes, ref, ref1;
          _update = this.tmplUpdateClasses;
          if ((ref = config.type) === "if" || ref === "elsif") {
            return _.template("<%= " + (el.select("code").text()) + " %>");
          } else if ((ref1 = config.type) === "endif" || ref1 === "else") {
            return function() {};
          }
          codes = el.selectAll("code").each(function() {
            var src;
            src = this.textContent;
            return d3.select(this).datum(function() {
              return {
                fn: new Function("obj", "with(obj){\n  return (" + src + ");\n}")
              };
            });
          });
          return function(attributes) {
            var downdated, updated;
            codes.each(function(d) {
              d._old = this.textContent;
              return d._new = "" + (d.fn(attributes));
            }).text(function(d) {
              return d._new;
            });
            updated = codes.filter(function(d) {
              return d._old < d._new;
            }).classed(_update({
              up: 1
            }));
            downdated = codes.filter(function(d) {
              return d._old > d._new;
            }).classed(_update({
              down: 1
            }));
            return _.delay((function(_this) {
              return function() {
                updated.classed(_update({}));
                return downdated.classed(_update({}));
              };
            })(this), 300);
          };
        };

        TangleView.prototype.nodeToConfig = function(el) {
          "implements the ipytangle URL minilanguage\n- `:` a pure output view\n- `<undecided_namespace>:some_variable`\n- `:if` and `:endif`";
          var config, expression, namespace, ref, values;
          ref = el.attr("href").slice(1).split(":"), namespace = ref[0], expression = ref[1];
          config = {};
          switch (expression) {
            case "":
              config = {
                type: "output"
              };
              break;
            case "if":
            case "endif":
            case "else":
            case "elsif":
              config = {
                type: expression
              };
              break;
            default:
              config = {
                type: "variable",
                variable: expression
              };
              values = "_" + expression + "_choices";
              if (values in this.model.attributes) {
                config.choices = (function(_this) {
                  return function() {
                    return _this.model.get(values);
                  };
                })(this);
              }
          }
          config.template = this.template(el, config);
          return config || {};
        };

        TangleView.prototype.withType = function(selection, _type, handler) {
          return selection.filter(function(arg) {
            var type;
            type = arg.type;
            return type === _type;
          }).call(handler);
        };

        TangleView.prototype.onMarkdown = function(evt, arg) {
          var cell, found, tangles, view;
          cell = arg.cell;
          view = this;
          found = d3.select(cell.element[0]).selectAll("a[href^='#']:not(.tangle):not(.anchor-link)").each(function() {
            var it;
            it = d3.select(this);
            return it.datum(view.nodeToConfig(it));
          }).classed({
            tangle: 1
          });
          this.withType(found, "output", this.initOutput);
          this.withType(found, "variable", this.initVariable);
          this.withType(found, "if", this.initClassed("tangle_if"));
          this.withType(found, "else", this.initClassed("tangle_else"));
          this.withType(found, "elsif", this.initClassed("tangle_elsif"));
          this.withType(found, "endif", this.initClassed("tangle_endif"));
          tangles = d3.select(cell.element[0]).selectAll(".tangle");
          this.withType(tangles, "output", this.updateOutput);
          this.withType(tangles, "variable", this.updateVariable);
          this.withType(tangles, "if", this.updateIf);
          return this;
        };

        TangleView.prototype.initOutput = function(field) {
          var view;
          view = this;
          return field.classed({
            tangle_output: 1
          }).style({
            "text-decoration": "none",
            color: "black"
          });
        };

        TangleView.prototype.updateOutput = function(field) {
          var view;
          view = this;
          return field.each((function(_this) {
            return function(d) {
              return d.template(_this.context());
            };
          })(this)).each(function(d) {
            var el;
            el = d3.select(d);
            return view.listenTo(view.model, "change", function() {
              return d.template(view.context());
            });
          });
        };

        TangleView.prototype.initClassed = function(cls) {
          return function(field) {
            return field.classed(cls, 1).style({
              display: "none"
            });
          };
        };

        TangleView.prototype.stackMatch = function(elFor, pushers, poppers) {
          "Given a grammar of stack poppers and pushers\n\nif +\nelse -+\nelsif -+\nendif -\n\nand the current element, determine the next element";
          var found, sel, stack;
          stack = [];
          found = null;
          sel = [].concat(pushers).concat(poppers).map(function(sel) {
            return "." + sel;
          }).join(", ");
          d3.selectAll(sel).each(function() {
            var el, i, j, len, len1, popped, popper, pusher, results;
            if (found) {
              return;
            }
            el = d3.select(this);
            for (i = 0, len = poppers.length; i < len; i++) {
              popper = poppers[i];
              if (found) {
                continue;
              }
              if (el.classed(popper)) {
                popped = stack.pop();
                if (popped === elFor.node()) {
                  found = this;
                }
              }
            }
            results = [];
            for (j = 0, len1 = pushers.length; j < len1; j++) {
              pusher = pushers[j];
              if (el.classed(pusher)) {
                results.push(stack.push(this));
              } else {
                results.push(void 0);
              }
            }
            return results;
          });
          return d3.select(found);
        };

        TangleView.prototype.context = function() {
          var context;
          context = _.extend({}, this._env, this.model.attributes);
          return context;
        };

        TangleView.prototype.toggleRange = function(first, last, show) {
          var nodes, range, rawNodes;
          range = rangy.createRange();
          range.setStart(first.node());
          range.setEnd(last.node());
          rawNodes = range.getNodes();
          nodes = d3.selectAll(rawNodes);
          nodes.filter(function() {
            return this.nodeType === 3;
          }).each(function() {
            var ref;
            if (ref = this.parentNode, indexOf.call(rawNodes, ref) < 0) {
              return $(this).wrap("<span></span>");
            }
          });
          return nodes.filter(function() {
            return this.nodeType !== 3;
          }).classed({
            hide: !show
          });
        };

        TangleView.prototype.updateIf = function(field) {
          var view;
          view = this;
          return field.each(function(d) {
            var change, el;
            el = d3.select(this);
            change = function() {
              var current, poppers, prev, pushers, results, show;
              pushers = ["tangle_if", "tangle_else", "tangle_elsif"];
              poppers = ["tangle_endif", "tangle_else", "tangle_elsif"];
              current = el;
              show = false;
              results = [];
              while (!current.classed("tangle_endif")) {
                if (current === el) {
                  show = "true" === d.template(view.context());
                } else if (current.classed("tangle_else")) {
                  show = !show;
                }
                prev = current;
                current = view.stackMatch(prev, pushers, poppers);
                if (current.classed("tangle_endif")) {
                  break;
                }
                results.push(view.toggleRange(prev, current, show));
              }
              return results;
            };
            view.listenTo(view.model, "change", change);
            change();
            return change();
          });
        };

        TangleView.prototype.updateVariable = function(field) {
          var view;
          view = this;
          return field.each(function(arg) {
            var template;
            template = arg.template;
            return template(view.context());
          }).each(function(arg) {
            var el, template, variable;
            variable = arg.variable, template = arg.template;
            el = d3.select(this);
            return view.listenTo(view.model, "change:" + variable, function() {
              return template(view.context());
            });
          });
        };

        TangleView.prototype.initVariable = function(field) {
          var view;
          view = this;
          field.classed({
            tangle_variable: 1
          }).style({
            "text-decoration": "none",
            "border-bottom": "dotted 1px blue"
          });
          field.filter(function(arg) {
            var choices, variable;
            choices = arg.choices, variable = arg.variable;
            return !choices && typeof view.model.attributes[variable] === "number";
          }).call(this.initVariableNumeric);
          field.filter(function(arg) {
            var choices;
            choices = arg.choices;
            return choices;
          }).call(this.initVariableChoices);
          return field.each(this.tooltip);
        };

        TangleView.prototype.initVariableChoices = function(field) {
          return field.attr({
            title: "click"
          }).on("click", (function(_this) {
            return function(d) {
              var choices, old, old_idx;
              old = _this.model.get(d.variable);
              choices = d.choices();
              old_idx = choices.indexOf(old);
              _this.model.set(d.variable, choices[modulo(old_idx + 1, choices.length)]);
              return _this.touch();
            };
          })(this));
        };

        TangleView.prototype.initVariableNumeric = function(field) {
          var _touch, drag;
          _touch = _.debounce((function(_this) {
            return function() {
              return _this.touch();
            };
          })(this));
          drag = d3.behavior.drag().on("drag", (function(_this) {
            return function(d) {
              var old;
              old = _this.model.get(d.variable);
              _this.model.set(d.variable, d3.event.dx + old);
              return _touch();
            };
          })(this));
          return field.attr({
            title: "drag"
          }).style({
            cursor: "ew-resize"
          }).call(drag);
        };

        TangleView.prototype.tooltip = function() {
          return $(this).tooltip({
            placement: "bottom",
            container: "body"
          });
        };

        return TangleView;

      })(widget.WidgetView)
    };
  });

}).call(this);
