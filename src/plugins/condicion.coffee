#     AKELAB Condicion
#     2013
((jQuery) ->
  jQuery.widget "IKS.condicion",
    options:
      editable: null
      uuid: ""
      link: true
      image: true
      defaultUrl: 'http://'
      dialogOpts:
        autoOpen: false
        width: 590
        height: 200
        title: "Ingresar Condici\u00F3n"
        buttonTitle: "Aceptar"
        buttonUpdateTitle: "Aceptar"
        modal: true
        resizable: false
        draggable: true
        dialogClass: 'condicion-dialog'
      buttonCssClass: null 

    populateToolbar: (toolbar) ->
      widget = this
      existe = false
      texto = ""
      cargadosCombos = false

      dialogId = "#{@options.uuid}-dialog"
      butTitle = @options.dialogOpts.buttonTitle
      butUpdateTitle = @options.dialogOpts.buttonUpdateTitle
      dialog = jQuery "<div id=\"#{dialogId}\">
        <form action=\"#\" method=\"post\" class=\"linkForm\">
          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"
            value=\"#{@options.defaultUrl}\" />
            
          <select id=\"filterCapCon1\" class=\"filterChooser\" title=\"C&aacute;psulas\">
              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione una C&aacute;psula --</option>
          </select>
          
          <select id=\"filterOpe\" class=\"filterChooser\" title=\"Operaci\u00F3n\">
              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Operaci\u00F3n --</option>
              <option value=\"+\" data-filter-type=\"\" >+</option>
              <option value=\"-\" data-filter-type=\"\" >-</option>
              <option value=\"*\" data-filter-type=\"\" >*</option>
              <option value=\"/\" data-filter-type=\"\" >/</option>
          </select>
          
          <select id=\"filterCapCon2\" class=\"filterChooser\" title=\"C&aacute;psulas\">
              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione una C&aacute;psula --</option>
          </select>
          
          <input class=\"url\" type=\"text\" id=\"tval\"
            value=\"\" />
            
          <input class=\"url\" type=\"text\" id=\"fval\"
            value=\"\" />
          
          <input type=\"submit\" id=\"dellinkButton\" value=\"Borrar\"/>
          <input type=\"submit\" id=\"addlinkButton\" value=\"#{butTitle}\"/>
        </form></div>"
      urlInput = jQuery('input[name=url]', dialog)

      isEmptyLink = (link) ->
        return true if (new RegExp(/^\s*$/)).test link
        return true if link is widget.options.defaultUrl
        false

      dialogSubmitBorrar = (event) ->
        event.preventDefault()
        dialog.dialog('close')
        widget.options.editable.restoreSelection(widget.lastSelection)
        document.execCommand "unlink", null, ""
        widget.options.editable.element.trigger('change')
        return false
        
      dialogSubmitCb = (event) ->
        event.preventDefault()

        #link = urlInput.val()
        link = "http://."
        dialog.dialog('close')

        widget.options.editable.restoreSelection(widget.lastSelection)
        codCapsula = (jQuery "#filterDia option:selected").val()
        codPeriodo = (jQuery "#filterPerDia option:selected").val()
        
        #widget.lastSelection.collapse(true);
        if existe
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-cap', codCapsula)
            jQuery(nodoLink).attr('data-per', codPeriodo)
            jQuery(nodoLink).attr('class', "diaResaltadoEditor resaltadoEditor")
            jQuery(nodoLink).attr('title', "Diagn\u00F3stico #{codCapsula} ## Periodo #{codPeriodo}")
            jQuery(nodoLink).attr('data-dsl', "dia(\'#{codCapsula}\',\'#{codPeriodo}\')")
        else
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"diaResaltadoEditor resaltadoEditor\" 
            title=\"Diagn\u00F3stico #{codCapsula} ## Periodo #{codPeriodo}\" 
            data-dsl=\"dia('#{codCapsula}','#{codPeriodo}')\" 
            data-cap=\"#{codCapsula}\" 
            data-per=\"#{codPeriodo}\" 
            href='#{link}'>#{texto}</a>")[0];
            widget.lastSelection.insertNode(linkNode);
        widget.options.editable.element.trigger('change')
        return false

      dialog.find("#addlinkButton").click dialogSubmitCb
      dialog.find("#dellinkButton").click dialogSubmitBorrar
      

      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      buttonize = (type) =>
        id = "#{@options.uuid}-#{type}"
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: 'Condici\u00F3n'
          icon: 'icon-plus-sign'
          editable: @options.editable
          command: null
          queryState: false
          uuid: @options.uuid
          cssClass: @options.buttonCssClass
        buttonset.append buttonHolder
        button = buttonHolder
        button.on "click", (event) ->
          # we need to save the current selection because we will lose focus
          if not cargadosCombos
              #jQuery('.diasel').find('option').clone().appendTo('#filterDia');
              cargadosCombos = true
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            #jQuery("#filterDia").val ""
            #jQuery("#filterPerDia").val ""
            existe = false
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            #jQuery("#filterDia").val jQuery(selectionParent).attr('data-cap')
            #jQuery("#filterPerDia").val jQuery(selectionParent).attr('data-per')
            #texto = jQuery(selectionParent).text()
            existe = true

          widget.options.editable.keepActivated true
          dialog.dialog('open').dialog({ position: { my: "top", at: "top", of: window } })

          dialog.on 'dialogclose', ->
            widget.options.editable.restoreSelection widget.lastSelection
            jQuery('label', buttonHolder).removeClass 'ui-state-active'
            do widget.options.editable.element.focus
            widget.options.editable.keepActivated false
          return false

        @element.on "keyup paste change mouseup", (event) ->
          start = jQuery(widget.options.editable.getSelection().startContainer)
          if start.prop('nodeName')
            nodeName = start.prop('nodeName')
          else
            nodeName = start.parent().prop('nodeName')
          if nodeName and nodeName.toUpperCase() is "A"
            jQuery('label', button).addClass 'ui-state-active'
            return
          jQuery('label', button).removeClass 'ui-state-active'

      if (@options.link)
        buttonize "A"

      if (@options.link)
        toolbar.append buttonset
        buttonset.hallobuttonset()
        dialog.dialog(@options.dialogOpts)
)(jQuery)
