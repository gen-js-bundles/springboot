package <%=gen.package%>;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class <%=gen.name%> {


<%
each(current.tags.web.paths, function(path, pathUri) {
  each(path.methods, function(method, methodHttp) {
    var paramsStr = "";
    var first = true;
    each(method.params, function(param, paramName) {
      if(first) {first = false;} else {paramsStr += ', ';}
      if(param.requestParam) {
        var hasArg = false;
        paramsStr += '@RequestParam(';
        if(param.requestParam.value != null) {
          if(!hasArg) {hasArg=true;} else {paramsStr += ', ';}
          paramsStr += 'value="'+param.requestParam.value+'"';
        }
        if(param.requestParam.required != null) {
            if(!hasArg) {hasArg=true;} else {paramsStr += ', ';}
            paramsStr += 'required='+param.requestParam.required;
        }
        if(param.requestParam.defaultValue != null) {
            if(!hasArg) {hasArg=true;} else {paramsStr += ', ';}
            paramsStr += 'defaultValue="'+param.requestParam.defaultValue+'"';
        }
        paramsStr += ') ';
      }
      paramsStr += param.type + ' ' + paramName;
    })
%>
    @RequestMapping("<%=pathUri%>")
    public <%=method.return%> <%=method.name%>(<%=paramsStr%>) { // <[<%=method.name%>:
        model.addAttribute("name", name);
        return "greeting";
    } // ]>


<%})
})%>
}