#     AKELAB Diagnostico
#     2013
((jQuery) ->
  jQuery.widget "IKS.diagnostico",
    options:
      editable: null
      uuid: ""
      link: true
      image: true
      defaultUrl: 'http://'
      dialogOpts:
        autoOpen: false
        width: 540
        title: "Ingresar Diagn\u00F3stico"
        buttonTitle: "Aceptar"
        buttonUpdateTitle: "Aceptar"
        modal: true
        resizable: false
        draggable: true
        dialogClass: 'diagnostico-dialog'
        buttons: 
            Agregar:
                id: 'agregar-button',
                text: 'Agregar',
                click: () ->
                    
            Borrar:
                text: 'Borrar',
                id: 'borrar-button',
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
      dialog = jQuery "<div id='#{dialogId}' style='cursor:default;'>
        <form action='#' method='post' class='linkForm'>
          <input class='url' style='display:none' type='text' name='url'
            value='#{@options.defaultUrl}' />
            
          <TABLE>
          	<TR>
	    				<TD style='padding: 2px;width:48%;'>
			          <fieldset style='border:2px solid black;'>
			          <legend>C\u00E1psula</legend>
			          
				          <select id='filterDia' class='filterChooser' style='width:60%;' title='Diagn\u00F3sticos'>
				              <option value='' data-filter-type='' selected='selected'>-- Seleccionar --</option>
				          </select>
                  
                  <select id='filterPerDia' class='filterChooser' style='width:35%;' title='Periodos'></select>
			          </fieldset>
          		</TD>
          		<TD style='padding: 2px;width:48%;'>
			          <fieldset style='border:2px solid black;'>
						    <legend>Campo BD</legend>
                  
			          <select id='filterCampoDia' class='filterChooser' style='width:80%;' title='Campo'>
			              <option value='CALIFICACION' selected='selected'>CALIFICACI\u00D3N</option>
			              <option value='COMENTARIO1'>COMENTARIO1</option>
			              <option value='COMENTARIO2'>COMENTARIO2</option>
			              <option value='COMENTARIO3'>COMENTARIO3</option>
			              <option value='COMENTARIO4'>COMENTARIO4</option>
			              <option value='COMENTARIO5'>COMENTARIO5</option>
			          </select>
			          </fieldset>
			        </TD>
            </TR>
            <TR>
                <TD style='padding: 2px;width:48%;'>
			          <fieldset style='border:2px solid black;'>
			          <legend>Opciones</legend>
			              <input type='checkbox' name='perfilgenerico' id='filterPerfilDia' value='S'>Perfil Gen\u00E9rico<br>
			          </fieldset>
			        </TD>
            </TR>
          </TABLE>

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

        #link = urlInput.val()
        link = "javascript:void(0)"
        dialog.dialog('close')

        widget.options.editable.restoreSelection(widget.lastSelection)
        codCapsula = (jQuery "#filterDia option:selected").val()
        codPeriodo = (jQuery "#filterPerDia option:selected").val()
        campo = (jQuery "#filterCampoDia option:selected").val()
        if (jQuery "#filterPerfilDia").prop('checked')
            perfilGenerico = 'S'
        else
        	  perfilGenerico = 'N'
        
        if codCapsula is ""
            resaltado = "diaOscuroResaltadoEditor"
        else
            resaltado = "diaResaltadoEditor"
            
        #widget.lastSelection.collapse(true);
        if existe
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-cap', codCapsula)
            jQuery(nodoLink).attr('data-per', codPeriodo)
            jQuery(nodoLink).attr('data-campo', campo)
            jQuery(nodoLink).attr('data-perfilGenerico', perfilGenerico)
            jQuery(nodoLink).attr('class', resaltado + " resaltadoEditor")
            jQuery(nodoLink).attr('title', "Diagn\u00F3stico #{codCapsula} del Periodo #{codPeriodo}. Campo: #{campo}. Perfil Gen\u00E9rico: #{perfilGenerico}.")
            jQuery(nodoLink).attr('data-dsl', "dia(\'#{codCapsula}\',\'#{codPeriodo}\',\'#{campo}\',\'#{perfilGenerico}\')")
        else
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"" + resaltado + " resaltadoEditor\" 
            title=\"Diagn\u00F3stico #{codCapsula} del Periodo #{codPeriodo}. Campo: #{campo}. Perfil Gen\u00E9rico: #{perfilGenerico}.\" 
            data-dsl=\"dia('#{codCapsula}','#{codPeriodo}','#{campo}','#{perfilGenerico}')\" 
            data-cap=\"#{codCapsula}\" 
            data-per=\"#{codPeriodo}\" 
            data-campo=\"#{campo}\" 
            data-perfilGenerico=\"#{perfilGenerico}\" 
            href='#{link}'>#{texto}</a>")[0];
            widget.lastSelection.insertNode(linkNode);
        widget.options.editable.element.trigger('change')
        return false

      #dialog.find("#addlinkButton").click dialogSubmitCb

      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      buttonize = (type) =>
        id = "#{@options.uuid}-#{type}"
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: 'Diagn\u00F3stico'
          icon: 'diagnostico-button'
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
              jQuery("#borrar-button").click dialogSubmitBorrar
              jQuery("#agregar-button").click dialogSubmitCb
              jQuery('.diasel2').find('option').clone().appendTo('#filterDia');
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerDia')
              jQuery('#filterPerDia').val('ACT')
              cargadosCombos = true
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            jQuery("#filterDia").val ""
            jQuery("#filterPerDia").val ""
            jQuery("#filterCampoDia").val "CALIFICACION"
            jQuery("#filterPerfilDia").attr('checked', false);
            existe = false
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            jQuery("#filterDia").val jQuery(selectionParent).attr('data-cap')
            jQuery("#filterPerDia").val jQuery(selectionParent).attr('data-per')
            jQuery("#filterCampoDia").val jQuery(selectionParent).attr('data-campo')
            if jQuery(selectionParent).attr('data-perfilGenerico') is 'S'
                jQuery("#filterPerfilDia").attr('checked', true);
            else
                jQuery("#filterPerfilDia").attr('checked', false);
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
