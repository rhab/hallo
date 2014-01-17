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
        width: 750
        height: "auto"
        title: "Ingresar Condici\u00F3n"
        buttonTitle: "Aceptar"
        buttonUpdateTitle: "Aceptar"
        modal: true
        resizable: false
        stack: true
        draggable: true
        dialogClass: 'condicion-dialog'
        buttons: 
            Agregar:
                id: 'agregar-button-cond',
                text: 'Agregar',
                click: () ->
                    
            Borrar:
                text: 'Borrar',
                id: 'borrar-button-cond',
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
        <form action=\"#\" method=\"post\" class=\"linkForm\">
          <input class=\"url\" style=\"display:none\" type=\"text\" name=\"url\"
            value=\"#{@options.defaultUrl}\" />
          <TABLE>
          	<TR>
	    				<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid red;\">
			          <legend>Operando 1</legend>
			          <input type='radio' name='op1' style='margin: 10px;' value='capsula'>C&aacute;psula</input>
  							<input type='radio' name='op1' style='margin: 10px;' value='constante'>Constante</input>
			          </br>
			          <select id=\"filterCapCon1\" class=\"caps1 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon1\" class=\"caps1 caps\" style=\"width:25%;\"  title=\"Periodos\">
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante1\" style=\"width:80%;\" value=\"\" />
			          </fieldset>
          		</TD>
          		<TD style=\"padding: 2px;width:10%;\">
			          <fieldset style=\"border:2px solid black;\">
			          <legend>Operaci\u00F3n</legend>
				          <select id=\"filterOpe\" class=\"filterChooser\" style=\"width:100%;font-size: 14px;font-weight: bold;\" title=\"Operaci\u00F3n\">
				              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Op.</option>
				              <option value=\"+\" data-filter-type=\"\" >&nbsp;+</option>
				              <option value=\"-\" data-filter-type=\"\" >&nbsp;-</option>
				              <option value=\"*\" data-filter-type=\"\" >&nbsp;*</option>
				              <option value=\"/\" data-filter-type=\"\" >&nbsp;/</option>
				          </select>
				        </fieldset>
			        </TD>
          		<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid blue;\">
			          <legend>Operando 2</legend>
			          <input type='radio' name='op2' style='margin: 10px;' value='capsula'>C&aacute;psula</input>
  							<input type='radio' name='op2' style='margin: 10px;' value='constante'>Constante</input>
			          </br>
			          <select id=\"filterCapCon2\" class=\"caps2 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon2\" class=\"caps2 caps\" style=\"width:25%;\"  title=\"Periodos\">
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante2\" style=\"margin:0px;width:80%;\" value=\"\" />
			          </fieldset>
			        </TD>
            </TR>
          </TABLE>
          
          
          <TABLE>
          	<TR>
	    				<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid black;\">
						    <legend>Comparaci\u00F3n</legend>
			          <select id=\"filterComp\" class=\"filterChooser\" style=\"width:25%;font-size: 14px;font-weight: bold;\" title=\"Comparaci\u00F3n\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Comparaci\u00F3n\ --</option>
			              <option value=\"=\" data-filter-type=\"\" >==</option>
			              <option value=\"<>\" data-filter-type=\"\" ><></option>
			              <option value=\"<=\" data-filter-type=\"\" ><=</option>
			              <option value=\">=\" data-filter-type=\"\" >>=</option>
			              <option value=\"<\" data-filter-type=\"\" ><</option>
			              <option value=\">\" data-filter-type=\"\" >></option>
			          </select>
			          </fieldset>
              </TD>
            </TR>
          </TABLE>

          
          
          <TABLE>
          	<TR>
	    				<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid red;\">
			          <legend>Operando 3</legend>
			          <input type='radio' name='op3' style='margin: 10px;' value='capsula'>C&aacute;psula</input>
  							<input type='radio' name='op3' style='margin: 10px;' value='constante'>Constante</input>
			          </br>
			          <select id=\"filterCapCon3\" class=\"caps3 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon3\" class=\"caps3 caps\" style=\"width:25%;\"  title=\"Periodos\">
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante3\" style=\"margin:0px;width:80%;\" value=\"\" />
			          </fieldset>
          		</TD>
          		<TD style=\"padding: 2px;width:10%;\">
			          <fieldset style=\"border:2px solid black;\">
			          <legend>Operaci\u00F3n</legend>
				          <select id=\"filterOpe2\" class=\"filterChooser\" style=\"width:100%;font-size: 14px;font-weight: bold;\" title=\"Operaci\u00F3n\">
				              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Op.</option>
				              <option value=\"+\" data-filter-type=\"\" >&nbsp;+</option>
				              <option value=\"-\" data-filter-type=\"\" >&nbsp;-</option>
				              <option value=\"*\" data-filter-type=\"\" >&nbsp;*</option>
				              <option value=\"/\" data-filter-type=\"\" >&nbsp;/</option>
				          </select>
				        </fieldset>
			        </TD>
          		<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid blue;\">
			          <legend>Operando 4</legend>
			          <input type='radio' name='op4' style='margin: 10px;' value='capsula'>C&aacute;psula</input>
  							<input type='radio' name='op4' style='margin: 10px;' value='constante'>Constante</input>
			          </br>
			          <select id=\"filterCapCon4\" class=\"caps4 caps\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon4\" class=\"caps4 caps\" style=\"width:25%;\"  title=\"Periodos\">
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante4\" style=\"margin:0px;width:80%;\" value=\"\" />
			          </fieldset>
			        </TD>
            </TR>
          </TABLE>
          
          <fieldset style=\"border:2px solid black;\">
			          <legend>Resultado</legend>
          <TABLE>
          	<TR>
	    				<TD style=\"padding: 2px;\">Verdadero:</TD>
	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"tval\" style=\"width:25%;\" value=\"\" /></TD>
          	</TR>
          	<TR>
	    				<TD style=\"padding: 2px;\">Falso:</TD>
	    				<TD style=\"padding: 2px;\"><input class=\"inputDialogEditor\" type=\"text\" id=\"fval\" style=\"width:25%;\" value=\"\" /></TD>
          	</TR>
          </TABLE>
          </fieldset>
          
          <fieldset style=\"border:2px solid black;\">
			          <legend>Texto</legend>
          <div id='dialogTextoId' class='contenidoEditorDialog'>
          </div>
          </fieldset>
        </form>
        </div>"
      urlInput = jQuery('input[name=url]', dialog)

      cargarTipoOperando = (tipoOp, nombreSufijo ) ->
        if tipoOp is 'capsula'
            jQuery("input:radio[name=op#{nombreSufijo}]")[0].checked = true
            jQuery("#constante#{nombreSufijo}").hide()
            jQuery(".caps#{nombreSufijo}").show()
        else
            jQuery("input:radio[name=op#{nombreSufijo}]")[1].checked = true
            jQuery("#constante#{nombreSufijo}").show()
            jQuery(".caps#{nombreSufijo}").hide()
      
      ocultarCampos = (nombreSufijo ) ->
        jQuery("input:radio[name=op#{nombreSufijo}]").on("change", ((event)->
                 if jQuery("input:radio[name=op#{nombreSufijo}]")[0].checked
                     jQuery("#constante#{nombreSufijo}").hide()
                     jQuery(".caps#{nombreSufijo}").show()
                 else
                     jQuery("#constante#{nombreSufijo}").show()
                     jQuery(".caps#{nombreSufijo}").hide()
        ));
            
      generarOperando = (nombreSufijo) ->
            if jQuery("input:radio[name=op#{nombreSufijo}]")[0].checked
                codCap = (jQuery "#filterCapCon#{nombreSufijo} option:selected").val()
                codPer = (jQuery "#filterPerCon#{nombreSufijo} option:selected").val()
                if codCap is "" or codPer is ""
                    funcion = ""
                    texto = ""
                else
                    funcion = "cap('#{codCap}','#{codPer}')"
                    texto = "[C\u00E1psula #{codCap} del Periodo #{codPer}]"
                return {
                    'dsl' : funcion
                    'txt' : texto
                    'tipo': 'capsula'
                };
            else
                return {
                    'dsl' : (jQuery "#constante#{nombreSufijo}").val()
                    'txt' : (jQuery "#constante#{nombreSufijo}").val()
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
        link = "javascript:void(0)"
        dialog.dialog('close')

        #Extrae los valores q selecciono el usr para generar el lenguaje dsl
        widget.options.editable.restoreSelection(widget.lastSelection)
        codCapsula1 = (jQuery "#filterCapCon1 option:selected").val()
        codPeriodo1 = (jQuery "#filterPerCon1 option:selected").val()
        operacion = (jQuery "#filterOpe option:selected").val()
        codCapsula2 = (jQuery "#filterCapCon2 option:selected").val()
        codPeriodo2 = (jQuery "#filterPerCon2 option:selected").val()
        
        codCapsula3 = (jQuery "#filterCapCon3 option:selected").val()
        codPeriodo3 = (jQuery "#filterPerCon3 option:selected").val()
        operacion2 = (jQuery "#filterOpe2 option:selected").val()
        codCapsula4 = (jQuery "#filterCapCon4 option:selected").val()
        codPeriodo4 = (jQuery "#filterPerCon4 option:selected").val()
        
        comparacion = (jQuery "#filterComp option:selected").val()
        constante1 = (jQuery "#constante1").val()
        constante2 = (jQuery "#constante2").val()
        constante3 = (jQuery "#constante3").val()
        constante4 = (jQuery "#constante4").val()
        
        tval = (jQuery "#tval").val()
        fval = (jQuery "#fval").val()
        
        op1f = generarOperando '1'
        op2f = generarOperando '2'
        op3f = generarOperando '3'
        op4f = generarOperando '4'
        
        #parte1 es el primer operando del operador lógico, parte2 es el...
        parte1 = false
        parte2 = false
        if op1f.tipo is "capsula" and codCapsula1 isnt ""
            parte1 = true
        if op1f.tipo is "constante" and constante1 isnt ""
            parte1 = true
            
        if op3f.tipo is "capsula" and codCapsula3 isnt ""
            parte2 = true
        if op3f.tipo is "constante" and constante3 isnt ""
            parte2 = true
        
        if parte1 and parte2
            resaltado = "conResaltadoEditor"
        else
            resaltado = "conOscuroResaltadoEditor"
        
        #widget.lastSelection.collapse(true);
        if existe
            #actualizo el los atributos del link actual
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-cap', codCapsula1)
            jQuery(nodoLink).attr('data-per', codPeriodo1)
            jQuery(nodoLink).attr('data-ope', operacion)
            jQuery(nodoLink).attr('data-cap2', codCapsula2)
            jQuery(nodoLink).attr('data-per2', codPeriodo2)
            
            jQuery(nodoLink).attr('data-cap3', codCapsula3)
            jQuery(nodoLink).attr('data-per3', codPeriodo3)
            jQuery(nodoLink).attr('data-ope2', operacion2)
            jQuery(nodoLink).attr('data-cap4', codCapsula4)
            jQuery(nodoLink).attr('data-per4', codPeriodo4)
            
            jQuery(nodoLink).attr('data-comp', comparacion)
            jQuery(nodoLink).attr('data-constante1', constante1)
            jQuery(nodoLink).attr('data-constante2', constante2)
            jQuery(nodoLink).attr('data-constante3', constante3)
            jQuery(nodoLink).attr('data-constante4', constante4)
            
            jQuery(nodoLink).attr('data-tipoOperando1', op1f.tipo)
            jQuery(nodoLink).attr('data-tipoOperando2', op2f.tipo)
            jQuery(nodoLink).attr('data-tipoOperando3', op3f.tipo)
            jQuery(nodoLink).attr('data-tipoOperando4', op4f.tipo)
            
            jQuery(nodoLink).attr('data-tval', tval)
            jQuery(nodoLink).attr('data-fval', fval)
            jQuery(nodoLink).attr('class', resaltado + " resaltadoEditor")
            jQuery(nodoLink).attr('title', "SI #{op1f.txt} #{operacion} #{op2f.txt} #{comparacion} #{op3f.txt} #{operacion2} #{op4f.txt} ENTONCES #{tval} SINO #{fval}")
            jQuery(nodoLink).attr('data-dsl', "if(#{op1f.dsl} #{operacion} #{op2f.dsl} #{comparacion} #{op3f.dsl} #{operacion2} #{op4f.dsl}, 
                '#{tval}', '#{fval}')")
        else
            #creo un link con los datos de la capsula
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"" + resaltado + " resaltadoEditor\" 
            title=\"SI #{op1f.txt} #{operacion} #{op2f.txt} #{comparacion} #{op3f.txt} #{operacion2} #{op4f.txt} ENTONCES #{tval} SINO #{fval}\" 
            data-dsl=\"if(#{op1f.dsl} #{operacion} #{op2f.dsl} #{comparacion} #{op3f.dsl} #{operacion2} #{op4f.dsl}, 
                '#{tval}', '#{fval}')\" 
            data-cap=\"#{codCapsula1}\" 
            data-per=\"#{codPeriodo1}\" 
            data-ope=\"#{operacion}\" 
            data-cap2=\"#{codCapsula2}\" 
            data-per2=\"#{codPeriodo2}\" 
            data-comp=\"#{comparacion}\" 
            
            data-cap3=\"#{codCapsula3}\" 
            data-per3=\"#{codPeriodo3}\" 
            data-ope2=\"#{operacion2}\" 
            data-cap4=\"#{codCapsula4}\" 
            data-per4=\"#{codPeriodo4}\" 
            
            data-constante1=\"#{constante1}\" 
            data-constante2=\"#{constante2}\" 
            data-constante3=\"#{constante3}\" 
            data-constante4=\"#{constante4}\" 
            
            data-tipoOperando1=\"#{op1f.tipo}\"
            data-tipoOperando2=\"#{op2f.tipo}\"
            data-tipoOperando3=\"#{op3f.tipo}\"
            data-tipoOperando4=\"#{op4f.tipo}\"
            
            data-tval=\"#{tval}\" 
            data-fval=\"#{fval}\" 
            href='#{link}'>#{texto}</a>")[0];
            widget.lastSelection.insertNode(linkNode);
        widget.options.editable.element.trigger('change')
        return false

      buttonset = jQuery "<span class=\"#{widget.widgetName}\"></span>"
      buttonize = (type) =>
        id = "#{@options.uuid}-#{type}"
        buttonHolder = jQuery '<span></span>'
        buttonHolder.hallobutton
          label: 'Condici\u00F3n'
          icon: 'condicion-button'
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
              jQuery("#borrar-button-cond").click dialogSubmitBorrar
              jQuery("#agregar-button-cond").click dialogSubmitCb
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon1');
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon2');
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon3');
              jQuery('.capselNumericas').find('option').clone().appendTo('#filterCapCon4');
              
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon1')
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon2')
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon3')
              jQuery('.periodosIndices').find('option').clone().appendTo('#filterPerCon4')
              jQuery('#filterPerCon1').val('ACT')
              jQuery('#filterPerCon2').val('ACT')
              jQuery('#filterPerCon3').val('ACT')
              jQuery('#filterPerCon4').val('ACT')
              
              jQuery('.inputNumericDialogEditor').numeric();
              
              ocultarCampos '1'
              ocultarCampos '2'
              ocultarCampos '3'
              ocultarCampos '4'
                            
              cargadosCombos = true
              
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          jQuery(".constantes").hide();
          jQuery("#dialogTextoId").html jQuery('div.editable').html()
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            jQuery("input:radio[name=op1]")[0].checked = true;
            jQuery("input:radio[name=op2]")[0].checked = true;
            jQuery("input:radio[name=op3]")[0].checked = true;
            jQuery("input:radio[name=op4]")[0].checked = true;
            
            jQuery("input:radio[name=op1]").trigger("change");
            jQuery("input:radio[name=op2]").trigger("change");
            jQuery("input:radio[name=op3]").trigger("change");
            jQuery("input:radio[name=op4]").trigger("change");
            
            jQuery(".caps").val ""
            jQuery("#filterOpe").val ""
            jQuery("#filterOpe2").val ""
            jQuery("#filterComp").val ""
            jQuery(".constantes").val ""
            jQuery("#tval").val ""
            jQuery("#fval").val ""
            existe = false
          else
            urlInput.val(jQuery(selectionParent).attr('href'))
            jQuery("#filterCapCon1").val jQuery(selectionParent).attr('data-cap')
            jQuery("#filterPerCon1").val jQuery(selectionParent).attr('data-per')
            jQuery("#filterOpe").val jQuery(selectionParent).attr('data-ope')
            jQuery("#filterCapCon2").val jQuery(selectionParent).attr('data-cap2')
            jQuery("#filterPerCon2").val jQuery(selectionParent).attr('data-per2')
            jQuery("#filterComp").val jQuery(selectionParent).attr('data-comp')
            
            jQuery("#filterCapCon3").val jQuery(selectionParent).attr('data-cap3')
            jQuery("#filterPerCon3").val jQuery(selectionParent).attr('data-per3')
            jQuery("#filterOpe2").val jQuery(selectionParent).attr('data-ope2')
            jQuery("#filterCapCon4").val jQuery(selectionParent).attr('data-cap4')
            jQuery("#filterPerCon4").val jQuery(selectionParent).attr('data-per4')
            
            jQuery("#constante1").val jQuery(selectionParent).attr('data-constante1')
            jQuery("#constante2").val jQuery(selectionParent).attr('data-constante2')
            jQuery("#constante3").val jQuery(selectionParent).attr('data-constante3')
            jQuery("#constante4").val jQuery(selectionParent).attr('data-constante4')
            
            jQuery("#tval").val jQuery(selectionParent).attr('data-tval')
            jQuery("#fval").val jQuery(selectionParent).attr('data-fval')
            
            tipoOp1 = jQuery(selectionParent).attr('data-tipoOperando1')
            tipoOp2 = jQuery(selectionParent).attr('data-tipoOperando2')
            tipoOp3 = jQuery(selectionParent).attr('data-tipoOperando3')
            tipoOp4 = jQuery(selectionParent).attr('data-tipoOperando4')
            
            cargarTipoOperando tipoOp1, '1'
            cargarTipoOperando tipoOp2, '2'
            cargarTipoOperando tipoOp3, '3'
            cargarTipoOperando tipoOp4, '4'
            	  
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
