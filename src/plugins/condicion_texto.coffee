#     AKELAB CondicionTexto
#     2013
((jQuery) ->
  jQuery.widget "IKS.condicionTexto",
    options:
      editable: null
      uuid: ""
      link: true
      image: true
      defaultUrl: 'http://'
      dialogOpts:
        autoOpen: false
        width: 750
        height: 320
        title: "Ingresar Condici\u00F3n"
        buttonTitle: "Aceptar"
        buttonUpdateTitle: "Aceptar"
        modal: true
        resizable: false
        draggable: true
        dialogClass: 'condicionT-dialog'
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
          <TABLE>
          	<TR >
	    				<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid red;\">
			          <legend>Operando 1</legend>
			          <input type='radio' name='opt1' style='margin: 10px;' checked value='capsula'>C&aacute;psula</input>
			          </br>
			          <select id=\"filterCapConT1\" class=\"caps1 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerConT1\" class=\"caps1 caps\" style=\"width:25%;\"  title=\"Periodos\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Per.</option>
			              <option value=\"ACT\" data-filter-type=\"stringMatch\">ACT</option>
										<option value=\"ANT_1\" data-filter-type=\"stringMatch\">ANT_1</option>
										<option value=\"POS_1\" data-filter-type=\"stringMatch\">POS_1</option>
										<option value=\"ANT_2\" data-filter-type=\"stringMatch\">ANT_2</option>
										<option value=\"POS_2\" data-filter-type=\"stringMatch\">POS_2</option>
										<option value=\"ANT_3\" data-filter-type=\"stringMatch\">ANT_3</option>
										<option value=\"POS_3\" data-filter-type=\"stringMatch\">POS_3</option>
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constanteT1\" style=\"width:80%;\" value=\"\" />
			          </fieldset>
          		</TD>
          		<TD style=\"padding: 2px;width:10%;\">
			          <fieldset style=\"border:2px solid black;\">
						    <legend>Comparaci\u00F3n</legend>
			          <select id=\"filterCompCT\" class=\"filterChooser\" style=\"font-size: 14px;font-weight: bold;\" title=\"Comparaci\u00F3n\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Comparaci\u00F3n\ --</option>
			              <option value=\"=\" data-filter-type=\"\" >==</option>
			              <option value=\"<>\" data-filter-type=\"\" ><></option>
			          </select>
			          </fieldset>
			        </TD>
          		<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid blue;\">
			          <legend>Operando 2</legend>
			          <input type='radio' name='opt2' style='margin: 10px;' value='capsula'>C&aacute;psula</input>
  							<input type='radio' name='opt2' style='margin: 10px;' value='constante'>Constante</input>
			          </br>
			          <select id=\"filterCapConT2\" class=\"caps2 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerConT2\" class=\"caps2 caps\" style=\"width:25%;\"  title=\"Periodos\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Per.</option>
			              <option value=\"ACT\" data-filter-type=\"stringMatch\">ACT</option>
										<option value=\"ANT_1\" data-filter-type=\"stringMatch\">ANT_1</option>
										<option value=\"POS_1\" data-filter-type=\"stringMatch\">POS_1</option>
										<option value=\"ANT_2\" data-filter-type=\"stringMatch\">ANT_2</option>
										<option value=\"POS_2\" data-filter-type=\"stringMatch\">POS_2</option>
										<option value=\"ANT_3\" data-filter-type=\"stringMatch\">ANT_3</option>
										<option value=\"POS_3\" data-filter-type=\"stringMatch\">POS_3</option>
			          </select>
			          <input class=\"constantes\" type=\"text\" id=\"constanteT2\" style=\"margin:0px;width:80%;\" value=\"\" />
			          </fieldset>
			        </TD>
            </TR>
          </TABLE>
          
          <fieldset style=\"border:2px solid black;\">
			          <legend>Resultado</legend>
          <TABLE>
          	<TR>
	    				<TD style=\"padding: 2px;\">Verdadero:</TD>
	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"tvalCT\" style=\"width:25%;\" value=\"\" /></TD>
          	</TR>
          	<TR>
	    				<TD style=\"padding: 2px;\">Falso:</TD>
	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"fvalCT\" style=\"width:25%;\" value=\"\" /></TD>
          	</TR>
          </TABLE>
          </fieldset>
          
          <input type=\"submit\" style=\"margin:6px;\" id=\"dellinkButton\" value=\"Borrar\"/>
          <input type=\"submit\" style=\"margin:6px;\" id=\"addlinkButton\" value=\"#{butTitle}\"/>
        </form></div>"
      urlInput = jQuery('input[name=url]', dialog)

      cargarTipoOperando = (tipoOp, nombreSufijo ) ->
        if tipoOp is 'capsula'
            jQuery("input:radio[name=opt#{nombreSufijo}]")[0].checked = true
            jQuery("#constanteT#{nombreSufijo}").hide()
            jQuery(".caps#{nombreSufijo}").show()
        else
            jQuery("input:radio[name=opt#{nombreSufijo}]")[1].checked = true
            jQuery("#constanteT#{nombreSufijo}").show()
            jQuery(".caps#{nombreSufijo}").hide()
      
      ocultarCampos = (nombreSufijo ) ->
        jQuery("input:radio[name=opt#{nombreSufijo}]").on("change", ((event)->
                 if jQuery("input:radio[name=opt#{nombreSufijo}]")[0].checked
                     jQuery("#constanteT#{nombreSufijo}").hide()
                     jQuery(".caps#{nombreSufijo}").show()
                 else
                     jQuery("#constanteT#{nombreSufijo}").show()
                     jQuery(".caps#{nombreSufijo}").hide()
        ));
            
      generarOperando = (nombreSufijo) ->
            if jQuery("input:radio[name=opt#{nombreSufijo}]")[0].checked
                codCap = (jQuery "#filterCapConT#{nombreSufijo} option:selected").val()
                codPer = (jQuery "#filterPerConT#{nombreSufijo} option:selected").val()
                if codCap is "" or codPer is ""
                    funcion = ""
                    texto = ""
                else
                    funcion = "capf('#{codCap}','#{codPer}')"
                    texto = "[C\u00E1psula #{codCap} del Periodo #{codPer}]"
                return {
                    'dsl' : funcion
                    'txt' : texto
                    'tipo': 'capsula'
                };
            else
                valorConstante = (jQuery "#constanteT#{nombreSufijo}").val()
                return {
                    'dsl' : "'#{valorConstante}'"
                    'txt' : (jQuery "#constanteT#{nombreSufijo}").val()
                    'tipo': 'constante'
                };
                
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

        #Extrae los valores q selecciono el usr para generar el lenguaje dsl
        widget.options.editable.restoreSelection(widget.lastSelection)
        codCapsula1 = (jQuery "#filterCapConT1 option:selected").val()
        codPeriodo1 = (jQuery "#filterPerConT1 option:selected").val()
        codCapsula2 = (jQuery "#filterCapConT2 option:selected").val()
        codPeriodo2 = (jQuery "#filterPerConT2 option:selected").val()
        
        comparacion = (jQuery "#filterCompCT option:selected").val()
        constante1 = (jQuery "#constanteT1").val()
        constante2 = (jQuery "#constanteT2").val()
        
        tval = (jQuery "#tvalCT").val()
        fval = (jQuery "#fvalCT").val()
        
        op1f = generarOperando '1'
        op2f = generarOperando '2'
        
        #widget.lastSelection.collapse(true);
        if existe
            #actualizo el los atributos del link actual
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-cap', codCapsula1)
            jQuery(nodoLink).attr('data-per', codPeriodo1)
            jQuery(nodoLink).attr('data-cap2', codCapsula2)
            jQuery(nodoLink).attr('data-per2', codPeriodo2)
            
            jQuery(nodoLink).attr('data-comp', comparacion)
            jQuery(nodoLink).attr('data-constante1', constante1)
            jQuery(nodoLink).attr('data-constante2', constante2)
            
            jQuery(nodoLink).attr('data-tipoOperando1', op1f.tipo)
            jQuery(nodoLink).attr('data-tipoOperando2', op2f.tipo)
            
            jQuery(nodoLink).attr('data-tval', tval)
            jQuery(nodoLink).attr('data-fval', fval)
            jQuery(nodoLink).attr('class', "conTResaltadoEditor resaltadoEditor")
            jQuery(nodoLink).attr('title', "SI TEXTO #{op1f.txt} #{comparacion} #{op2f.txt} ENTONCES #{tval} SINO #{fval}")
            jQuery(nodoLink).attr('data-dsl', "ift(#{op1f.dsl} #{comparacion} #{op2f.dsl}, '#{tval}', '#{fval}')")
        else
            #creo un link con los datos de la capsula
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"conTResaltadoEditor resaltadoEditor\" 
            title=\"SI TEXTO #{op1f.txt} #{comparacion} #{op2f.txt} ENTONCES #{tval} SINO #{fval}\" 
            data-dsl=\"ift(#{op1f.dsl} #{comparacion} #{op2f.dsl}, '#{tval}', '#{fval}')\" 
            data-cap=\"#{codCapsula1}\" 
            data-per=\"#{codPeriodo1}\" 
            data-cap2=\"#{codCapsula2}\" 
            data-per2=\"#{codPeriodo2}\" 
            data-comp=\"#{comparacion}\" 
            
            data-constante1=\"#{constante1}\" 
            data-constante2=\"#{constante2}\" 
            
            data-tipoOperando1=\"#{op1f.tipo}\"
            data-tipoOperando2=\"#{op2f.tipo}\"
            
            data-tval=\"#{tval}\" 
            data-fval=\"#{fval}\" 
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
          label: 'Condici\u00F3n Texto'
          icon: 'icon-text-height'
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
              jQuery('.capselTexto').find('option').clone().appendTo('#filterCapConT1');
              jQuery('.capselTexto').find('option').clone().appendTo('#filterCapConT2');
              
              #ocultarCampos '1'
              ocultarCampos '2'
                            
              cargadosCombos = true
              
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          jQuery(".constantes").hide();
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            #jQuery("input:radio[name=opt1]")[0].checked = true;
            jQuery("input:radio[name=opt2]")[0].checked = true;
            
            jQuery("input:radio[name=opt1]").trigger("change");
            jQuery("input:radio[name=opt2]").trigger("change");
            
            jQuery(".caps").val ""
            jQuery("#filterCompCT").val ""
            jQuery(".constantes").val ""
            jQuery("#tvalCT").val ""
            jQuery("#fvalCT").val ""
            existe = false
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            jQuery("#filterCapConT1").val jQuery(selectionParent).attr('data-cap')
            jQuery("#filterPerConT1").val jQuery(selectionParent).attr('data-per')
            jQuery("#filterCapConT2").val jQuery(selectionParent).attr('data-cap2')
            jQuery("#filterPerConT2").val jQuery(selectionParent).attr('data-per2')
            jQuery("#filterCompCT").val jQuery(selectionParent).attr('data-comp')
            
            jQuery("#constanteT1").val jQuery(selectionParent).attr('data-constante1')
            jQuery("#constanteT2").val jQuery(selectionParent).attr('data-constante2')
            
            jQuery("#tvalCT").val jQuery(selectionParent).attr('data-tval')
            jQuery("#fvalCT").val jQuery(selectionParent).attr('data-fval')
            
            tipoOp1 = jQuery(selectionParent).attr('data-tipoOperando1')
            tipoOp2 = jQuery(selectionParent).attr('data-tipoOperando2')
            
            #cargarTipoOperando tipoOp1, '1'
            cargarTipoOperando tipoOp2, '2'
            	  
            texto = jQuery(selectionParent).text()
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
