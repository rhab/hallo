#     AKELAB Variable
#     2013
((jQuery) ->
  jQuery.widget "IKS.variable",
    options:
      editable: null
      uuid: ""
      link: true
      image: true
      defaultUrl: 'http://'
      dialogOpts:
        autoOpen: false
        width: 540
        height: 'auto'
        title: "Ingresar Variable"
        buttonTitle: "Aceptar"
        buttonUpdateTitle: "Aceptar"
        modal: true
        resizable: false
        draggable: true
        dialogClass: 'variable-dialog'
      buttonCssClass: null 

    populateToolbar: (toolbar) ->
      widget = this
      existe = false
      texto = ""
      cargadosCombos = false

      dialogId = "#{@options.uuid}-dialog"
      butTitle = @options.dialogOpts.buttonTitle
      butUpdateTitle = @options.dialogOpts.buttonUpdateTitle
      dialog = jQuery "<div id=\"#{dialogId}\" style=\"cursor:default;\">
        <form action=\"#\" method=\"post\" class=\"linkForm\">
          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"
            value=\"#{@options.defaultUrl}\" />
            
          <select id=\"filterVariables\" class=\"filterChooser\" title=\"Variables\">
              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione una variable --</option>
          </select><br />
          <input type=\"submit\" id=\"dellinkButton\" value=\"Borrar\"/>
          <input type=\"submit\" id=\"addlinkButton\" value=\"#{butTitle}\"/>
        </form></div>"
      urlInput = jQuery('input[name=url]', dialog)
                
      dialogSubmitBorrar = (event) ->
        event.preventDefault()
        dialog.dialog('close')
        widget.options.editable.restoreSelection(widget.lastSelection)
        document.execCommand "unlink", null, ""
        widget.options.editable.element.trigger('change')
        return false
        
      dialogSubmitCb = (event) ->
        event.preventDefault()

        link = "javascript:void(0)"
        dialog.dialog('close')

        #Extrae los valores q selecciono el usr para generar el lenguaje dsl
        widget.options.editable.restoreSelection(widget.lastSelection)
        codVariable = (jQuery "#filterVariables option:selected").val()
        
        #widget.lastSelection.collapse(true);
        if existe
            #actualizo el los atributos del link actual
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-codVariable', codVariable)
            jQuery(nodoLink).attr('class', "variableResaltadoEditor resaltadoEditor")
            jQuery(nodoLink).attr('title', "Variable: #{codVariable}")
            jQuery(nodoLink).attr('data-dsl', "'#{codVariable}'")
        else
            #creo un link con los datos de la capsula
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"variableResaltadoEditor resaltadoEditor\" 
            title=\"Variable: #{codVariable}\" 
            data-dsl=\"'#{codVariable}'\" 
            data-codVariable=\"#{codVariable}\" 
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
          label: 'Variable'
          icon: 'variable-button'
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
              jQuery('.variablesEditor').find('option').clone().appendTo('#filterVariables');
                            
              cargadosCombos = true
              
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          #Abrir dialogo 1ro no existe resaltado
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            jQuery("#filterVariables").val ""
            existe = false
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            jQuery("#filterVariables").val jQuery(selectionParent).attr('data-codVariable')
            texto = jQuery(selectionParent).text()
            existe = true

          widget.options.editable.keepActivated true
          dialog.dialog('open').dialog({ position: { my: "top", at: "top", of: window } })
          toolbar.hide()

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
