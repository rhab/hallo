/* Hallo 1.0.2 - rich text editor for jQuery UI
* by Henri Bergius and contributors. Available under the MIT license.
* See http://hallojs.org for more information
*/(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.hallo', {
      toolbar: null,
      bound: false,
      originalContent: '',
      previousContent: '',
      uuid: '',
      selection: null,
      _keepActivated: false,
      originalHref: null,
      options: {
        editable: true,
        plugins: {},
        toolbar: 'halloToolbarContextual',
        parentElement: 'body',
        buttonCssClass: null,
        toolbarCssClass: null,
        toolbarPositionAbove: false,
        toolbarOptions: {},
        placeholder: '',
        forceStructured: true,
        checkTouch: true,
        touchScreen: null
      },
      _create: function() {
        var options, plugin, _ref,
          _this = this;
        this.id = this._generateUUID();
        if (this.options.checkTouch && this.options.touchScreen === null) {
          this.checkTouch();
        }
        _ref = this.options.plugins;
        for (plugin in _ref) {
          options = _ref[plugin];
          if (!jQuery.isPlainObject(options)) {
            options = {};
          }
          jQuery.extend(options, {
            editable: this,
            uuid: this.id,
            buttonCssClass: this.options.buttonCssClass
          });
          jQuery(this.element)[plugin](options);
        }
        this.element.one('halloactivated', function() {
          return _this._prepareToolbar();
        });
        return this.originalContent = this.getContents();
      },
      _init: function() {
        if (this.options.editable) {
          return this.enable();
        } else {
          return this.disable();
        }
      },
      destroy: function() {
        var options, plugin, _ref;
        this.disable();
        if (this.toolbar) {
          this.toolbar.remove();
          this.element[this.options.toolbar]('destroy');
        }
        _ref = this.options.plugins;
        for (plugin in _ref) {
          options = _ref[plugin];
          jQuery(this.element)[plugin]('destroy');
        }
        return jQuery.Widget.prototype.destroy.call(this);
      },
      disable: function() {
        var _this = this;
        this.element.attr("contentEditable", false);
        this.element.off("focus", this._activated);
        this.element.off("blur", this._deactivated);
        this.element.off("keyup paste change", this._checkModified);
        this.element.off("keyup", this._keys);
        this.element.off("keyup mouseup", this._checkSelection);
        this.bound = false;
        jQuery(this.element).removeClass('isModified');
        jQuery(this.element).removeClass('inEditMode');
        this.element.parents('a').addBack().each(function(idx, elem) {
          var element;
          element = jQuery(elem);
          if (!element.is('a')) {
            return;
          }
          if (!_this.originalHref) {
            return;
          }
          return element.attr('href', _this.originalHref);
        });
        return this._trigger("disabled", null);
      },
      enable: function() {
        var _this = this;
        this.element.parents('a[href]').addBack().each(function(idx, elem) {
          var element;
          element = jQuery(elem);
          if (!element.is('a[href]')) {
            return;
          }
          _this.originalHref = element.attr('href');
          return element.removeAttr('href');
        });
        this.element.attr("contentEditable", true);
        if (!jQuery.parseHTML(this.element.html())) {
          this.element.html(this.options.placeholder);
          this.element.css({
            'min-width': this.element.innerWidth(),
            'min-height': this.element.innerHeight()
          });
        }
        if (!this.bound) {
          this.element.on("focus", this, this._activated);
          this.element.on("blur", this, this._deactivated);
          this.element.on("keyup paste change", this, this._checkModified);
          this.element.on("keyup", this, this._keys);
          this.element.on("keyup mouseup", this, this._checkSelection);
          this.bound = true;
        }
        if (this.options.forceStructured) {
          this._forceStructured();
        }
        return this._trigger("enabled", null);
      },
      activate: function() {
        return this.element.focus();
      },
      containsSelection: function() {
        var range;
        range = this.getSelection();
        return this.element.has(range.startContainer).length > 0;
      },
      getSelection: function() {
        var range, sel;
        sel = rangy.getSelection();
        range = null;
        if (sel.rangeCount > 0) {
          range = sel.getRangeAt(0);
        } else {
          range = rangy.createRange();
        }
        return range;
      },
      restoreSelection: function(range) {
        var sel;
        sel = rangy.getSelection();
        return sel.setSingleRange(range);
      },
      replaceSelection: function(cb) {
        var newTextNode, r, range, sel, t;
        if (navigator.appName === 'Microsoft Internet Explorer') {
          t = document.selection.createRange().text;
          r = document.selection.createRange();
          return r.pasteHTML(cb(t));
        } else {
          sel = window.getSelection();
          range = sel.getRangeAt(0);
          newTextNode = document.createTextNode(cb(range.extractContents()));
          range.insertNode(newTextNode);
          range.setStartAfter(newTextNode);
          sel.removeAllRanges();
          return sel.addRange(range);
        }
      },
      removeAllSelections: function() {
        if (navigator.appName === 'Microsoft Internet Explorer') {
          return range.empty();
        } else {
          return window.getSelection().removeAllRanges();
        }
      },
      getPluginInstance: function(plugin) {
        var instance;
        instance = jQuery(this.element).data("IKS-" + plugin);
        if (instance) {
          return instance;
        }
        return jQuery(this.element).data(plugin);
      },
      getContents: function() {
        var cleanup, plugin;
        for (plugin in this.options.plugins) {
          cleanup = this.getPluginInstance(plugin).cleanupContentClone;
          if (!jQuery.isFunction(cleanup)) {
            continue;
          }
          jQuery(this.element)[plugin]('cleanupContentClone', this.element);
        }
        return this.element.html();
      },
      setContents: function(contents) {
        return this.element.html(contents);
      },
      isModified: function() {
        if (!this.previousContent) {
          this.previousContent = this.originalContent;
        }
        return this.previousContent !== this.getContents();
      },
      setUnmodified: function() {
        jQuery(this.element).removeClass('isModified');
        return this.previousContent = this.getContents();
      },
      setModified: function() {
        jQuery(this.element).addClass('isModified');
        return this._trigger('modified', null, {
          editable: this,
          content: this.getContents()
        });
      },
      restoreOriginalContent: function() {
        return this.element.html(this.originalContent);
      },
      execute: function(command, value) {
        if (document.execCommand(command, false, value)) {
          return this.element.trigger("change");
        }
      },
      protectFocusFrom: function(el) {
        var _this = this;
        return el.on("mousedown", function(event) {
          event.preventDefault();
          _this._protectToolbarFocus = true;
          return setTimeout(function() {
            return _this._protectToolbarFocus = false;
          }, 300);
        });
      },
      keepActivated: function(_keepActivated) {
        this._keepActivated = _keepActivated;
      },
      _generateUUID: function() {
        var S4;
        S4 = function() {
          return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
        };
        return "" + (S4()) + (S4()) + "-" + (S4()) + "-" + (S4()) + "-" + (S4()) + "-" + (S4()) + (S4()) + (S4());
      },
      _prepareToolbar: function() {
        var defaults, plugin, populate, toolbarOptions;
        this.toolbar = jQuery('<div class="hallotoolbar"></div>').hide();
        if (this.options.toolbarCssClass) {
          this.toolbar.addClass(this.options.toolbarCssClass);
        }
        defaults = {
          editable: this,
          parentElement: this.options.parentElement,
          toolbar: this.toolbar,
          positionAbove: this.options.toolbarPositionAbove
        };
        toolbarOptions = jQuery.extend({}, defaults, this.options.toolbarOptions);
        this.element[this.options.toolbar](toolbarOptions);
        for (plugin in this.options.plugins) {
          populate = this.getPluginInstance(plugin).populateToolbar;
          if (!jQuery.isFunction(populate)) {
            continue;
          }
          this.element[plugin]('populateToolbar', this.toolbar);
        }
        this.element[this.options.toolbar]('setPosition');
        return this.protectFocusFrom(this.toolbar);
      },
      changeToolbar: function(element, toolbar, hide) {
        var originalToolbar;
        if (hide == null) {
          hide = false;
        }
        originalToolbar = this.options.toolbar;
        this.options.parentElement = element;
        if (toolbar) {
          this.options.toolbar = toolbar;
        }
        if (!this.toolbar) {
          return;
        }
        this.element[originalToolbar]('destroy');
        this.toolbar.remove();
        this._prepareToolbar();
        if (hide) {
          return this.toolbar.hide();
        }
      },
      _checkModified: function(event) {
        var widget;
        widget = event.data;
        if (widget.isModified()) {
          return widget.setModified();
        }
      },
      _keys: function(event) {
        var old, widget;
        widget = event.data;
        if (event.keyCode === 27) {
          old = widget.getContents();
          widget.restoreOriginalContent(event);
          widget._trigger("restored", null, {
            editable: widget,
            content: widget.getContents(),
            thrown: old
          });
          return widget.turnOff();
        }
      },
      _rangesEqual: function(r1, r2) {
        if (r1.startContainer !== r2.startContainer) {
          return false;
        }
        if (r1.startOffset !== r2.startOffset) {
          return false;
        }
        if (r1.endContainer !== r2.endContainer) {
          return false;
        }
        if (r1.endOffset !== r2.endOffset) {
          return false;
        }
        return true;
      },
      _checkSelection: function(event) {
        var widget;
        if (event.keyCode === 27) {
          return;
        }
        widget = event.data;
        return setTimeout(function() {
          var sel;
          sel = widget.getSelection();
          if (widget._isEmptySelection(sel) || widget._isEmptyRange(sel)) {
            if (widget.selection) {
              widget.selection = null;
              widget._trigger("unselected", null, {
                editable: widget,
                originalEvent: event
              });
            }
            return;
          }
          if (!widget.selection || !widget._rangesEqual(sel, widget.selection)) {
            widget.selection = sel.cloneRange();
            return widget._trigger("selected", null, {
              editable: widget,
              selection: widget.selection,
              ranges: [widget.selection],
              originalEvent: event
            });
          }
        }, 0);
      },
      _isEmptySelection: function(selection) {
        if (selection.type === "Caret") {
          return true;
        }
        return false;
      },
      _isEmptyRange: function(range) {
        if (range.collapsed) {
          return true;
        }
        if (range.isCollapsed) {
          if (typeof range.isCollapsed === 'function') {
            return range.isCollapsed();
          }
          return range.isCollapsed;
        }
        return false;
      },
      turnOn: function() {
        if (this.getContents() === this.options.placeholder) {
          this.setContents('');
        }
        jQuery(this.element).addClass('inEditMode');
        return this._trigger("activated", null, this);
      },
      turnOff: function() {
        jQuery(this.element).removeClass('inEditMode');
        this._trigger("deactivated", null, this);
        if (!this.getContents()) {
          return this.setContents(this.options.placeholder);
        }
      },
      _activated: function(event) {
        return event.data.turnOn();
      },
      _deactivated: function(event) {
        if (event.data._keepActivated) {
          return;
        }
        if (event.data._protectToolbarFocus !== true) {
          return event.data.turnOff();
        } else {
          return setTimeout(function() {
            return jQuery(event.data.element).focus();
          }, 300);
        }
      },
      _forceStructured: function(event) {
        var e;
        try {
          return document.execCommand('styleWithCSS', 0, false);
        } catch (_error) {
          e = _error;
          try {
            return document.execCommand('useCSS', 0, true);
          } catch (_error) {
            e = _error;
            try {
              return document.execCommand('styleWithCSS', false, false);
            } catch (_error) {
              e = _error;
            }
          }
        }
      },
      checkTouch: function() {
        return this.options.touchScreen = !!('createTouch' in document);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    var z;
    z = null;
    if (this.VIE !== void 0) {
      z = new VIE;
      z.use(new z.StanbolService({
        proxyDisabled: true,
        url: 'http://dev.iks-project.eu:8081'
      }));
    }
    return jQuery.widget('IKS.halloannotate', {
      options: {
        vie: z,
        editable: null,
        toolbar: null,
        uuid: '',
        select: function() {},
        decline: function() {},
        remove: function() {},
        buttonCssClass: null
      },
      _create: function() {
        var editableElement, turnOffAnnotate, widget;
        widget = this;
        if (this.options.vie === void 0) {
          throw new Error('The halloannotate plugin requires VIE');
          return;
        }
        if (typeof this.element.annotate !== 'function') {
          throw new Error('The halloannotate plugin requires annotate.js');
          return;
        }
        this.state = 'off';
        this.instantiate();
        turnOffAnnotate = function() {
          var editable;
          editable = this;
          return jQuery(editable).halloannotate('turnOff');
        };
        editableElement = this.options.editable.element;
        return editableElement.on('hallodisabled', turnOffAnnotate);
      },
      populateToolbar: function(toolbar) {
        var buttonHolder,
          _this = this;
        buttonHolder = jQuery("<span class=\"" + this.widgetName + "\"></span>");
        this.button = buttonHolder.hallobutton({
          label: 'Annotate',
          icon: 'icon-tags',
          editable: this.options.editable,
          command: null,
          uuid: this.options.uuid,
          cssClass: this.options.buttonCssClass,
          queryState: false
        });
        buttonHolder.on('change', function(event) {
          if (_this.state === "pending") {
            return;
          }
          if (_this.state === "off") {
            return _this.turnOn();
          }
          return _this.turnOff();
        });
        buttonHolder.buttonset();
        return toolbar.append(this.button);
      },
      cleanupContentClone: function(el) {
        if (this.state === 'on') {
          return el.find(".entity:not([about])").each(function() {
            return jQuery(this).replaceWith(jQuery(this).html());
          });
        }
      },
      instantiate: function() {
        var widget;
        widget = this;
        return this.options.editable.element.annotate({
          vie: this.options.vie,
          debug: false,
          showTooltip: true,
          select: this.options.select,
          remove: this.options.remove,
          success: this.options.success,
          error: this.options.error
        }).on('annotateselect', function(event, data) {
          return widget.options.editable.setModified();
        }).on('annotateremove', function() {
          return jQuery.noop();
        });
      },
      turnPending: function() {
        this.state = 'pending';
        this.button.hallobutton('checked', false);
        return this.button.hallobutton('disable');
      },
      turnOn: function() {
        var e, widget,
          _this = this;
        this.turnPending();
        widget = this;
        try {
          return this.options.editable.element.annotate('enable', function(success) {
            if (!success) {
              return;
            }
            _this.state = 'on';
            _this.button.hallobutton('checked', true);
            return _this.button.hallobutton('enable');
          });
        } catch (_error) {
          e = _error;
          return alert(e);
        }
      },
      turnOff: function() {
        this.options.editable.element.annotate('disable');
        this.state = 'off';
        if (!this.button) {
          return;
        }
        this.button.attr('checked', false);
        this.button.find("label").removeClass("ui-state-clicked");
        return this.button.button('refresh');
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.halloblacklist', {
      options: {
        tags: []
      },
      _init: function() {
        if (this.options.tags.indexOf('br') !== -1) {
          return this.element.on('keydown', function(event) {
            if (event.originalEvent.keyCode === 13) {
              return event.preventDefault();
            }
          });
        }
      },
      cleanupContentClone: function(el) {
        var tag, _i, _len, _ref, _results;
        _ref = this.options.tags;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tag = _ref[_i];
          _results.push(jQuery(tag, el).remove());
        }
        return _results;
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.halloblock', {
      options: {
        editable: null,
        toolbar: null,
        uuid: '',
        elements: ['h1', 'h2', 'h3', 'p', 'pre', 'blockquote'],
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var buttonset, contentId, target;
        buttonset = jQuery("<span class=\"" + this.widgetName + "\"></span>");
        contentId = "" + this.options.uuid + "-" + this.widgetName + "-data";
        target = this._prepareDropdown(contentId);
        toolbar.append(buttonset);
        buttonset.hallobuttonset();
        buttonset.append(target);
        return buttonset.append(this._prepareButton(target));
      },
      _prepareDropdown: function(contentId) {
        var addElement, containingElement, contentArea, element, _i, _len, _ref,
          _this = this;
        contentArea = jQuery("<div id=\"" + contentId + "\"></div>");
        containingElement = this.options.editable.element.get(0).tagName.toLowerCase();
        addElement = function(element) {
          var el, events, queryState;
          el = jQuery("<button class='blockselector'>          <" + element + " class=\"menu-item\">" + element + "</" + element + ">        </button>");
          if (containingElement === element) {
            el.addClass('selected');
          }
          if (containingElement !== 'div') {
            el.addClass('disabled');
          }
          el.on('click', function() {
            var tagName;
            tagName = element.toUpperCase();
            if (el.hasClass('disabled')) {
              return;
            }
            if (navigator.appName === 'Microsoft Internet Explorer') {
              _this.options.editable.execute('FormatBlock', "<" + tagName + ">");
              return;
            }
            return _this.options.editable.execute('formatBlock', tagName);
          });
          queryState = function(event) {
            var block;
            block = document.queryCommandValue('formatBlock');
            if (block.toLowerCase() === element) {
              el.addClass('selected');
              return;
            }
            return el.removeClass('selected');
          };
          events = 'keyup paste change mouseup';
          _this.options.editable.element.on(events, queryState);
          _this.options.editable.element.on('halloenabled', function() {
            return _this.options.editable.element.on(events, queryState);
          });
          _this.options.editable.element.on('hallodisabled', function() {
            return _this.options.editable.element.off(events, queryState);
          });
          return el;
        };
        _ref = this.options.elements;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          element = _ref[_i];
          contentArea.append(addElement(element));
        }
        return contentArea;
      },
      _prepareButton: function(target) {
        var buttonElement;
        buttonElement = jQuery('<span></span>');
        buttonElement.hallodropdownbutton({
          uuid: this.options.uuid,
          editable: this.options.editable,
          label: 'block',
          icon: 'icon-text-height',
          target: target,
          cssClass: this.options.buttonCssClass
        });
        return buttonElement;
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.capsula", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 540,
          height: 200,
          title: "Ingresar C\u00E1psula",
          buttonTitle: "Aceptar",
          buttonUpdateTitle: "Aceptar",
          modal: true,
          resizable: false,
          draggable: true,
          dialogClass: 'capsula-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, cargadosCombos, dialog, dialogId, dialogSubmitBorrar, dialogSubmitCb, existe, isEmptyLink, texto, urlInput, widget,
          _this = this;
        widget = this;
        existe = false;
        texto = "";
        cargadosCombos = false;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\" style=\"cursor:default;\">        <form action=\"#\" method=\"post\" class=\"linkForm\" >          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />                      <select id=\"filterCap\" class=\"filterChooser\" style=\"width:45%;\" title=\"C&aacute;psulas\">              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione una C&aacute;psula --</option>          </select>                    <select id=\"filterPer\" class=\"filterChooser\" style=\"width:15%;\" title=\"Periodos\">          </select><br />          <input type=\"submit\" id=\"dellinkButton\" value=\"Borrar\"/>          <input type=\"submit\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form></div>");
        urlInput = jQuery('input[name=url]', dialog);
        isEmptyLink = function(link) {
          if ((new RegExp(/^\s*$/)).test(link)) {
            return true;
          }
          if (link === widget.options.defaultUrl) {
            return true;
          }
          return false;
        };
        dialogSubmitBorrar = function(event) {
          event.preventDefault();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          document.execCommand("unlink", null, "");
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialogSubmitCb = function(event) {
          var codCapsula, codPeriodo, link, linkNode, nodoLink, resaltado;
          event.preventDefault();
          link = "javascript:void(0)";
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          codCapsula = (jQuery("#filterCap option:selected")).val();
          codPeriodo = (jQuery("#filterPer option:selected")).val();
          if (codCapsula === "") {
            resaltado = "capOscuroResaltadoEditor";
          } else {
            resaltado = "capResaltadoEditor";
          }
          if (existe) {
            nodoLink = widget.lastSelection.startContainer.parentNode;
            jQuery(nodoLink).attr('data-cap', codCapsula);
            jQuery(nodoLink).attr('data-per', codPeriodo);
            jQuery(nodoLink).attr('class', resaltado + " resaltadoEditor");
            jQuery(nodoLink).attr('title', "C\u00E1psula " + codCapsula + " ## Periodo " + codPeriodo);
            jQuery(nodoLink).attr('data-dsl', "capf(\'" + codCapsula + "\',\'" + codPeriodo + "\')");
          } else {
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue;
            linkNode = jQuery("<a class=\"" + resaltado + (" resaltadoEditor\"             title=\"C&aacute;psula " + codCapsula + " ## Periodo " + codPeriodo + "\"             data-dsl=\"capf('" + codCapsula + "','" + codPeriodo + "')\"             data-cap=\"" + codCapsula + "\"             data-per=\"" + codPeriodo + "\"             href='" + link + "'>" + texto + "</a>"))[0];
            widget.lastSelection.insertNode(linkNode);
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("#addlinkButton").click(dialogSubmitCb);
        dialog.find("#dellinkButton").click(dialogSubmitBorrar);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'C&aacute;psula',
            icon: 'capsula-button',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var selectionParent;
            if (!cargadosCombos) {
              jQuery('.capsel').find('option').clone().appendTo('#filterCap');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPer');
              jQuery('#filterPer').val('ACT');
              cargadosCombos = true;
            }
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery("#filterCap").val("");
              jQuery("#filterPer").val("");
              existe = false;
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              jQuery("#filterCap").val(jQuery(selectionParent).attr('data-cap'));
              jQuery("#filterPer").val(jQuery(selectionParent).attr('data-per'));
              texto = jQuery(selectionParent).text();
              existe = true;
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open').dialog({
              position: {
                my: "top",
                at: "top",
                of: window
              }
            });
            toolbar.hide();
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    var rangyMessage;
    rangyMessage = 'The hallocleanhtml plugin requires the selection save and\
    restore module from Rangy';
    return jQuery.widget('IKS.hallocleanhtml', {
      _create: function() {
        var editor,
          _this = this;
        if (jQuery.htmlClean === void 0) {
          throw new Error('The hallocleanhtml plugin requires jQuery.htmlClean');
          return;
        }
        editor = this.element;
        return editor.bind('paste', this, function(event) {
          var lastContent, lastRange, widget;
          if (rangy.saveSelection === void 0) {
            throw new Error(rangyMessage);
            return;
          }
          widget = event.data;
          widget.options.editable.getSelection().deleteContents();
          lastRange = rangy.saveSelection();
          lastContent = editor.html();
          editor.html('');
          return setTimeout(function() {
            var cleanPasted, error, pasted, range;
            pasted = editor.html();
            cleanPasted = jQuery.htmlClean(pasted, _this.options);
            editor.html(lastContent);
            rangy.restoreSelection(lastRange);
            if (cleanPasted !== '') {
              try {
                return document.execCommand('insertHTML', false, cleanPasted);
              } catch (_error) {
                error = _error;
                range = widget.options.editable.getSelection();
                return range.insertNode(range.createContextualFragment(cleanPasted));
              }
            }
          }, 4);
        });
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.condicion", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 750,
          height: "auto",
          title: "Ingresar Condici\u00F3n",
          buttonTitle: "Aceptar",
          buttonUpdateTitle: "Aceptar",
          modal: true,
          resizable: false,
          stack: true,
          draggable: true,
          dialogClass: 'condicion-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, cargadosCombos, cargarTipoOperando, dialog, dialogId, dialogSubmitBorrar, dialogSubmitCb, existe, generarOperando, ocultarCampos, texto, urlInput, widget,
          _this = this;
        widget = this;
        existe = false;
        texto = "";
        cargadosCombos = false;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\" style=\"cursor:default;\">        <form action=\"#\" method=\"post\" class=\"linkForm\">          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />          <TABLE>          	<TR>	    				<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid red;\">			          <legend>Operando 1</legend>			          <input type='radio' name='op1' style='margin: 10px;' value='capsula'>C&aacute;psula</input>  							<input type='radio' name='op1' style='margin: 10px;' value='constante'>Constante</input>			          </br>			          <select id=\"filterCapCon1\" class=\"caps1 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>			          </select>			          			          <select id=\"filterPerCon1\" class=\"caps1 caps\" style=\"width:25%;\"  title=\"Periodos\">			          </select>			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante1\" style=\"width:80%;\" value=\"\" />			          </fieldset>          		</TD>          		<TD style=\"padding: 2px;width:10%;\">			          <fieldset style=\"border:2px solid black;\">			          <legend>Operaci\u00F3n</legend>				          <select id=\"filterOpe\" class=\"filterChooser\" style=\"width:100%;font-size: 14px;font-weight: bold;\" title=\"Operaci\u00F3n\">				              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Op.</option>				              <option value=\"+\" data-filter-type=\"\" >&nbsp;+</option>				              <option value=\"-\" data-filter-type=\"\" >&nbsp;-</option>				              <option value=\"*\" data-filter-type=\"\" >&nbsp;*</option>				              <option value=\"/\" data-filter-type=\"\" >&nbsp;/</option>				          </select>				        </fieldset>			        </TD>          		<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid blue;\">			          <legend>Operando 2</legend>			          <input type='radio' name='op2' style='margin: 10px;' value='capsula'>C&aacute;psula</input>  							<input type='radio' name='op2' style='margin: 10px;' value='constante'>Constante</input>			          </br>			          <select id=\"filterCapCon2\" class=\"caps2 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>			          </select>			          			          <select id=\"filterPerCon2\" class=\"caps2 caps\" style=\"width:25%;\"  title=\"Periodos\">			          </select>			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante2\" style=\"margin:0px;width:80%;\" value=\"\" />			          </fieldset>			        </TD>            </TR>          </TABLE>                              <TABLE>          	<TR>	    				<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid black;\">						    <legend>Comparaci\u00F3n</legend>			          <select id=\"filterComp\" class=\"filterChooser\" style=\"width:25%;font-size: 14px;font-weight: bold;\" title=\"Comparaci\u00F3n\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Comparaci\u00F3n\ --</option>			              <option value=\"=\" data-filter-type=\"\" >==</option>			              <option value=\"<>\" data-filter-type=\"\" ><></option>			              <option value=\"<=\" data-filter-type=\"\" ><=</option>			              <option value=\">=\" data-filter-type=\"\" >>=</option>			              <option value=\"<\" data-filter-type=\"\" ><</option>			              <option value=\">\" data-filter-type=\"\" >></option>			          </select>			          </fieldset>              </TD>            </TR>          </TABLE>                              <TABLE>          	<TR>	    				<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid red;\">			          <legend>Operando 3</legend>			          <input type='radio' name='op3' style='margin: 10px;' value='capsula'>C&aacute;psula</input>  							<input type='radio' name='op3' style='margin: 10px;' value='constante'>Constante</input>			          </br>			          <select id=\"filterCapCon3\" class=\"caps3 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>			          </select>			          			          <select id=\"filterPerCon3\" class=\"caps3 caps\" style=\"width:25%;\"  title=\"Periodos\">			          </select>			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante3\" style=\"margin:0px;width:80%;\" value=\"\" />			          </fieldset>          		</TD>          		<TD style=\"padding: 2px;width:10%;\">			          <fieldset style=\"border:2px solid black;\">			          <legend>Operaci\u00F3n</legend>				          <select id=\"filterOpe2\" class=\"filterChooser\" style=\"width:100%;font-size: 14px;font-weight: bold;\" title=\"Operaci\u00F3n\">				              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Op.</option>				              <option value=\"+\" data-filter-type=\"\" >&nbsp;+</option>				              <option value=\"-\" data-filter-type=\"\" >&nbsp;-</option>				              <option value=\"*\" data-filter-type=\"\" >&nbsp;*</option>				              <option value=\"/\" data-filter-type=\"\" >&nbsp;/</option>				          </select>				        </fieldset>			        </TD>          		<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid blue;\">			          <legend>Operando 4</legend>			          <input type='radio' name='op4' style='margin: 10px;' value='capsula'>C&aacute;psula</input>  							<input type='radio' name='op4' style='margin: 10px;' value='constante'>Constante</input>			          </br>			          <select id=\"filterCapCon4\" class=\"caps4 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>			          </select>			          			          <select id=\"filterPerCon4\" class=\"caps4 caps\" style=\"width:25%;\"  title=\"Periodos\">			          </select>			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante4\" style=\"margin:0px;width:80%;\" value=\"\" />			          </fieldset>			        </TD>            </TR>          </TABLE>                    <fieldset style=\"border:2px solid black;\">			          <legend>Resultado</legend>          <TABLE>          	<TR>	    				<TD style=\"padding: 2px;\">Verdadero:</TD>	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"tval\" style=\"width:25%;\" value=\"\" /></TD>          	</TR>          	<TR>	    				<TD style=\"padding: 2px;\">Falso:</TD>	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"fval\" style=\"width:25%;\" value=\"\" /></TD>          	</TR>          </TABLE>          </fieldset>                    <fieldset style=\"border:2px solid black;\">			          <legend>Texto</legend>          <div id='dialogTextoId' class='contenidoEditorDialog'>          </div>          </fieldset>                    <input type=\"submit\" style=\"margin:6px;\" id=\"dellinkButton\" value=\"Borrar\"/>          <input type=\"submit\" style=\"margin:6px;\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form>        </div>");
        urlInput = jQuery('input[name=url]', dialog);
        cargarTipoOperando = function(tipoOp, nombreSufijo) {
          if (tipoOp === 'capsula') {
            jQuery("input:radio[name=op" + nombreSufijo + "]")[0].checked = true;
            jQuery("#constante" + nombreSufijo).hide();
            return jQuery(".caps" + nombreSufijo).show();
          } else {
            jQuery("input:radio[name=op" + nombreSufijo + "]")[1].checked = true;
            jQuery("#constante" + nombreSufijo).show();
            return jQuery(".caps" + nombreSufijo).hide();
          }
        };
        ocultarCampos = function(nombreSufijo) {
          return jQuery("input:radio[name=op" + nombreSufijo + "]").on("change", (function(event) {
            if (jQuery("input:radio[name=op" + nombreSufijo + "]")[0].checked) {
              jQuery("#constante" + nombreSufijo).hide();
              return jQuery(".caps" + nombreSufijo).show();
            } else {
              jQuery("#constante" + nombreSufijo).show();
              return jQuery(".caps" + nombreSufijo).hide();
            }
          }));
        };
        generarOperando = function(nombreSufijo) {
          var codCap, codPer, funcion;
          if (jQuery("input:radio[name=op" + nombreSufijo + "]")[0].checked) {
            codCap = (jQuery("#filterCapCon" + nombreSufijo + " option:selected")).val();
            codPer = (jQuery("#filterPerCon" + nombreSufijo + " option:selected")).val();
            if (codCap === "" || codPer === "") {
              funcion = "";
              texto = "";
            } else {
              funcion = "cap('" + codCap + "','" + codPer + "')";
              texto = "[C\u00E1psula " + codCap + " del Periodo " + codPer + "]";
            }
            return {
              'dsl': funcion,
              'txt': texto,
              'tipo': 'capsula'
            };
          } else {
            return {
              'dsl': (jQuery("#constante" + nombreSufijo)).val(),
              'txt': (jQuery("#constante" + nombreSufijo)).val(),
              'tipo': 'constante'
            };
          }
        };
        dialogSubmitBorrar = function(event) {
          event.preventDefault();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          document.execCommand("unlink", null, "");
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialogSubmitCb = function(event) {
          var codCapsula1, codCapsula2, codCapsula3, codCapsula4, codPeriodo1, codPeriodo2, codPeriodo3, codPeriodo4, comparacion, constante1, constante2, constante3, constante4, fval, link, linkNode, nodoLink, op1f, op2f, op3f, op4f, operacion, operacion2, tval;
          event.preventDefault();
          link = "javascript:void(0)";
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          codCapsula1 = (jQuery("#filterCapCon1 option:selected")).val();
          codPeriodo1 = (jQuery("#filterPerCon1 option:selected")).val();
          operacion = (jQuery("#filterOpe option:selected")).val();
          codCapsula2 = (jQuery("#filterCapCon2 option:selected")).val();
          codPeriodo2 = (jQuery("#filterPerCon2 option:selected")).val();
          codCapsula3 = (jQuery("#filterCapCon3 option:selected")).val();
          codPeriodo3 = (jQuery("#filterPerCon3 option:selected")).val();
          operacion2 = (jQuery("#filterOpe2 option:selected")).val();
          codCapsula4 = (jQuery("#filterCapCon4 option:selected")).val();
          codPeriodo4 = (jQuery("#filterPerCon4 option:selected")).val();
          comparacion = (jQuery("#filterComp option:selected")).val();
          constante1 = (jQuery("#constante1")).val();
          constante2 = (jQuery("#constante2")).val();
          constante3 = (jQuery("#constante3")).val();
          constante4 = (jQuery("#constante4")).val();
          tval = (jQuery("#tval")).val();
          fval = (jQuery("#fval")).val();
          op1f = generarOperando('1');
          op2f = generarOperando('2');
          op3f = generarOperando('3');
          op4f = generarOperando('4');
          if (existe) {
            nodoLink = widget.lastSelection.startContainer.parentNode;
            jQuery(nodoLink).attr('data-cap', codCapsula1);
            jQuery(nodoLink).attr('data-per', codPeriodo1);
            jQuery(nodoLink).attr('data-ope', operacion);
            jQuery(nodoLink).attr('data-cap2', codCapsula2);
            jQuery(nodoLink).attr('data-per2', codPeriodo2);
            jQuery(nodoLink).attr('data-cap3', codCapsula3);
            jQuery(nodoLink).attr('data-per3', codPeriodo3);
            jQuery(nodoLink).attr('data-ope2', operacion2);
            jQuery(nodoLink).attr('data-cap4', codCapsula4);
            jQuery(nodoLink).attr('data-per4', codPeriodo4);
            jQuery(nodoLink).attr('data-comp', comparacion);
            jQuery(nodoLink).attr('data-constante1', constante1);
            jQuery(nodoLink).attr('data-constante2', constante2);
            jQuery(nodoLink).attr('data-constante3', constante3);
            jQuery(nodoLink).attr('data-constante4', constante4);
            jQuery(nodoLink).attr('data-tipoOperando1', op1f.tipo);
            jQuery(nodoLink).attr('data-tipoOperando2', op2f.tipo);
            jQuery(nodoLink).attr('data-tipoOperando3', op3f.tipo);
            jQuery(nodoLink).attr('data-tipoOperando4', op4f.tipo);
            jQuery(nodoLink).attr('data-tval', tval);
            jQuery(nodoLink).attr('data-fval', fval);
            jQuery(nodoLink).attr('class', "conResaltadoEditor resaltadoEditor");
            jQuery(nodoLink).attr('title', "SI " + op1f.txt + " " + operacion + " " + op2f.txt + " " + comparacion + " " + op3f.txt + " " + operacion2 + " " + op4f.txt + " ENTONCES " + tval + " SINO " + fval);
            jQuery(nodoLink).attr('data-dsl', "if(" + op1f.dsl + " " + operacion + " " + op2f.dsl + " " + comparacion + " " + op3f.dsl + " " + operacion2 + " " + op4f.dsl + ",                 '" + tval + "', '" + fval + "')");
          } else {
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue;
            linkNode = jQuery("<a class=\"conResaltadoEditor resaltadoEditor\"             title=\"SI " + op1f.txt + " " + operacion + " " + op2f.txt + " " + comparacion + " " + op3f.txt + " " + operacion2 + " " + op4f.txt + " ENTONCES " + tval + " SINO " + fval + "\"             data-dsl=\"if(" + op1f.dsl + " " + operacion + " " + op2f.dsl + " " + comparacion + " " + op3f.dsl + " " + operacion2 + " " + op4f.dsl + ",                 '" + tval + "', '" + fval + "')\"             data-cap=\"" + codCapsula1 + "\"             data-per=\"" + codPeriodo1 + "\"             data-ope=\"" + operacion + "\"             data-cap2=\"" + codCapsula2 + "\"             data-per2=\"" + codPeriodo2 + "\"             data-comp=\"" + comparacion + "\"                         data-cap3=\"" + codCapsula3 + "\"             data-per3=\"" + codPeriodo3 + "\"             data-ope2=\"" + operacion2 + "\"             data-cap4=\"" + codCapsula4 + "\"             data-per4=\"" + codPeriodo4 + "\"                         data-constante1=\"" + constante1 + "\"             data-constante2=\"" + constante2 + "\"             data-constante3=\"" + constante3 + "\"             data-constante4=\"" + constante4 + "\"                         data-tipoOperando1=\"" + op1f.tipo + "\"            data-tipoOperando2=\"" + op2f.tipo + "\"            data-tipoOperando3=\"" + op3f.tipo + "\"            data-tipoOperando4=\"" + op4f.tipo + "\"                        data-tval=\"" + tval + "\"             data-fval=\"" + fval + "\"             href='" + link + "'>" + texto + "</a>")[0];
            widget.lastSelection.insertNode(linkNode);
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("#addlinkButton").click(dialogSubmitCb);
        dialog.find("#dellinkButton").click(dialogSubmitBorrar);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'Condici\u00F3n',
            icon: 'condicion-button',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var selectionParent, tipoOp1, tipoOp2, tipoOp3, tipoOp4;
            if (!cargadosCombos) {
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon1');
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon2');
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon3');
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon4');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon1');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon2');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon3');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon4');
              jQuery('#filterPerCon1').val('ACT');
              jQuery('#filterPerCon2').val('ACT');
              jQuery('#filterPerCon3').val('ACT');
              jQuery('#filterPerCon4').val('ACT');
              jQuery('.inputNumericDialogEditor').numeric();
              ocultarCampos('1');
              ocultarCampos('2');
              ocultarCampos('3');
              ocultarCampos('4');
              cargadosCombos = true;
            }
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            jQuery(".constantes").hide();
            jQuery("#dialogTextoId").html(jQuery('div.editable').html());
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery("input:radio[name=op1]")[0].checked = true;
              jQuery("input:radio[name=op2]")[0].checked = true;
              jQuery("input:radio[name=op3]")[0].checked = true;
              jQuery("input:radio[name=op4]")[0].checked = true;
              jQuery("input:radio[name=op1]").trigger("change");
              jQuery("input:radio[name=op2]").trigger("change");
              jQuery("input:radio[name=op3]").trigger("change");
              jQuery("input:radio[name=op4]").trigger("change");
              jQuery(".caps").val("");
              jQuery("#filterOpe").val("");
              jQuery("#filterOpe2").val("");
              jQuery("#filterComp").val("");
              jQuery(".constantes").val("");
              jQuery("#tval").val("");
              jQuery("#fval").val("");
              existe = false;
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              jQuery("#filterCapCon1").val(jQuery(selectionParent).attr('data-cap'));
              jQuery("#filterPerCon1").val(jQuery(selectionParent).attr('data-per'));
              jQuery("#filterOpe").val(jQuery(selectionParent).attr('data-ope'));
              jQuery("#filterCapCon2").val(jQuery(selectionParent).attr('data-cap2'));
              jQuery("#filterPerCon2").val(jQuery(selectionParent).attr('data-per2'));
              jQuery("#filterComp").val(jQuery(selectionParent).attr('data-comp'));
              jQuery("#filterCapCon3").val(jQuery(selectionParent).attr('data-cap3'));
              jQuery("#filterPerCon3").val(jQuery(selectionParent).attr('data-per3'));
              jQuery("#filterOpe2").val(jQuery(selectionParent).attr('data-ope2'));
              jQuery("#filterCapCon4").val(jQuery(selectionParent).attr('data-cap4'));
              jQuery("#filterPerCon4").val(jQuery(selectionParent).attr('data-per4'));
              jQuery("#constante1").val(jQuery(selectionParent).attr('data-constante1'));
              jQuery("#constante2").val(jQuery(selectionParent).attr('data-constante2'));
              jQuery("#constante3").val(jQuery(selectionParent).attr('data-constante3'));
              jQuery("#constante4").val(jQuery(selectionParent).attr('data-constante4'));
              jQuery("#tval").val(jQuery(selectionParent).attr('data-tval'));
              jQuery("#fval").val(jQuery(selectionParent).attr('data-fval'));
              tipoOp1 = jQuery(selectionParent).attr('data-tipoOperando1');
              tipoOp2 = jQuery(selectionParent).attr('data-tipoOperando2');
              tipoOp3 = jQuery(selectionParent).attr('data-tipoOperando3');
              tipoOp4 = jQuery(selectionParent).attr('data-tipoOperando4');
              cargarTipoOperando(tipoOp1, '1');
              cargarTipoOperando(tipoOp2, '2');
              cargarTipoOperando(tipoOp3, '3');
              cargarTipoOperando(tipoOp4, '4');
              texto = jQuery(selectionParent).text();
              existe = true;
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open').dialog({
              position: {
                my: "top",
                at: "top",
                of: window
              }
            });
            toolbar.hide();
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.condicionTexto", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 750,
          height: 'auto',
          title: "Ingresar Condici\u00F3n",
          buttonTitle: "Aceptar",
          buttonUpdateTitle: "Aceptar",
          modal: true,
          resizable: false,
          draggable: true,
          dialogClass: 'condicionT-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, cargadosCombos, cargarTipoOperando, dialog, dialogId, dialogSubmitBorrar, dialogSubmitCb, existe, generarOperando, ocultarCampos, texto, urlInput, widget,
          _this = this;
        widget = this;
        existe = false;
        texto = "";
        cargadosCombos = false;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\" style=\"cursor:default;\">        <form action=\"#\" method=\"post\" class=\"linkForm\">          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />          <TABLE>          	<TR >	    				<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid red;\">			          <legend>Operando 1</legend>			          <input type='radio' name='opt1' style='margin: 10px;' checked value='capsula'>C&aacute;psula</input>			          </br>			          <select id=\"filterCapConT1\" class=\"caps1 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>			          </select>			          			          <select id=\"filterPerConT1\" class=\"caps1 caps\" style=\"width:25%;\"  title=\"Periodos\">			          </select>			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constanteT1\" style=\"width:80%;\" value=\"\" />			          </fieldset>          		</TD>          		<TD style=\"padding: 2px;width:10%;\">			          <fieldset style=\"border:2px solid black;\">						    <legend>Comparaci\u00F3n</legend>			          <select id=\"filterCompCT\" class=\"filterChooser\" style=\"font-size: 14px;font-weight: bold;\" title=\"Comparaci\u00F3n\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Comparaci\u00F3n\ --</option>			              <option value=\"=\" data-filter-type=\"\" >==</option>			              <option value=\"<>\" data-filter-type=\"\" ><></option>			          </select>			          </fieldset>			        </TD>          		<TD style=\"padding: 2px;width:45%;\">			          <fieldset style=\"border:2px solid blue;\">			          <legend>Operando 2</legend>			          <input type='radio' name='opt2' style='margin: 10px;' value='capsula'>C&aacute;psula</input>  							<input type='radio' name='opt2' style='margin: 10px;' value='constante'>Constante</input>			          </br>			          <select id=\"filterCapConT2\" class=\"caps2 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>			          </select>			          			          <select id=\"filterPerConT2\" class=\"caps2 caps\" style=\"width:25%;\"  title=\"Periodos\">			          </select>			          <input class=\"constantes\" type=\"text\" id=\"constanteT2\" style=\"margin:0px;width:80%;\" value=\"\" />			          </fieldset>			        </TD>            </TR>          </TABLE>                    <fieldset style=\"border:2px solid black;\">			          <legend>Resultado</legend>          <TABLE>          	<TR>	    				<TD style=\"padding: 2px;\">Verdadero:</TD>	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"tvalCT\" style=\"width:25%;\" value=\"\" /></TD>          	</TR>          	<TR>	    				<TD style=\"padding: 2px;\">Falso:</TD>	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"fvalCT\" style=\"width:25%;\" value=\"\" /></TD>          	</TR>          </TABLE>          </fieldset>                    <input type=\"submit\" style=\"margin:6px;\" id=\"dellinkButton\" value=\"Borrar\"/>          <input type=\"submit\" style=\"margin:6px;\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form></div>");
        urlInput = jQuery('input[name=url]', dialog);
        cargarTipoOperando = function(tipoOp, nombreSufijo) {
          if (tipoOp === 'capsula') {
            jQuery("input:radio[name=opt" + nombreSufijo + "]")[0].checked = true;
            jQuery("#constanteT" + nombreSufijo).hide();
            return jQuery(".caps" + nombreSufijo).show();
          } else {
            jQuery("input:radio[name=opt" + nombreSufijo + "]")[1].checked = true;
            jQuery("#constanteT" + nombreSufijo).show();
            return jQuery(".caps" + nombreSufijo).hide();
          }
        };
        ocultarCampos = function(nombreSufijo) {
          return jQuery("input:radio[name=opt" + nombreSufijo + "]").on("change", (function(event) {
            if (jQuery("input:radio[name=opt" + nombreSufijo + "]")[0].checked) {
              jQuery("#constanteT" + nombreSufijo).hide();
              return jQuery(".caps" + nombreSufijo).show();
            } else {
              jQuery("#constanteT" + nombreSufijo).show();
              return jQuery(".caps" + nombreSufijo).hide();
            }
          }));
        };
        generarOperando = function(nombreSufijo) {
          var codCap, codPer, funcion, valorConstante;
          if (jQuery("input:radio[name=opt" + nombreSufijo + "]")[0].checked) {
            codCap = (jQuery("#filterCapConT" + nombreSufijo + " option:selected")).val();
            codPer = (jQuery("#filterPerConT" + nombreSufijo + " option:selected")).val();
            if (codCap === "" || codPer === "") {
              funcion = "";
              texto = "";
            } else {
              funcion = "capf('" + codCap + "','" + codPer + "')";
              texto = "[C\u00E1psula " + codCap + " del Periodo " + codPer + "]";
            }
            return {
              'dsl': funcion,
              'txt': texto,
              'tipo': 'capsula'
            };
          } else {
            valorConstante = (jQuery("#constanteT" + nombreSufijo)).val();
            return {
              'dsl': "'" + valorConstante + "'",
              'txt': (jQuery("#constanteT" + nombreSufijo)).val(),
              'tipo': 'constante'
            };
          }
        };
        dialogSubmitBorrar = function(event) {
          event.preventDefault();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          document.execCommand("unlink", null, "");
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialogSubmitCb = function(event) {
          var codCapsula1, codCapsula2, codPeriodo1, codPeriodo2, comparacion, constante1, constante2, fval, link, linkNode, nodoLink, op1f, op2f, tval;
          event.preventDefault();
          link = "javascript:void(0)";
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          codCapsula1 = (jQuery("#filterCapConT1 option:selected")).val();
          codPeriodo1 = (jQuery("#filterPerConT1 option:selected")).val();
          codCapsula2 = (jQuery("#filterCapConT2 option:selected")).val();
          codPeriodo2 = (jQuery("#filterPerConT2 option:selected")).val();
          comparacion = (jQuery("#filterCompCT option:selected")).val();
          constante1 = (jQuery("#constanteT1")).val();
          constante2 = (jQuery("#constanteT2")).val();
          tval = (jQuery("#tvalCT")).val();
          fval = (jQuery("#fvalCT")).val();
          op1f = generarOperando('1');
          op2f = generarOperando('2');
          if (existe) {
            nodoLink = widget.lastSelection.startContainer.parentNode;
            jQuery(nodoLink).attr('data-cap', codCapsula1);
            jQuery(nodoLink).attr('data-per', codPeriodo1);
            jQuery(nodoLink).attr('data-cap2', codCapsula2);
            jQuery(nodoLink).attr('data-per2', codPeriodo2);
            jQuery(nodoLink).attr('data-comp', comparacion);
            jQuery(nodoLink).attr('data-constante1', constante1);
            jQuery(nodoLink).attr('data-constante2', constante2);
            jQuery(nodoLink).attr('data-tipoOperando1', op1f.tipo);
            jQuery(nodoLink).attr('data-tipoOperando2', op2f.tipo);
            jQuery(nodoLink).attr('data-tval', tval);
            jQuery(nodoLink).attr('data-fval', fval);
            jQuery(nodoLink).attr('class', "conTResaltadoEditor resaltadoEditor");
            jQuery(nodoLink).attr('title', "SI TEXTO " + op1f.txt + " " + comparacion + " " + op2f.txt + " ENTONCES " + tval + " SINO " + fval);
            jQuery(nodoLink).attr('data-dsl', "ift(" + op1f.dsl + " " + comparacion + " " + op2f.dsl + ", '" + tval + "', '" + fval + "')");
          } else {
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue;
            linkNode = jQuery("<a class=\"conTResaltadoEditor resaltadoEditor\"             title=\"SI TEXTO " + op1f.txt + " " + comparacion + " " + op2f.txt + " ENTONCES " + tval + " SINO " + fval + "\"             data-dsl=\"ift(" + op1f.dsl + " " + comparacion + " " + op2f.dsl + ", '" + tval + "', '" + fval + "')\"             data-cap=\"" + codCapsula1 + "\"             data-per=\"" + codPeriodo1 + "\"             data-cap2=\"" + codCapsula2 + "\"             data-per2=\"" + codPeriodo2 + "\"             data-comp=\"" + comparacion + "\"                         data-constante1=\"" + constante1 + "\"             data-constante2=\"" + constante2 + "\"                         data-tipoOperando1=\"" + op1f.tipo + "\"            data-tipoOperando2=\"" + op2f.tipo + "\"                        data-tval=\"" + tval + "\"             data-fval=\"" + fval + "\"             href='" + link + "'>" + texto + "</a>")[0];
            widget.lastSelection.insertNode(linkNode);
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("#addlinkButton").click(dialogSubmitCb);
        dialog.find("#dellinkButton").click(dialogSubmitBorrar);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'Condici\u00F3n Texto',
            icon: 'condicion-texto-button',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var selectionParent, tipoOp1, tipoOp2;
            if (!cargadosCombos) {
              jQuery('.capselTexto').find('option').clone().appendTo('#filterCapConT1');
              jQuery('.capselTexto').find('option').clone().appendTo('#filterCapConT2');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerConT1');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerConT2');
              jQuery('#filterPerConT1').val('ACT');
              jQuery('#filterPerConT2').val('ACT');
              ocultarCampos('2');
              cargadosCombos = true;
            }
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            jQuery(".constantes").hide();
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery("input:radio[name=opt2]")[0].checked = true;
              jQuery("input:radio[name=opt1]").trigger("change");
              jQuery("input:radio[name=opt2]").trigger("change");
              jQuery(".caps").val("");
              jQuery("#filterCompCT").val("");
              jQuery(".constantes").val("");
              jQuery("#tvalCT").val("");
              jQuery("#fvalCT").val("");
              existe = false;
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              jQuery("#filterCapConT1").val(jQuery(selectionParent).attr('data-cap'));
              jQuery("#filterPerConT1").val(jQuery(selectionParent).attr('data-per'));
              jQuery("#filterCapConT2").val(jQuery(selectionParent).attr('data-cap2'));
              jQuery("#filterPerConT2").val(jQuery(selectionParent).attr('data-per2'));
              jQuery("#filterCompCT").val(jQuery(selectionParent).attr('data-comp'));
              jQuery("#constanteT1").val(jQuery(selectionParent).attr('data-constante1'));
              jQuery("#constanteT2").val(jQuery(selectionParent).attr('data-constante2'));
              jQuery("#tvalCT").val(jQuery(selectionParent).attr('data-tval'));
              jQuery("#fvalCT").val(jQuery(selectionParent).attr('data-fval'));
              tipoOp1 = jQuery(selectionParent).attr('data-tipoOperando1');
              tipoOp2 = jQuery(selectionParent).attr('data-tipoOperando2');
              cargarTipoOperando(tipoOp2, '2');
              texto = jQuery(selectionParent).text();
              existe = true;
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open').dialog({
              position: {
                my: "top",
                at: "top",
                of: window
              }
            });
            toolbar.hide();
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.diagnostico", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 540,
          height: 200,
          title: "Ingresar Diagn\u00F3stico",
          buttonTitle: "Aceptar",
          buttonUpdateTitle: "Aceptar",
          modal: true,
          resizable: false,
          draggable: true,
          dialogClass: 'diagnostico-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, cargadosCombos, dialog, dialogId, dialogSubmitBorrar, dialogSubmitCb, existe, isEmptyLink, texto, urlInput, widget,
          _this = this;
        widget = this;
        existe = false;
        texto = "";
        cargadosCombos = false;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\" style=\"cursor:default;\">        <form action=\"#\" method=\"post\" class=\"linkForm\">          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />                      <select id=\"filterDia\" class=\"filterChooser\" style=\"width:45%;\" title=\"Diagn\u00F3sticos\">              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione un Diagn\u00F3stico --</option>          </select>                    <select id=\"filterPerDia\" class=\"filterChooser\" style=\"width:20%;\" title=\"Periodos\">          </select><br />          <input type=\"submit\" id=\"dellinkButton\" value=\"Borrar\"/>          <input type=\"submit\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form></div>");
        urlInput = jQuery('input[name=url]', dialog);
        isEmptyLink = function(link) {
          if ((new RegExp(/^\s*$/)).test(link)) {
            return true;
          }
          if (link === widget.options.defaultUrl) {
            return true;
          }
          return false;
        };
        dialogSubmitBorrar = function(event) {
          event.preventDefault();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          document.execCommand("unlink", null, "");
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialogSubmitCb = function(event) {
          var codCapsula, codPeriodo, link, linkNode, nodoLink, resaltado;
          event.preventDefault();
          link = "javascript:void(0)";
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          codCapsula = (jQuery("#filterDia option:selected")).val();
          codPeriodo = (jQuery("#filterPerDia option:selected")).val();
          if (codCapsula === "") {
            resaltado = "diaOscuroResaltadoEditor";
          } else {
            resaltado = "diaResaltadoEditor";
          }
          if (existe) {
            nodoLink = widget.lastSelection.startContainer.parentNode;
            jQuery(nodoLink).attr('data-cap', codCapsula);
            jQuery(nodoLink).attr('data-per', codPeriodo);
            jQuery(nodoLink).attr('class', resaltado + " resaltadoEditor");
            jQuery(nodoLink).attr('title', "Diagn\u00F3stico " + codCapsula + " ## Periodo " + codPeriodo);
            jQuery(nodoLink).attr('data-dsl', "dia(\'" + codCapsula + "\',\'" + codPeriodo + "\')");
          } else {
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue;
            linkNode = jQuery("<a class=\"" + resaltado + (" resaltadoEditor\"             title=\"Diagn\u00F3stico " + codCapsula + " ## Periodo " + codPeriodo + "\"             data-dsl=\"dia('" + codCapsula + "','" + codPeriodo + "')\"             data-cap=\"" + codCapsula + "\"             data-per=\"" + codPeriodo + "\"             href='" + link + "'>" + texto + "</a>"))[0];
            widget.lastSelection.insertNode(linkNode);
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("#addlinkButton").click(dialogSubmitCb);
        dialog.find("#dellinkButton").click(dialogSubmitBorrar);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'Diagn\u00F3stico',
            icon: 'diagnostico-button',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var selectionParent;
            if (!cargadosCombos) {
              jQuery('.diasel').find('option').clone().appendTo('#filterDia');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerDia');
              jQuery('#filterPerDia').val('ACT');
              cargadosCombos = true;
            }
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery("#filterDia").val("");
              jQuery("#filterPerDia").val("");
              existe = false;
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              jQuery("#filterDia").val(jQuery(selectionParent).attr('data-cap'));
              jQuery("#filterPerDia").val(jQuery(selectionParent).attr('data-per'));
              texto = jQuery(selectionParent).text();
              existe = true;
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open').dialog({
              position: {
                my: "top",
                at: "top",
                of: window
              }
            });
            toolbar.hide();
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloformat", {
      options: {
        editable: null,
        uuid: '',
        formattings: {
          bold: true,
          italic: true,
          strikeThrough: false,
          underline: false
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var buttonize, buttonset, enabled, format, widget, _ref,
          _this = this;
        widget = this;
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(format) {
          var buttonHolder;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: format,
            editable: _this.options.editable,
            command: format,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          return buttonset.append(buttonHolder);
        };
        _ref = this.options.formattings;
        for (format in _ref) {
          enabled = _ref[format];
          if (!enabled) {
            continue;
          }
          buttonize(format);
        }
        buttonset.hallobuttonset();
        return toolbar.append(buttonset);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloheadings", {
      options: {
        editable: null,
        uuid: '',
        formatBlocks: ["p", "h1", "h2", "h3"],
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var buttonize, buttonset, command, format, ie, widget, _i, _len, _ref,
          _this = this;
        widget = this;
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        ie = navigator.appName === 'Microsoft Internet Explorer';
        command = (ie ? "FormatBlock" : "formatBlock");
        buttonize = function(format) {
          var buttonHolder;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: format,
            editable: _this.options.editable,
            command: command,
            commandValue: (ie ? "<" + format + ">" : format),
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass,
            queryState: function(event) {
              var compared, e, map, result, val, value, _i, _len, _ref;
              try {
                value = document.queryCommandValue(command);
                if (ie) {
                  map = {
                    p: "normal"
                  };
                  _ref = [1, 2, 3, 4, 5, 6];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    val = _ref[_i];
                    map["h" + val] = val;
                  }
                  compared = value.match(new RegExp(map[format], "i"));
                } else {
                  compared = value.match(new RegExp(format, "i"));
                }
                result = compared ? true : false;
                return buttonHolder.hallobutton('checked', result);
              } catch (_error) {
                e = _error;
              }
            }
          });
          buttonHolder.find('button .ui-button-text').text(format.toUpperCase());
          return buttonset.append(buttonHolder);
        };
        _ref = this.options.formatBlocks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          format = _ref[_i];
          buttonize(format);
        }
        buttonset.hallobuttonset();
        return toolbar.append(buttonset);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallohtml", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        lang: 'en',
        dialogOpts: {
          autoOpen: false,
          width: 600,
          height: 'auto',
          modal: false,
          resizable: true,
          draggable: true,
          dialogClass: 'htmledit-dialog'
        },
        dialog: null,
        buttonCssClass: null
      },
      translations: {
        en: {
          title: 'Edit HTML',
          update: 'Update'
        },
        de: {
          title: 'HTML bearbeiten',
          update: 'Aktualisieren'
        }
      },
      texts: null,
      populateToolbar: function($toolbar) {
        var $buttonHolder, $buttonset, id, selector, widget;
        widget = this;
        this.texts = this.translations[this.options.lang];
        this.options.toolbar = $toolbar;
        selector = "" + this.options.uuid + "-htmledit-dialog";
        this.options.dialog = jQuery("<div>").attr('id', selector);
        $buttonset = jQuery("<span>").addClass(widget.widgetName);
        id = "" + this.options.uuid + "-htmledit";
        $buttonHolder = jQuery('<span>');
        $buttonHolder.hallobutton({
          label: this.texts.title,
          icon: 'icon-list-alt',
          editable: this.options.editable,
          command: null,
          queryState: false,
          uuid: this.options.uuid,
          cssClass: this.options.buttonCssClass
        });
        $buttonset.append($buttonHolder);
        this.button = $buttonHolder;
        this.button.click(function() {
          if (widget.options.dialog.dialog("isOpen")) {
            widget._closeDialog();
          } else {
            widget._openDialog();
          }
          return false;
        });
        this.options.editable.element.on("hallodeactivated", function() {
          return widget._closeDialog();
        });
        $toolbar.append($buttonset);
        this.options.dialog.dialog(this.options.dialogOpts);
        return this.options.dialog.dialog("option", "title", this.texts.title);
      },
      _openDialog: function() {
        var $editableEl, html, widget, xposition, yposition,
          _this = this;
        widget = this;
        $editableEl = jQuery(this.options.editable.element);
        xposition = $editableEl.offset().left + $editableEl.outerWidth() + 10;
        yposition = this.options.toolbar.offset().top - jQuery(document).scrollTop();
        this.options.dialog.dialog("option", "position", [xposition, yposition]);
        this.options.editable.keepActivated(true);
        this.options.dialog.dialog("open");
        this.options.dialog.on('dialogclose', function() {
          jQuery('label', _this.button).removeClass('ui-state-active');
          _this.options.editable.element.focus();
          return _this.options.editable.keepActivated(false);
        });
        this.options.dialog.html(jQuery("<textarea>").addClass('html_source'));
        html = this.options.editable.element.html();
        this.options.dialog.children('.html_source').val(html);
        this.options.dialog.prepend(jQuery("<button>" + this.texts.update + "</button>"));
        return this.options.dialog.on('click', 'button', function() {
          html = widget.options.dialog.children('.html_source').val();
          widget.options.editable.element.html(html);
          widget.options.editable.element.trigger('change');
          return false;
        });
      },
      _closeDialog: function() {
        return this.options.dialog.dialog("close");
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloimage", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        limit: 8,
        search: null,
        searchUrl: null,
        suggestions: null,
        loaded: null,
        upload: null,
        uploadUrl: null,
        dialogOpts: {
          autoOpen: false,
          width: 270,
          height: "auto",
          title: "Insert Images",
          modal: false,
          resizable: false,
          draggable: true,
          dialogClass: 'halloimage-dialog'
        },
        dialog: null,
        buttonCssClass: null,
        entity: null,
        vie: null,
        dbPediaUrl: "http://dev.iks-project.eu/stanbolfull",
        maxWidth: 250,
        maxHeight: 250
      },
      populateToolbar: function(toolbar) {
        var buttonHolder, buttonset, dialogId, id, tabContent, tabs, widget;
        this.options.toolbar = toolbar;
        widget = this;
        dialogId = "" + this.options.uuid + "-image-dialog";
        this.options.dialog = jQuery("<div id=\"" + dialogId + "\">        <div class=\"nav\">          <ul class=\"tabs\">          </ul>          <div id=\"" + this.options.uuid + "-tab-activeIndicator\"            class=\"tab-activeIndicator\" />        </div>        <div class=\"dialogcontent\">        </div>");
        tabs = jQuery('.tabs', this.options.dialog);
        tabContent = jQuery('.dialogcontent', this.options.dialog);
        if (widget.options.suggestions) {
          this._addGuiTabSuggestions(tabs, tabContent);
        }
        if (widget.options.search || widget.options.searchUrl) {
          this._addGuiTabSearch(tabs, tabContent);
        }
        if (widget.options.upload || widget.options.uploadUrl) {
          this._addGuiTabUpload(tabs, tabContent);
        }
        this.current = jQuery('<div class="currentImage"></div>').halloimagecurrent({
          uuid: this.options.uuid,
          imageWidget: this,
          editable: this.options.editable,
          dialog: this.options.dialog,
          maxWidth: this.options.maxWidth,
          maxHeight: this.options.maxHeight
        });
        jQuery('.dialogcontent', this.options.dialog).append(this.current);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        id = "" + this.options.uuid + "-image";
        buttonHolder = jQuery('<span></span>');
        buttonHolder.hallobutton({
          label: 'Images',
          icon: 'icon-picture',
          editable: this.options.editable,
          command: null,
          queryState: false,
          uuid: this.options.uuid,
          cssClass: this.options.buttonCssClass
        });
        buttonset.append(buttonHolder);
        this.button = buttonHolder;
        this.button.on("click", function(event) {
          if (widget.options.dialog.dialog("isOpen")) {
            widget._closeDialog();
          } else {
            widget._openDialog();
          }
          return false;
        });
        this.options.editable.element.on("hallodeactivated", function(event) {
          return widget._closeDialog();
        });
        jQuery(this.options.editable.element).delegate("img", "click", function(event) {
          return widget._openDialog();
        });
        toolbar.append(buttonset);
        this.options.dialog.dialog(this.options.dialogOpts);
        return this._handleTabs();
      },
      setCurrent: function(image) {
        return this.current.halloimagecurrent('setImage', image);
      },
      _handleTabs: function() {
        var widget;
        widget = this;
        jQuery('.nav li', this.options.dialog).on('click', function() {
          var id, left;
          jQuery("." + widget.widgetName + "-tab").hide();
          id = jQuery(this).attr('id');
          jQuery("#" + id + "-content").show();
          left = jQuery(this).position().left + (jQuery(this).width() / 2);
          return jQuery("#" + widget.options.uuid + "-tab-activeIndicator").css({
            "margin-left": left
          });
        });
        return jQuery('.nav li', this.options.dialog).first().click();
      },
      _openDialog: function() {
        var cleanUp, editableEl, getActive, suggestionSelector, toolbarEl, widget, xposition, yposition,
          _this = this;
        widget = this;
        cleanUp = function() {
          return window.setTimeout(function() {
            var thumbnails;
            thumbnails = jQuery(".imageThumbnail");
            return jQuery(thumbnails).each(function() {
              var size;
              size = jQuery("#" + this.id).width();
              if (size <= 20) {
                return jQuery("#" + this.id).parent("li").remove();
              }
            });
          }, 15000);
        };
        suggestionSelector = "#" + this.options.uuid + "-tab-suggestions-content";
        getActive = function() {
          return jQuery('.imageThumbnailActive', suggestionSelector).first().attr("src");
        };
        jQuery("#" + this.options.uuid + "-sugg-activeImage").attr("src", getActive());
        jQuery("#" + this.options.uuid + "-sugg-activeImageBg").attr("src", getActive());
        this.lastSelection = this.options.editable.getSelection();
        editableEl = jQuery(this.options.editable.element);
        toolbarEl = jQuery(this.options.toolbar);
        xposition = editableEl.offset().left + editableEl.outerWidth() - 3;
        yposition = toolbarEl.offset().top + toolbarEl.outerHeight() + 29;
        yposition -= jQuery(document).scrollTop();
        this.options.dialog.dialog("option", "position", [xposition, yposition]);
        cleanUp();
        widget.options.loaded = 1;
        this.options.editable.keepActivated(true);
        this.options.dialog.dialog("open");
        return this.options.dialog.on('dialogclose', function() {
          jQuery('label', _this.button).removeClass('ui-state-active');
          _this.options.editable.element.focus();
          return _this.options.editable.keepActivated(false);
        });
      },
      _closeDialog: function() {
        return this.options.dialog.dialog("close");
      },
      _addGuiTabSuggestions: function(tabs, element) {
        var tab;
        tabs.append(jQuery("<li id=\"" + this.options.uuid + "-tab-suggestions\"        class=\"" + this.widgetName + "-tabselector " + this.widgetName + "-tab-suggestions\">          <span>Suggestions</span>        </li>"));
        tab = jQuery("<div id=\"" + this.options.uuid + "-tab-suggestions-content\"        class=\"" + this.widgetName + "-tab tab-suggestions\"></div>");
        element.append(tab);
        return tab.halloimagesuggestions({
          uuid: this.options.uuid,
          imageWidget: this,
          entity: this.options.entity
        });
      },
      _addGuiTabSearch: function(tabs, element) {
        var dialogId, tab, widget;
        widget = this;
        dialogId = "" + this.options.uuid + "-image-dialog";
        tabs.append(jQuery("<li id=\"" + this.options.uuid + "-tab-search\"        class=\"" + this.widgetName + "-tabselector " + this.widgetName + "-tab-search\">          <span>Search</span>        </li>"));
        tab = jQuery("<div id=\"" + this.options.uuid + "-tab-search-content\"        class=\"" + widget.widgetName + "-tab tab-search\"></div>");
        element.append(tab);
        return tab.halloimagesearch({
          uuid: this.options.uuid,
          imageWidget: this,
          searchCallback: this.options.search,
          searchUrl: this.options.searchUrl,
          limit: this.options.limit,
          entity: this.options.entity
        });
      },
      _addGuiTabUpload: function(tabs, element) {
        var tab;
        tabs.append(jQuery("<li id=\"" + this.options.uuid + "-tab-upload\"        class=\"" + this.widgetName + "-tabselector " + this.widgetName + "-tab-upload\">          <span>Upload</span>        </li>"));
        tab = jQuery("<div id=\"" + this.options.uuid + "-tab-upload-content\"        class=\"" + this.widgetName + "-tab tab-upload\"></div>");
        element.append(tab);
        return tab.halloimageupload({
          uuid: this.options.uuid,
          uploadCallback: this.options.upload,
          uploadUrl: this.options.uploadUrl,
          imageWidget: this,
          entity: this.options.entity
        });
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallo-image-insert-edit", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        insert_file_dialog_ui_url: null,
        lang: 'en',
        dialogOpts: {
          autoOpen: false,
          width: 560,
          height: 'auto',
          modal: false,
          resizable: true,
          draggable: true,
          dialogClass: 'insert-image-dialog'
        },
        dialog: null,
        buttonCssClass: null
      },
      translations: {
        en: {
          title_insert: 'Insert Image',
          title_properties: 'Image Properties',
          insert: 'Insert',
          chage_image: 'Change Image:',
          source: 'URL',
          width: 'Width',
          height: 'Height',
          alt: 'Alt Text',
          padding: 'Padding',
          'float': 'Float',
          float_left: 'left',
          float_right: 'right',
          float_none: 'No'
        },
        de: {
          title_insert: 'Bild einfügen',
          title_properties: 'Bildeigenschaften',
          insert: 'Einfügen',
          chage_image: 'Bild ändern:',
          source: 'URL',
          width: 'Breite',
          height: 'Höhe',
          alt: 'Alt Text',
          padding: 'Padding',
          'float': 'Float',
          float_left: 'Links',
          float_right: 'Rechts',
          float_none: 'Nein'
        }
      },
      texts: null,
      dialog_image_selection_ui_loaded: false,
      $image: null,
      populateToolbar: function($toolbar) {
        var $buttonHolder, $buttonset, dialog_html, widget;
        widget = this;
        this.texts = this.translations[this.options.lang];
        this.options.toolbar = $toolbar;
        dialog_html = "<div id='hallo_img_properties'></div>";
        if (this.options.insert_file_dialog_ui_url) {
          dialog_html += "<div id='hallo_img_file_select_ui'></div>";
        }
        this.options.dialog = jQuery("<div>").attr('id', "" + this.options.uuid + "-insert-image-dialog").html(dialog_html);
        $buttonset = jQuery("<span>").addClass(this.widgetName);
        $buttonHolder = jQuery('<span>');
        $buttonHolder.hallobutton({
          label: this.texts.title_insert,
          icon: 'icon-picture',
          editable: this.options.editable,
          command: null,
          queryState: false,
          uuid: this.options.uuid,
          cssClass: this.options.buttonCssClass
        });
        $buttonset.append($buttonHolder);
        this.button = $buttonHolder;
        this.button.click(function() {
          if (widget.options.dialog.dialog("isOpen")) {
            widget._closeDialog();
          } else {
            widget.lastSelection = widget.options.editable.getSelection();
            widget._openDialog();
          }
          return false;
        });
        this.options.editable.element.on("halloselected, hallounselected", function() {
          if (widget.options.dialog.dialog("isOpen")) {
            return widget.lastSelection = widget.options.editable.getSelection();
          }
        });
        this.options.editable.element.on("hallodeactivated", function() {
          return widget._closeDialog();
        });
        jQuery(this.options.editable.element).on("click", "img", function(e) {
          widget._openDialog(jQuery(this));
          return false;
        });
        this.options.editable.element.on('halloselected', function(event, data) {
          var toolbar_option;
          toolbar_option = widget.options.editable.options.toolbar;
          if (toolbar_option === "halloToolbarContextual" && jQuery(data.originalEvent.target).is('img')) {
            $toolbar.hide();
            return false;
          }
        });
        $toolbar.append($buttonset);
        return this.options.dialog.dialog(this.options.dialogOpts);
      },
      _openDialog: function($image) {
        var $editableEl, widget, xposition, yposition,
          _this = this;
        this.$image = $image;
        widget = this;
        $editableEl = jQuery(this.options.editable.element);
        xposition = $editableEl.offset().left + $editableEl.outerWidth() + 10;
        if (this.$image) {
          yposition = this.$image.offset().top - jQuery(document).scrollTop();
        } else {
          yposition = this.options.toolbar.offset().top - jQuery(document).scrollTop();
        }
        this.options.dialog.dialog("option", "position", [xposition, yposition]);
        this.options.editable.keepActivated(true);
        this.options.dialog.dialog("open");
        if (this.$image) {
          this.options.dialog.dialog("option", "title", this.texts.title_properties);
          jQuery(document).keyup(function(e) {
            if (e.keyCode === 46 || e.keyCode === 8) {
              jQuery(document).off();
              widget._closeDialog();
              widget.$image.remove();
              widget.$image = null;
            }
            return e.preventDefault();
          });
          this.options.editable.element.on("click", function() {
            widget.$image = null;
            return widget._closeDialog();
          });
        } else {
          this.options.dialog.children('#hallo_img_properties').hide();
          this.options.dialog.dialog("option", "title", this.texts.title_insert);
          if (jQuery('#hallo_img_file_select_title').length > 0) {
            jQuery('#hallo_img_file_select_title').text('');
          }
        }
        this._load_dialog_image_properties_ui();
        this.options.dialog.on('dialogclose', function() {
          var scrollbar_pos;
          jQuery('label', _this.button).removeClass('ui-state-active');
          scrollbar_pos = jQuery(document).scrollTop();
          _this.options.editable.element.focus();
          jQuery(document).scrollTop(scrollbar_pos);
          return _this.options.editable.keepActivated(false);
        });
        if (this.options.insert_file_dialog_ui_url && !this.dialog_image_selection_ui_loaded) {
          this.options.dialog.on('click', ".reload_link", function() {
            widget._load_dialog_image_selection_ui();
            return false;
          });
          this.options.dialog.on('click', '.file_preview img', function() {
            var new_source;
            if (widget.$image) {
              new_source = jQuery(this).attr('src').replace(/-thumb/, '');
              widget.$image.attr('src', new_source);
              jQuery('#hallo_img_source').val(new_source);
            } else {
              widget._insert_image(jQuery(this).attr('src').replace(/-thumb/, ''));
            }
            return false;
          });
          return this._load_dialog_image_selection_ui();
        }
      },
      _insert_image: function(source) {
        this.options.editable.restoreSelection(this.lastSelection);
        document.execCommand("insertImage", null, source);
        this.options.editable.element.trigger('change');
        this.options.editable.removeAllSelections();
        return this._closeDialog();
      },
      _closeDialog: function() {
        return this.options.dialog.dialog("close");
      },
      _load_dialog_image_selection_ui: function() {
        var widget;
        widget = this;
        return jQuery.ajax({
          url: this.options.insert_file_dialog_ui_url,
          success: function(data, textStatus, jqXHR) {
            var $properties, file_select_title, t;
            file_select_title = '';
            $properties = widget.options.dialog.children('#hallo_img_properties');
            if ($properties.is(':visible')) {
              file_select_title = widget.texts.change_image;
            }
            t = "<div id='hallo_img_file_select_title'>" + file_select_title + "</div>";
            widget.options.dialog.children('#hallo_img_file_select_ui').html(t + data);
            return widget.dialog_image_selection_ui_loaded = true;
          },
          beforeSend: function() {
            return widget.options.dialog.children('#hallo_img_file_select_ui').html('<div class="hallo_insert_file_loader"></div>');
          }
        });
      },
      _load_dialog_image_properties_ui: function() {
        var $img_properties, button, height, html, widget, width;
        widget = this;
        $img_properties = this.options.dialog.children('#hallo_img_properties');
        if (this.$image) {
          width = this.$image.is('[width]') ? this.$image.attr('width') : '';
          height = this.$image.is('[height]') ? this.$image.attr('height') : '';
          html = this._property_input_html('source', this.$image.attr('src'), {
            label: this.texts.source
          }) + this._property_input_html('alt', this.$image.attr('alt') || '', {
            label: this.texts.alt
          }) + this._property_row_html(this._property_input_html('width', width, {
            label: this.texts.width,
            row: false
          }) + this._property_input_html('height', height, {
            label: this.texts.height,
            row: false
          })) + this._property_input_html('padding', this.$image.css('padding'), {
            label: this.texts.padding
          }) + this._property_row_html(this._property_cb_html('float_left', this.$image.css('float') === 'left', {
            label: this.texts.float_left,
            row: false
          }) + this._property_cb_html('float_right', this.$image.css('float') === 'right', {
            label: this.texts.float_right,
            row: false
          }) + this._property_cb_html('unfloat', this.$image.css('float') === 'none', {
            label: this.texts.float_none,
            row: false
          }), this.texts[float]);
          $img_properties.html(html);
          $img_properties.show();
        } else {
          if (!this.options.insert_file_dialog_ui_url) {
            $img_properties.html(this._property_input_html('source', '', {
              label: this.texts.source
            }));
            $img_properties.show();
          }
        }
        if (this.$image) {
          if (!this.options.insert_file_dialog_ui_url) {
            jQuery('#insert_image_btn').remove();
          }
          if (jQuery('#hallo_img_file_select_title').length > 0) {
            jQuery('#hallo_img_file_select_title').text(this.texts.chage_image);
          }
          jQuery('#hallo_img_properties #hallo_img_source').keyup(function() {
            return widget.$image.attr('src', this.value);
          });
          jQuery('#hallo_img_properties #hallo_img_alt').keyup(function() {
            return widget.$image.attr('alt', this.value);
          });
          jQuery('#hallo_img_properties #hallo_img_padding').keyup(function() {
            return widget.$image.css('padding', this.value);
          });
          jQuery('#hallo_img_properties #hallo_img_height').keyup(function() {
            widget.$image.css('height', this.value);
            return widget.$image.attr('height', this.value);
          });
          jQuery('#hallo_img_properties #hallo_img_width').keyup(function() {
            widget.$image.css('width', this.value);
            return widget.$image.attr('width', this.value);
          });
          jQuery('#hallo_img_properties #hallo_img_float_left').click(function() {
            if (!this.checked) {
              return false;
            }
            widget.$image.css('float', 'left');
            jQuery('#hallo_img_properties #hallo_img_float_right').removeAttr('checked');
            return jQuery('#hallo_img_properties #hallo_img_unfloat').removeAttr('checked');
          });
          jQuery('#hallo_img_properties #hallo_img_float_right').click(function() {
            if (!this.checked) {
              return false;
            }
            widget.$image.css('float', 'right');
            jQuery('#hallo_img_properties #hallo_img_unfloat').removeAttr('checked');
            return jQuery('#hallo_img_properties #hallo_img_float_left').removeAttr('checked');
          });
          return jQuery('#hallo_img_properties #hallo_img_unfloat').click(function() {
            if (!this.checked) {
              return false;
            }
            widget.$image.css('float', 'none');
            jQuery('#hallo_img_properties #hallo_img_float_right').removeAttr('checked');
            return jQuery('#hallo_img_properties #hallo_img_float_left').removeAttr('checked');
          });
        } else {
          if (!this.options.insert_file_dialog_ui_url) {
            button = "<button id=\"insert_image_btn\">" + this.texts.insert + "</button>";
            $img_properties.after(button);
            return jQuery('#insert_image_btn').click(function() {
              var $img_source;
              $img_source = jQuery('#hallo_img_properties #hallo_img_source');
              return widget._insert_image($img_source.val());
            });
          }
        }
      },
      _property_col_html: function(col_html) {
        return "<div class='hallo_img_property_col'>" + col_html + "</div>";
      },
      _property_row_html: function(row_html, label) {
        if (label == null) {
          label = '';
        }
        row_html = this._property_col_html(label) + this._property_col_html(row_html);
        return "<div class='hallo_img_property_row'>" + row_html + "</div>";
      },
      _property_html: function(property_html, options) {
        var entry;
        if (options == null) {
          options = {};
        }
        if (options.row === false) {
          if (options.label) {
            entry = "" + options.label + " " + property_html;
            property_html = "<span class='img_property_entry'>" + entry + "</span>";
          }
          return property_html;
        } else {
          entry = "<span class='img_property_entry'>" + property_html + "</span>";
          return this._property_row_html(entry, options.label);
        }
      },
      _property_input_html: function(id, value, options) {
        var text_field;
        if (options == null) {
          options = {};
        }
        text_field = "<input type='text' id='hallo_img_" + id + "' value='" + value + "'>";
        return this._property_html(text_field, options);
      },
      _property_cb_html: function(id, checked, options) {
        var cb, checked_attr;
        if (options == null) {
          options = {};
        }
        checked_attr = checked ? 'checked=checked' : '';
        cb = "<input type='checkbox' id='hallo_img_" + id + "' " + checked_attr + "'>";
        return this._property_html(cb, options);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.halloindicator', {
      options: {
        editable: null,
        className: 'halloEditIndicator'
      },
      _create: function() {
        var _this = this;
        return this.element.on('halloenabled', function() {
          return _this.buildIndicator();
        });
      },
      populateToolbar: function() {},
      buildIndicator: function() {
        var editButton;
        editButton = jQuery('<div><i class="icon-edit"></i> Edit</div>');
        editButton.addClass(this.options.className);
        editButton.hide();
        this.element.before(editButton);
        this.bindIndicator(editButton);
        return this.setIndicatorPosition(editButton);
      },
      bindIndicator: function(indicator) {
        var _this = this;
        indicator.on('click', function() {
          return _this.options.editable.element.focus();
        });
        this.element.on('halloactivated', function() {
          return indicator.hide();
        });
        this.element.on('hallodisabled', function() {
          return indicator.remove();
        });
        return this.options.editable.element.hover(function() {
          if (jQuery(this).hasClass('inEditMode')) {
            return;
          }
          return indicator.show();
        }, function(data) {
          if (jQuery(this).hasClass('inEditMode')) {
            return;
          }
          if (data.relatedTarget === indicator.get(0)) {
            return;
          }
          return indicator.hide();
        });
      },
      setIndicatorPosition: function(indicator) {
        var offset;
        indicator.css('position', 'absolute');
        offset = this.element.position();
        indicator.css('top', offset.top + 2);
        return indicator.css('left', offset.left + 2);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallojustify", {
      options: {
        editable: null,
        toolbar: null,
        uuid: '',
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var buttonize, buttonset,
          _this = this;
        buttonset = jQuery("<span class=\"" + this.widgetName + "\"></span>");
        buttonize = function(alignment) {
          var buttonElement;
          buttonElement = jQuery('<span></span>');
          buttonElement.hallobutton({
            uuid: _this.options.uuid,
            editable: _this.options.editable,
            label: alignment,
            command: "justify" + alignment,
            icon: "icon-align-" + (alignment.toLowerCase()),
            cssClass: _this.options.buttonCssClass
          });
          return buttonset.append(buttonElement);
        };
        buttonize("Left");
        buttonize("Center");
        buttonize("Right");
        buttonset.hallobuttonset();
        return toolbar.append(buttonset);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallolink", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 540,
          height: 200,
          title: "Enter Link",
          buttonTitle: "Insert",
          buttonUpdateTitle: "Update",
          modal: true,
          resizable: false,
          draggable: false,
          dialogClass: 'hallolink-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, dialog, dialogId, dialogSubmitCb, isEmptyLink, urlInput, widget,
          _this = this;
        widget = this;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\">        <form action=\"#\" method=\"post\" class=\"linkForm\">          <input class=\"url\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />          <input type=\"submit\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form></div>");
        urlInput = jQuery('input[name=url]', dialog);
        isEmptyLink = function(link) {
          if ((new RegExp(/^\s*$/)).test(link)) {
            return true;
          }
          if (link === widget.options.defaultUrl) {
            return true;
          }
          return false;
        };
        dialogSubmitCb = function(event) {
          var link, linkNode;
          event.preventDefault();
          link = urlInput.val();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          if (isEmptyLink(link)) {
            document.execCommand("unlink", null, "");
          } else {
            if (!(/:\/\//.test(link)) && !(/^mailto:/.test(link))) {
              link = 'http://' + link;
            }
            if (widget.lastSelection.startContainer.parentNode.href === void 0) {
              if (widget.lastSelection.collapsed) {
                linkNode = jQuery("<a href='" + link + "'>" + link + "</a>")[0];
                widget.lastSelection.insertNode(linkNode);
              } else {
                document.execCommand("createLink", null, link);
              }
            } else {
              widget.lastSelection.startContainer.parentNode.href = link;
            }
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("input[type=submit]").click(dialogSubmitCb);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'Link',
            icon: 'icon-link',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var button_selector, selectionParent;
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery(urlInput[0].form).find('input[type=submit]').val(butTitle);
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              button_selector = 'input[type=submit]';
              jQuery(urlInput[0].form).find(button_selector).val(butUpdateTitle);
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open');
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.hallolists", {
      options: {
        editable: null,
        toolbar: null,
        uuid: '',
        lists: {
          ordered: true,
          unordered: true
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var buttonize, buttonset,
          _this = this;
        buttonset = jQuery("<span class=\"" + this.widgetName + "\"></span>");
        buttonize = function(type, label) {
          var buttonElement;
          buttonElement = jQuery('<span></span>');
          buttonElement.hallobutton({
            uuid: _this.options.uuid,
            editable: _this.options.editable,
            label: label,
            command: "insert" + type + "List",
            icon: "icon-list-" + (label.toLowerCase()),
            cssClass: _this.options.buttonCssClass
          });
          return buttonset.append(buttonElement);
        };
        if (this.options.lists.ordered) {
          buttonize("Ordered", "OL");
        }
        if (this.options.lists.unordered) {
          buttonize("Unordered", "UL");
        }
        buttonset.hallobuttonset();
        return toolbar.append(buttonset);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("Liip.hallooverlay", {
      options: {
        editable: null,
        toolbar: null,
        uuid: "",
        overlay: null,
        padding: 10,
        background: null
      },
      _create: function() {
        var widget;
        widget = this;
        if (!this.options.bound) {
          this.options.bound = true;
          this.options.editable.element.on("halloactivated", function(event, data) {
            widget.options.currentEditable = jQuery(event.target);
            if (!widget.options.visible) {
              return widget.showOverlay();
            }
          });
          this.options.editable.element.on("hallomodified", function(event, data) {
            widget.options.currentEditable = jQuery(event.target);
            if (widget.options.visible) {
              return widget.resizeOverlay();
            }
          });
          return this.options.editable.element.on("hallodeactivated", function(event, data) {
            widget.options.currentEditable = jQuery(event.target);
            if (widget.options.visible) {
              return widget.hideOverlay();
            }
          });
        }
      },
      showOverlay: function() {
        this.options.visible = true;
        if (this.options.overlay === null) {
          if (jQuery("#halloOverlay").length > 0) {
            this.options.overlay = jQuery("#halloOverlay");
          } else {
            this.options.overlay = jQuery("<div id=\"halloOverlay\"            class=\"halloOverlay\">");
            jQuery(document.body).append(this.options.overlay);
          }
          this.options.overlay.on('click', jQuery.proxy(this.options.editable.turnOff, this.options.editable));
        }
        this.options.overlay.show();
        if (this.options.background === null) {
          if (jQuery("#halloBackground").length > 0) {
            this.options.background = jQuery("#halloBackground");
          } else {
            this.options.background = jQuery("<div id=\"halloBackground\"            class=\"halloBackground\">");
            jQuery(document.body).append(this.options.background);
          }
        }
        this.resizeOverlay();
        this.options.background.show();
        if (!this.options.originalZIndex) {
          this.options.originalZIndex = this.options.currentEditable.css("z-index");
        }
        return this.options.currentEditable.css('z-index', '350');
      },
      resizeOverlay: function() {
        var offset;
        offset = this.options.currentEditable.offset();
        return this.options.background.css({
          top: offset.top - this.options.padding,
          left: offset.left - this.options.padding,
          width: this.options.currentEditable.width() + 2 * this.options.padding,
          height: this.options.currentEditable.height() + 2 * this.options.padding
        });
      },
      hideOverlay: function() {
        this.options.visible = false;
        this.options.overlay.hide();
        this.options.background.hide();
        return this.options.currentEditable.css('z-index', this.options.originalZIndex);
      },
      _findBackgroundColor: function(jQueryfield) {
        var color;
        color = jQueryfield.css("background-color");
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          return color;
        }
        if (jQueryfield.is("body")) {
          return "white";
        } else {
          return this._findBackgroundColor(jQueryfield.parent());
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.periodo", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 540,
          height: 200,
          title: "Ingresar Periodo",
          buttonTitle: "Aceptar",
          buttonUpdateTitle: "Aceptar",
          modal: true,
          resizable: false,
          draggable: true,
          dialogClass: 'periodo-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, cargadosCombos, dialog, dialogId, dialogSubmitBorrar, dialogSubmitCb, existe, isEmptyLink, texto, urlInput, widget,
          _this = this;
        widget = this;
        existe = false;
        texto = "";
        cargadosCombos = false;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\" style=\"cursor:default;\">        <form action=\"#\" method=\"post\" class=\"linkForm\">          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />                      <select id=\"filterPerPer\" class=\"filterChooser\" title=\"Periodos\">          </select><br />          <input type=\"submit\" id=\"dellinkButton\" value=\"Borrar\"/>          <input type=\"submit\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form></div>");
        urlInput = jQuery('input[name=url]', dialog);
        isEmptyLink = function(link) {
          if ((new RegExp(/^\s*$/)).test(link)) {
            return true;
          }
          if (link === widget.options.defaultUrl) {
            return true;
          }
          return false;
        };
        dialogSubmitBorrar = function(event) {
          event.preventDefault();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          document.execCommand("unlink", null, "");
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialogSubmitCb = function(event) {
          var codPeriodo, link, linkNode, nodoLink;
          event.preventDefault();
          link = "javascript:void(0)";
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          codPeriodo = (jQuery("#filterPerPer option:selected")).val();
          if (existe) {
            nodoLink = widget.lastSelection.startContainer.parentNode;
            jQuery(nodoLink).attr('data-per', codPeriodo);
            jQuery(nodoLink).attr('class', "perResaltadoEditor resaltadoEditor");
            jQuery(nodoLink).attr('title', "Periodo " + codPeriodo);
            jQuery(nodoLink).attr('data-dsl', "per(\'" + codPeriodo + "\')");
          } else {
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue;
            linkNode = jQuery("<a class=\"perResaltadoEditor resaltadoEditor\"             title=\"Periodo " + codPeriodo + "\"             data-dsl=\"per('" + codPeriodo + "')\"             data-per=\"" + codPeriodo + "\"             href='" + link + "'>" + texto + "</a>")[0];
            widget.lastSelection.insertNode(linkNode);
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("#addlinkButton").click(dialogSubmitCb);
        dialog.find("#dellinkButton").click(dialogSubmitBorrar);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'Periodo',
            icon: 'condicion-texto-button',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var selectionParent;
            if (!cargadosCombos) {
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerPer');
              jQuery('#filterPerPer').val('ACT');
              cargadosCombos = true;
            }
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery("#filterPerPer").val("");
              existe = false;
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              jQuery("#filterPerPer").val(jQuery(selectionParent).attr('data-per'));
              texto = jQuery(selectionParent).text();
              existe = true;
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open').dialog({
              position: {
                my: "top",
                at: "top",
                of: window
              }
            });
            toolbar.hide();
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.halloreundo", {
      options: {
        editable: null,
        toolbar: null,
        uuid: '',
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var buttonize, buttonset,
          _this = this;
        buttonset = jQuery("<span class=\"" + this.widgetName + "\"></span>");
        buttonize = function(cmd, label) {
          var buttonElement;
          buttonElement = jQuery('<span></span>');
          buttonElement.hallobutton({
            uuid: _this.options.uuid,
            editable: _this.options.editable,
            label: label,
            icon: cmd === 'undo' ? 'icon-undo' : 'icon-repeat',
            command: cmd,
            queryState: false,
            cssClass: _this.options.buttonCssClass
          });
          return buttonset.append(buttonElement);
        };
        buttonize("undo", "Undo");
        buttonize("redo", "Redo");
        buttonset.hallobuttonset();
        return toolbar.append(buttonset);
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("Liip.hallotoolbarlinebreak", {
      options: {
        editable: null,
        uuid: "",
        breakAfter: []
      },
      populateToolbar: function(toolbar) {
        var buttonRow, buttonset, buttonsets, queuedButtonsets, row, rowcounter, _i, _j, _len, _len1, _ref;
        buttonsets = jQuery('.ui-buttonset', toolbar);
        queuedButtonsets = jQuery();
        rowcounter = 0;
        _ref = this.options.breakAfter;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          rowcounter++;
          buttonRow = "<div          class=\"halloButtonrow halloButtonrow-" + rowcounter + "\" />";
          for (_j = 0, _len1 = buttonsets.length; _j < _len1; _j++) {
            buttonset = buttonsets[_j];
            queuedButtonsets = jQuery(queuedButtonsets).add(jQuery(buttonset));
            if (jQuery(buttonset).hasClass(row)) {
              queuedButtonsets.wrapAll(buttonRow);
              buttonsets = buttonsets.not(queuedButtonsets);
              queuedButtonsets = jQuery();
              break;
            }
          }
        }
        if (buttonsets.length > 0) {
          rowcounter++;
          buttonRow = "<div          class=\"halloButtonrow halloButtonrow-" + rowcounter + "\" />";
          return buttonsets.wrapAll(buttonRow);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget("IKS.variable", {
      options: {
        editable: null,
        uuid: "",
        link: true,
        image: true,
        defaultUrl: 'http://',
        dialogOpts: {
          autoOpen: false,
          width: 540,
          height: 'auto',
          title: "Ingresar Variable",
          buttonTitle: "Aceptar",
          buttonUpdateTitle: "Aceptar",
          modal: true,
          resizable: false,
          draggable: true,
          dialogClass: 'variable-dialog'
        },
        buttonCssClass: null
      },
      populateToolbar: function(toolbar) {
        var butTitle, butUpdateTitle, buttonize, buttonset, cargadosCombos, dialog, dialogId, dialogSubmitBorrar, dialogSubmitCb, existe, texto, urlInput, widget,
          _this = this;
        widget = this;
        existe = false;
        texto = "";
        cargadosCombos = false;
        dialogId = "" + this.options.uuid + "-dialog";
        butTitle = this.options.dialogOpts.buttonTitle;
        butUpdateTitle = this.options.dialogOpts.buttonUpdateTitle;
        dialog = jQuery("<div id=\"" + dialogId + "\" style=\"cursor:default;\">        <form action=\"#\" method=\"post\" class=\"linkForm\">          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"            value=\"" + this.options.defaultUrl + "\" />                      <select id=\"filterVariables\" class=\"filterChooser\" title=\"Variables\">              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione una variable --</option>          </select><br />          <input type=\"submit\" id=\"dellinkButton\" value=\"Borrar\"/>          <input type=\"submit\" id=\"addlinkButton\" value=\"" + butTitle + "\"/>        </form></div>");
        urlInput = jQuery('input[name=url]', dialog);
        dialogSubmitBorrar = function(event) {
          event.preventDefault();
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          document.execCommand("unlink", null, "");
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialogSubmitCb = function(event) {
          var codVariable, link, linkNode, nodoLink;
          event.preventDefault();
          link = "javascript:void(0)";
          dialog.dialog('close');
          widget.options.editable.restoreSelection(widget.lastSelection);
          codVariable = (jQuery("#filterVariables option:selected")).val();
          if (existe) {
            nodoLink = widget.lastSelection.startContainer.parentNode;
            jQuery(nodoLink).attr('data-codVariable', codVariable);
            jQuery(nodoLink).attr('class', "variableResaltadoEditor resaltadoEditor");
            jQuery(nodoLink).attr('title', "Variable: " + codVariable);
            jQuery(nodoLink).attr('data-dsl', "'" + codVariable + "'");
          } else {
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue;
            linkNode = jQuery("<a class=\"variableResaltadoEditor resaltadoEditor\"             title=\"Variable: " + codVariable + "\"             data-dsl=\"'" + codVariable + "'\"             data-codVariable=\"" + codVariable + "\"             href='" + link + "'>" + texto + "</a>")[0];
            widget.lastSelection.insertNode(linkNode);
          }
          widget.options.editable.element.trigger('change');
          return false;
        };
        dialog.find("#addlinkButton").click(dialogSubmitCb);
        dialog.find("#dellinkButton").click(dialogSubmitBorrar);
        buttonset = jQuery("<span class=\"" + widget.widgetName + "\"></span>");
        buttonize = function(type) {
          var button, buttonHolder, id;
          id = "" + _this.options.uuid + "-" + type;
          buttonHolder = jQuery('<span></span>');
          buttonHolder.hallobutton({
            label: 'Variable',
            icon: 'variable-button',
            editable: _this.options.editable,
            command: null,
            queryState: false,
            uuid: _this.options.uuid,
            cssClass: _this.options.buttonCssClass
          });
          buttonset.append(buttonHolder);
          button = buttonHolder;
          button.on("click", function(event) {
            var selectionParent;
            if (!cargadosCombos) {
              jQuery('.variablesEditor').find('option').clone().appendTo('#filterVariables');
              cargadosCombos = true;
            }
            widget.lastSelection = widget.options.editable.getSelection();
            urlInput = jQuery('input[name=url]', dialog);
            selectionParent = widget.lastSelection.startContainer.parentNode;
            if (!selectionParent.href) {
              urlInput.val(widget.options.defaultUrl);
              jQuery("#filterVariables").val("");
              existe = false;
            } else {
              urlInput.val(jQuery(selectionParent).attr('href'));
              jQuery("#filterVariables").val(jQuery(selectionParent).attr('data-codVariable'));
              texto = jQuery(selectionParent).text();
              existe = true;
            }
            widget.options.editable.keepActivated(true);
            dialog.dialog('open').dialog({
              position: {
                my: "top",
                at: "top",
                of: window
              }
            });
            toolbar.hide();
            dialog.on('dialogclose', function() {
              widget.options.editable.restoreSelection(widget.lastSelection);
              jQuery('label', buttonHolder).removeClass('ui-state-active');
              widget.options.editable.element.focus();
              return widget.options.editable.keepActivated(false);
            });
            return false;
          });
          return _this.element.on("keyup paste change mouseup", function(event) {
            var nodeName, start;
            start = jQuery(widget.options.editable.getSelection().startContainer);
            if (start.prop('nodeName')) {
              nodeName = start.prop('nodeName');
            } else {
              nodeName = start.parent().prop('nodeName');
            }
            if (nodeName && nodeName.toUpperCase() === "A") {
              jQuery('label', button).addClass('ui-state-active');
              return;
            }
            return jQuery('label', button).removeClass('ui-state-active');
          });
        };
        if (this.options.link) {
          buttonize("A");
        }
        if (this.options.link) {
          toolbar.append(buttonset);
          buttonset.hallobuttonset();
          return dialog.dialog(this.options.dialogOpts);
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.halloToolbarContextual', {
      toolbar: null,
      options: {
        parentElement: 'body',
        editable: null,
        toolbar: null,
        positionAbove: false
      },
      _create: function() {
        var _this = this;
        this.toolbar = this.options.toolbar;
        jQuery(this.options.parentElement).append(this.toolbar);
        this._bindEvents();
        return jQuery(window).resize(function(event) {
          return _this._updatePosition(_this._getPosition(event));
        });
      },
      _getPosition: function(event, selection) {
        var eventType, position;
        if (!event) {
          return;
        }
        eventType = event.type;
        switch (eventType) {
          case 'keydown':
          case 'keyup':
          case 'keypress':
            return this._getCaretPosition(selection);
          case 'click':
          case 'mousedown':
          case 'mouseup':
            return position = {
              top: event.pageY,
              left: event.pageX
            };
        }
      },
      _getCaretPosition: function(range) {
        var newRange, position, tmpSpan;
        tmpSpan = jQuery("<span/>");
        newRange = rangy.createRange();
        newRange.setStart(range.endContainer, range.endOffset);
        newRange.insertNode(tmpSpan.get(0));
        position = {
          top: tmpSpan.offset().top,
          left: tmpSpan.offset().left
        };
        tmpSpan.remove();
        return position;
      },
      setPosition: function() {
        if (this.options.parentElement !== 'body') {
          this.options.parentElement = 'body';
          jQuery(this.options.parentElement).append(this.toolbar);
        }
        this.toolbar.css('position', 'absolute');
        this.toolbar.css('top', this.element.offset().top - 20);
        return this.toolbar.css('left', this.element.offset().left);
      },
      _updatePosition: function(position, selection) {
        var left, selectionRect, toolbar_height_offset, top, top_offset;
        if (selection == null) {
          selection = null;
        }
        if (!position) {
          return;
        }
        if (!(position.top && position.left)) {
          return;
        }
        toolbar_height_offset = this.toolbar.outerHeight() + 10;
        if (selection && !selection.collapsed && selection.nativeRange) {
          selectionRect = selection.nativeRange.getBoundingClientRect();
          if (this.options.positionAbove) {
            top_offset = selectionRect.top - toolbar_height_offset;
          } else {
            top_offset = selectionRect.bottom + 10;
          }
          top = jQuery(window).scrollTop() + top_offset;
          left = jQuery(window).scrollLeft() + selectionRect.left;
        } else {
          if (this.options.positionAbove) {
            top_offset = -10 - toolbar_height_offset;
          } else {
            top_offset = 20;
          }
          top = position.top + top_offset;
          left = position.left - this.toolbar.outerWidth() / 2 + 30;
        }
        this.toolbar.css('top', top);
        return this.toolbar.css('left', left);
      },
      _bindEvents: function() {
        var _this = this;
        this.element.on('halloselected', function(event, data) {
          var position;
          position = _this._getPosition(data.originalEvent, data.selection);
          if (!position) {
            return;
          }
          _this._updatePosition(position, data.selection);
          if (_this.toolbar.html() !== '') {
            return _this.toolbar.show();
          }
        });
        this.element.on('hallounselected', function(event, data) {
          return _this.toolbar.hide();
        });
        return this.element.on('hallodeactivated', function(event, data) {
          return _this.toolbar.hide();
        });
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.halloToolbarFixed', {
      toolbar: null,
      options: {
        parentElement: 'body',
        editable: null,
        toolbar: null,
        affix: true,
        affixTopOffset: 2
      },
      _create: function() {
        var el, widthToAdd,
          _this = this;
        this.toolbar = this.options.toolbar;
        this.toolbar.show();
        jQuery(this.options.parentElement).append(this.toolbar);
        this._bindEvents();
        jQuery(window).resize(function(event) {
          return _this.setPosition();
        });
        jQuery(window).scroll(function(event) {
          return _this.setPosition();
        });
        if (this.options.parentElement === 'body') {
          el = jQuery(this.element);
          widthToAdd = parseFloat(el.css('padding-left'));
          widthToAdd += parseFloat(el.css('padding-right'));
          widthToAdd += parseFloat(el.css('border-left-width'));
          widthToAdd += parseFloat(el.css('border-right-width'));
          widthToAdd += (parseFloat(el.css('outline-width'))) * 2;
          widthToAdd += (parseFloat(el.css('outline-offset'))) * 2;
          return jQuery(this.toolbar).css("width", el.width() + widthToAdd);
        }
      },
      _getPosition: function(event, selection) {
        var offset, position, width;
        if (!event) {
          return;
        }
        width = parseFloat(this.element.css('outline-width'));
        offset = width + parseFloat(this.element.css('outline-offset'));
        return position = {
          top: this.element.offset().top - this.toolbar.outerHeight() - offset,
          left: this.element.offset().left - offset
        };
      },
      _getCaretPosition: function(range) {
        var newRange, position, tmpSpan;
        tmpSpan = jQuery("<span/>");
        newRange = rangy.createRange();
        newRange.setStart(range.endContainer, range.endOffset);
        newRange.insertNode(tmpSpan.get(0));
        position = {
          top: tmpSpan.offset().top,
          left: tmpSpan.offset().left
        };
        tmpSpan.remove();
        return position;
      },
      setPosition: function() {
        var elementBottom, elementTop, height, offset, scrollTop, topOffset;
        if (this.options.parentElement !== 'body') {
          return;
        }
        this.toolbar.css('position', 'absolute');
        this.toolbar.css('top', this.element.offset().top - this.toolbar.outerHeight());
        if (this.options.affix) {
          scrollTop = jQuery(window).scrollTop();
          offset = this.element.offset();
          height = this.element.height();
          topOffset = this.options.affixTopOffset;
          elementTop = offset.top - (this.toolbar.height() + this.options.affixTopOffset);
          elementBottom = (height - topOffset) + (offset.top - this.toolbar.height());
          if (scrollTop > elementTop && scrollTop < elementBottom) {
            this.toolbar.css('position', 'fixed');
            this.toolbar.css('top', this.options.affixTopOffset);
          }
        } else {

        }
        return this.toolbar.css('left', this.element.offset().left - 2);
      },
      _updatePosition: function(position) {},
      _bindEvents: function() {
        var _this = this;
        this.element.on('halloactivated', function(event, data) {
          _this.setPosition();
          return _this.toolbar.show();
        });
        return this.element.on('hallodeactivated', function(event, data) {
          return _this.toolbar.hide();
        });
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    jQuery.widget('IKS.hallobutton', {
      button: null,
      isChecked: false,
      options: {
        uuid: '',
        label: null,
        icon: null,
        editable: null,
        command: null,
        commandValue: null,
        queryState: true,
        cssClass: null
      },
      _create: function() {
        var hoverclass, id, opts, _base,
          _this = this;
        if ((_base = this.options).icon == null) {
          _base.icon = "icon-" + (this.options.label.toLowerCase());
        }
        id = "" + this.options.uuid + "-" + this.options.label;
        opts = this.options;
        this.button = this._createButton(id, opts.command, opts.label, opts.icon);
        this.element.append(this.button);
        if (this.options.cssClass) {
          this.button.addClass(this.options.cssClass);
        }
        if (this.options.editable.options.touchScreen) {
          this.button.addClass('btn-large');
        }
        this.button.data('hallo-command', this.options.command);
        if (this.options.commandValue) {
          this.button.data('hallo-command-value', this.options.commandValue);
        }
        hoverclass = 'ui-state-hover';
        this.button.on('mouseenter', function(event) {
          if (_this.isEnabled()) {
            return _this.button.addClass(hoverclass);
          }
        });
        return this.button.on('mouseleave', function(event) {
          return _this.button.removeClass(hoverclass);
        });
      },
      _init: function() {
        var editableElement, events, queryState,
          _this = this;
        if (!this.button) {
          this.button = this._prepareButton();
        }
        this.element.append(this.button);
        if (this.options.queryState === true) {
          queryState = function(event) {
            var compared, e, value;
            if (!_this.options.command) {
              return;
            }
            try {
              if (_this.options.commandValue) {
                value = document.queryCommandValue(_this.options.command);
                compared = value.match(new RegExp(_this.options.commandValue, "i"));
                return _this.checked(compared ? true : false);
              } else {
                return _this.checked(document.queryCommandState(_this.options.command));
              }
            } catch (_error) {
              e = _error;
            }
          };
        } else {
          queryState = this.options.queryState;
        }
        if (this.options.command) {
          this.button.on('click', function(event) {
            if (_this.options.commandValue) {
              _this.options.editable.execute(_this.options.command, _this.options.commandValue);
            } else {
              _this.options.editable.execute(_this.options.command);
            }
            if (typeof queryState === 'function') {
              queryState();
            }
            return false;
          });
        }
        if (!this.options.queryState) {
          return;
        }
        editableElement = this.options.editable.element;
        events = 'keyup paste change mouseup hallomodified';
        editableElement.on(events, queryState);
        editableElement.on('halloenabled', function() {
          return editableElement.on(events, queryState);
        });
        return editableElement.on('hallodisabled', function() {
          return editableElement.off(events, queryState);
        });
      },
      enable: function() {
        return this.button.removeAttr('disabled');
      },
      disable: function() {
        return this.button.attr('disabled', 'true');
      },
      isEnabled: function() {
        return this.button.attr('disabled') !== 'true';
      },
      refresh: function() {
        if (this.isChecked) {
          return this.button.addClass('ui-state-active');
        } else {
          return this.button.removeClass('ui-state-active');
        }
      },
      checked: function(checked) {
        this.isChecked = checked;
        return this.refresh();
      },
      _createButton: function(id, command, label, icon) {
        var classes;
        classes = ['ui-button', 'ui-widget', 'ui-state-default', 'ui-corner-all', 'ui-button-text-only', "" + command + "_button"];
        return jQuery("<button id=\"" + id + "\"        class=\"" + (classes.join(' ')) + "\" title=\"" + label + "\">          <span class=\"ui-button-text\">            <i class=\"" + icon + "\"></i>          </span>        </button>");
      }
    });
    return jQuery.widget('IKS.hallobuttonset', {
      buttons: null,
      _create: function() {
        return this.element.addClass('ui-buttonset');
      },
      _init: function() {
        return this.refresh();
      },
      refresh: function() {
        var rtl;
        rtl = this.element.css('direction') === 'rtl';
        this.buttons = this.element.find('.ui-button');
        this.buttons.removeClass('ui-corner-all ui-corner-left ui-corner-right');
        if (rtl) {
          this.buttons.filter(':first').addClass('ui-corner-right');
          return this.buttons.filter(':last').addClass('ui-corner-left');
        } else {
          this.buttons.filter(':first').addClass('ui-corner-left');
          return this.buttons.filter(':last').addClass('ui-corner-right');
        }
      }
    });
  })(jQuery);

}).call(this);

(function() {
  (function(jQuery) {
    return jQuery.widget('IKS.hallodropdownbutton', {
      button: null,
      options: {
        uuid: '',
        label: null,
        icon: null,
        editable: null,
        target: '',
        cssClass: null
      },
      _create: function() {
        var _base;
        return (_base = this.options).icon != null ? (_base = this.options).icon : _base.icon = "icon-" + (this.options.label.toLowerCase());
      },
      _init: function() {
        var target,
          _this = this;
        target = jQuery(this.options.target);
        target.css('position', 'absolute');
        target.addClass('dropdown-menu');
        target.hide();
        if (!this.button) {
          this.button = this._prepareButton();
        }
        this.button.on('click', function() {
          if (target.hasClass('open')) {
            _this._hideTarget();
            return;
          }
          return _this._showTarget();
        });
        target.on('click', function() {
          return _this._hideTarget();
        });
        this.options.editable.element.on('hallodeactivated', function() {
          return _this._hideTarget();
        });
        return this.element.append(this.button);
      },
      _showTarget: function() {
        var target;
        target = jQuery(this.options.target);
        this._updateTargetPosition();
        target.addClass('open');
        return target.show();
      },
      _hideTarget: function() {
        var target;
        target = jQuery(this.options.target);
        target.removeClass('open');
        return target.hide();
      },
      _updateTargetPosition: function() {
        var left, target, top, _ref;
        target = jQuery(this.options.target);
        _ref = this.button.position(), top = _ref.top, left = _ref.left;
        top += this.button.outerHeight();
        target.css('top', top);
        return target.css('left', left - 20);
      },
      _prepareButton: function() {
        var buttonEl, classes, id;
        id = "" + this.options.uuid + "-" + this.options.label;
        classes = ['ui-button', 'ui-widget', 'ui-state-default', 'ui-corner-all', 'ui-button-text-only'];
        buttonEl = jQuery("<button id=\"" + id + "\"       class=\"" + (classes.join(' ')) + "\" title=\"" + this.options.label + "\">       <span class=\"ui-button-text\"><i class=\"" + this.options.icon + "\"></i></span>       </button>");
        if (this.options.cssClass) {
          buttonEl.addClass(this.options.cssClass);
        }
        return buttonEl;
      }
    });
  })(jQuery);

}).call(this);
