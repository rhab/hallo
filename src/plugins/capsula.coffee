#     AKELAB Capsula
#     2013
((jQuery) ->
  jQuery.widget "IKS.capsula",
    options:
      editable: null
      uuid: ""
      link: true
      image: true
      defaultUrl: 'http://'
      dialogOpts:
        autoOpen: false
        width: 540
        height: 200
        title: "Ingresar C\u00E1psula"
        buttonTitle: "Aceptar"
        buttonUpdateTitle: "Aceptar"
        modal: true
        resizable: false
        draggable: true
        dialogClass: 'capsula-dialog'
        buttons: 
            Agregar:
                id: 'agregar-button-caps',
                text: 'Agregar',
                click: () ->
                    
            Borrar:
                text: 'Borrar',
                id: 'borrar-button-caps',
                click: () ->
                    
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
        <form action=\"#\" method=\"post\" class=\"linkForm\" >
          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"
            value=\"#{@options.defaultUrl}\" />
            
          <select id=\"filterCap\" class=\"filterChooser\" style=\"width:45%;\" title=\"C&aacute;psulas\">
              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione una C&aacute;psula --</option>
          </select>
          
          <select id=\"filterPer\" class=\"filterChooser\" style=\"width:15%;\" title=\"Periodos\">
          </select><br />
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
        link = "javascript:void(0)"
        dialog.dialog('close')

        widget.options.editable.restoreSelection(widget.lastSelection)
        codCapsula = (jQuery "#filterCap option:selected").val()
        codPeriodo = (jQuery "#filterPer option:selected").val()
        
        if codCapsula is ""
            resaltado = "capOscuroResaltadoEditor"
        else
            resaltado = "capResaltadoEditor"
        
        #widget.lastSelection.collapse(true);
        if existe
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-cap', codCapsula)
            jQuery(nodoLink).attr('data-per', codPeriodo)
            jQuery(nodoLink).attr('class', resaltado + " resaltadoEditor")
            jQuery(nodoLink).attr('title', "C\u00E1psula #{codCapsula} del Periodo #{codPeriodo}")
            jQuery(nodoLink).attr('data-dsl', "capf(\'#{codCapsula}\',\'#{codPeriodo}\')")
        else
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"" + resaltado + " resaltadoEditor\" 
            title=\"C&aacute;psula #{codCapsula} del Periodo #{codPeriodo}\" 
            data-dsl=\"capf('#{codCapsula}','#{codPeriodo}')\" 
            data-cap=\"#{codCapsula}\" 
            data-per=\"#{codPeriodo}\" 
            href='#{link}'>#{texto}</a>")[0];
            widget.lastSelection.insertNode(linkNode);
        widget.options.editable.element.trigger('change')
        return false

      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      buttonize = (type) =>
        id = "#{@options.uuid}-#{type}"
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: 'C&aacute;psula'
          icon: 'capsula-button'
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
              jQuery("#borrar-button-caps").click dialogSubmitBorrar
              jQuery("#agregar-button-caps").click dialogSubmitCb
              jQuery('.capsel').find('option').clone().appendTo('#filterCap')
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPer')
              jQuery('#filterPer').val('ACT')
              cargadosCombos = true
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            jQuery("#filterCap").val ""
            jQuery("#filterPer").val ""
            existe = false
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            jQuery("#filterCap").val jQuery(selectionParent).attr('data-cap')
            jQuery("#filterPer").val jQuery(selectionParent).attr('data-per')
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
