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
        width: 660
        height: 270
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
          <TABLE>
          	<TR>
	    				<TD style=\"padding: 2px;width:45%;\">
			          <fieldset style=\"border:2px solid red;\">
			          <legend>Operando 1</legend>
			          <input type='radio' name='op1' style='margin: 10px;' value='capsula'>C&aacute;psula</input>
  							<input type='radio' name='op1' style='margin: 10px;' value='constante'>Constante</input>
			          </br>
			          <select id=\"filterCapCon1\" class=\"caps1\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon1\" class=\"caps1\" style=\"width:20%;\"  title=\"Periodos\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Per.</option>
			              <option value=\"ACT\" data-filter-type=\"stringMatch\">ACT</option>
										<option value=\"ANT_1\" data-filter-type=\"stringMatch\">ANT_1</option>
										<option value=\"POS_1\" data-filter-type=\"stringMatch\">POS_1</option>
										<option value=\"ANT_2\" data-filter-type=\"stringMatch\">ANT_2</option>
										<option value=\"POS_2\" data-filter-type=\"stringMatch\">POS_2</option>
										<option value=\"ANT_3\" data-filter-type=\"stringMatch\">ANT_3</option>
										<option value=\"POS_3\" data-filter-type=\"stringMatch\">POS_3</option>
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante1\" style=\"width:80%;\" value=\"\" />
			          </fieldset>
          		</TD>
          		<TD style=\"padding: 2px;width:10%;\">
			          <fieldset style=\"border:2px solid black;\">
			          <legend>Operaci\u00F3n</legend>
				          <select id=\"filterOpe\" class=\"filterChooser\" style=\"width:100%;\" title=\"Operaci\u00F3n\">
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
			          <select id=\"filterCapCon2\" class=\"caps2\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon2\" class=\"caps2\" style=\"width:20%;\"  title=\"Periodos\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Per.</option>
			              <option value=\"ACT\" data-filter-type=\"stringMatch\">ACT</option>
										<option value=\"ANT_1\" data-filter-type=\"stringMatch\">ANT_1</option>
										<option value=\"POS_1\" data-filter-type=\"stringMatch\">POS_1</option>
										<option value=\"ANT_2\" data-filter-type=\"stringMatch\">ANT_2</option>
										<option value=\"POS_2\" data-filter-type=\"stringMatch\">POS_2</option>
										<option value=\"ANT_3\" data-filter-type=\"stringMatch\">ANT_3</option>
										<option value=\"POS_3\" data-filter-type=\"stringMatch\">POS_3</option>
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
			          <select id=\"filterComp\" class=\"filterChooser\" style=\"width:25%;\"  title=\"Comparaci\u00F3n\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Comparaci\u00F3n\ --</option>
			              <option value=\"=\" data-filter-type=\"\" >=</option>
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
			          <select id=\"filterCapCon3\" class=\"caps3\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon3\" class=\"caps3\" style=\"width:20%;\"  title=\"Periodos\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Per.</option>
			              <option value=\"ACT\" data-filter-type=\"stringMatch\">ACT</option>
										<option value=\"ANT_1\" data-filter-type=\"stringMatch\">ANT_1</option>
										<option value=\"POS_1\" data-filter-type=\"stringMatch\">POS_1</option>
										<option value=\"ANT_2\" data-filter-type=\"stringMatch\">ANT_2</option>
										<option value=\"POS_2\" data-filter-type=\"stringMatch\">POS_2</option>
										<option value=\"ANT_3\" data-filter-type=\"stringMatch\">ANT_3</option>
										<option value=\"POS_3\" data-filter-type=\"stringMatch\">POS_3</option>
			          </select>
			          <input class=\"inputNumericDialogEditor constantes\" type=\"text\" id=\"constante3\" style=\"margin:0px;width:80%;\" value=\"\" />
			          </fieldset>
          		</TD>
          		<TD style=\"padding: 2px;width:10%;\">
			          <fieldset style=\"border:2px solid black;\">
			          <legend>Operaci\u00F3n</legend>
				          <select id=\"filterOpe2\" class=\"filterChooser\" style=\"width:100%;\" title=\"Operaci\u00F3n\">
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
			          <select id=\"filterCapCon4\" class=\"caps4\" style=\"width:70%;\" title=\"C&aacute;psulas\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">-- Seleccione C&aacute;psula --</option>
			          </select>
			          
			          <select id=\"filterPerCon4\" class=\"caps4\" style=\"width:20%;\"  title=\"Periodos\">
			              <option value=\"\" data-filter-type=\"\" selected=\"selected\">Per.</option>
			              <option value=\"ACT\" data-filter-type=\"stringMatch\">ACT</option>
										<option value=\"ANT_1\" data-filter-type=\"stringMatch\">ANT_1</option>
										<option value=\"POS_1\" data-filter-type=\"stringMatch\">POS_1</option>
										<option value=\"ANT_2\" data-filter-type=\"stringMatch\">ANT_2</option>
										<option value=\"POS_2\" data-filter-type=\"stringMatch\">POS_2</option>
										<option value=\"ANT_3\" data-filter-type=\"stringMatch\">ANT_3</option>
										<option value=\"POS_3\" data-filter-type=\"stringMatch\">POS_3</option>
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
          
          <input type=\"submit\" style=\"margin:2px;\" id=\"dellinkButton\" value=\"Borrar\"/>
          <input type=\"submit\" style=\"margin:2px;\" value=\"#{butTitle}\"/>
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
        codCapsula1 = (jQuery "#filterCapCon1 option:selected").val()
        codPeriodo1 = (jQuery "#filterPerCon1 option:selected").val()
        operacion = (jQuery "#filterOpe option:selected").val()
        codCapsula2 = (jQuery "#filterCapCon2 option:selected").val()
        codPeriodo2 = (jQuery "#filterPerCon2 option:selected").val()
        comparacion = (jQuery "#filterComp option:selected").val()
        valcomparar = (jQuery "#valcomparar").val()
        tval = (jQuery "#tval").val()
        fval = (jQuery "#fval").val()
        
        #widget.lastSelection.collapse(true);
        if existe
            #document.execCommand "unlink", null, ""
            nodoLink = widget.lastSelection.startContainer.parentNode
            jQuery(nodoLink).attr('data-cap', codCapsula1)
            jQuery(nodoLink).attr('data-per', codPeriodo1)
            jQuery(nodoLink).attr('data-ope', operacion)
            jQuery(nodoLink).attr('data-cap2', codCapsula2)
            jQuery(nodoLink).attr('data-per2', codPeriodo2)
            jQuery(nodoLink).attr('data-comp', comparacion)
            jQuery(nodoLink).attr('data-valcomparar', valcomparar)
            jQuery(nodoLink).attr('data-tval', tval)
            jQuery(nodoLink).attr('data-fval', fval)
            jQuery(nodoLink).attr('class', "conResaltadoEditor resaltadoEditor")
            jQuery(nodoLink).attr('title', "SI [C\u00E1psula #{codCapsula1} ## Periodo #{codPeriodo1}] #{operacion} [C\u00E1psula #{codCapsula2} ## Periodo #{codPeriodo2}] #{comparacion} #{valcomparar} ENTONCES #{tval} SINO #{fval}")
            jQuery(nodoLink).attr('data-dsl', "if(cap(\'#{codCapsula1}\',\'#{codPeriodo1}\') #{operacion} cap(\'#{codCapsula2}\',\'#{codPeriodo2}\')
                #{comparacion} #{valcomparar}, \'#{tval}\', \'#{fval}\')")
        else
            texto = widget.lastSelection.extractContents().childNodes[0].nodeValue
            linkNode = jQuery("<a class=\"conResaltadoEditor resaltadoEditor\" 
            title=\"SI [C\u00E1psula #{codCapsula1} ## Periodo #{codPeriodo1}] #{operacion} [C\u00E1psula #{codCapsula2} ## Periodo #{codPeriodo2}] #{comparacion} #{valcomparar} ENTONCES #{tval} SINO #{fval}\" 
            data-dsl=\"if(cap(\'#{codCapsula1}\',\'#{codPeriodo1}\') #{operacion} cap(\'#{codCapsula2}\',\'#{codPeriodo2}\')
            #{comparacion} #{valcomparar}, \'#{tval}\', \'#{fval}\')\" 
            data-cap=\"#{codCapsula1}\" 
            data-per=\"#{codPeriodo1}\" 
            data-ope=\"#{operacion}\" 
            data-cap2=\"#{codCapsula2}\" 
            data-per2=\"#{codPeriodo2}\" 
            data-comp=\"#{comparacion}\" 
            data-valcomparar=\"#{valcomparar}\" 
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
              jQuery('.capsel').find('option').clone().appendTo('#filterCapCon1');
              jQuery('.capsel').find('option').clone().appendTo('#filterCapCon2');
              jQuery('.capsel').find('option').clone().appendTo('#filterCapCon3');
              jQuery('.capsel').find('option').clone().appendTo('#filterCapCon4');
              jQuery('.inputNumericDialogEditor').numeric();
              
              jQuery("input:radio[name=op1]").on("change", ((event)->
                 if jQuery("input:radio[name=op1]")[0].checked
                     jQuery("#constante1").hide();
                     jQuery(".caps1").removeClass("oculto");
                 else
                     jQuery("#constante1").show();
                     jQuery(".caps1").addClass("oculto");
              ));
              
              jQuery("input:radio[name=op2]").on("change", ((event)->
                 if jQuery("input:radio[name=op2]")[0].checked
                     jQuery("#constante2").hide();
                     jQuery(".caps2").removeClass("oculto");
                 else
                     jQuery("#constante2").show();
                     jQuery(".caps2").addClass("oculto");
              ));
                            
              jQuery("input:radio[name=op3]").on("change", ((event)->
                 if jQuery("input:radio[name=op3]")[0].checked
                     jQuery("#constante3").hide();
                     jQuery(".caps3").removeClass("oculto");
                 else
                     jQuery("#constante3").show();
                     jQuery(".caps3").addClass("oculto");
              ));
              
              jQuery("input:radio[name=op4]").on("change", ((event)->
                 if jQuery("input:radio[name=op4]")[0].checked
                     jQuery("#constante4").hide();
                     jQuery(".caps4").removeClass("oculto");
                 else
                     jQuery("#constante4").show();
                     jQuery(".caps4").addClass("oculto");
              ));              
              cargadosCombos = true
          widget.lastSelection = widget.options.editable.getSelection()
          urlInput = jQuery 'input[name=url]', dialog
          selectionParent = widget.lastSelection.startContainer.parentNode
          jQuery(".constantes").hide();
          unless selectionParent.href
            urlInput.val(widget.options.defaultUrl)
            jQuery("input:radio[name=op1]")[0].checked = true;
            jQuery("input:radio[name=op2]")[0].checked = true;
            jQuery("input:radio[name=op3]")[0].checked = true;
            jQuery("input:radio[name=op4]")[0].checked = true;
            jQuery("#filterCapCon1").val ""
            jQuery("#filterPerCon1").val ""
            jQuery("#filterOpe").val ""
            jQuery("#filterPerCon2").val ""
            jQuery("#filterCapCon2").val ""
            jQuery("#filterComp").val ""
            jQuery("#valcomparar").val ""
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
            jQuery("#valcomparar").val jQuery(selectionParent).attr('data-valcomparar')
            jQuery("#tval").val jQuery(selectionParent).attr('data-tval')
            jQuery("#fval").val jQuery(selectionParent).attr('data-fval')
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
