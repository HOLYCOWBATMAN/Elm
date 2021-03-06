
Elm.Native.Show = function(elm) {
    'use strict';

    elm.Native = elm.Native || {};
    if (elm.Native.Show) return elm.Native.Show;

    var NList = Elm.Native.List(elm);
    var List = Elm.List(elm);
    var Maybe = Elm.Maybe(elm);
    var JS = Elm.JavaScript(elm);
    var Dict = Elm.Dict(elm);
    var Json = Elm.Json(elm);
    var Tuple2 = Elm.Native.Utils(elm).Tuple2;

    var toString = function(v) {
        if (typeof v === "function") {
            var name = v.func ? v.func.name : v.name;
            return '<function' + (name === '' ? '' : ': ') + name + '>';
        } else if (typeof v === "boolean") {
            return v ? "True" : "False";
        } else if (typeof v === "number") {
            return v+"";
        } else if (typeof v === "string" && v.length < 2) {
            return "'" + showChar(v) + "'";
        } else if (typeof v === "object" && '_' in v) {
            var output = [];
            for (var k in v._) {
                for (var i = v._[k].length; i--; ) {
                    output.push(k + " = " + toString(v._[k][i]));
                }
            }
            for (var k in v) {
                if (k === '_') continue;
                output.push(k + " = " + toString(v[k]));
            }
            if (output.length === 0) return "{}";
            return "{ " + output.join(", ") + " }";
        } else if (typeof v === "object" && 'ctor' in v) {
            if (v.ctor.substring(0,6) === "_Tuple") {
                var output = [];
                for (var k in v) {
                    if (k === 'ctor') continue;
                    output.push(toString(v[k]));
                }
                return "(" + output.join(",") + ")";
            } else if (v.ctor === "::") {
                var isStr = typeof v._0 === "string",
                start = isStr ? '"' : "[",
                end   = isStr ? '"' : "]",
                sep   = isStr ?  "" : ",",
                f     = !isStr ? toString : showChar;
                var output = start + f(v._0);
                v = v._1;
                while (v.ctor === "::") {
                    output += sep + f(v._0);
                    v = v._1;
                }
                return output + end;
            } else if (v.ctor === "[]") {
                return "[]";
            } else if (v.ctor === "RBNode" || v.ctor === "RBEmpty") {
                var cons = F3(function(k,v,acc){return NList.Cons(Tuple2(k,v),acc)});
                var list = A3(Dict.foldr, cons, NList.Nil, v);
                var name = "Dict";
                if (list.ctor === "::" && list._0._1.ctor === "_Tuple0") {
                    name = "Set";
                    list = A2(List.map, function(x){return x._0}, list);
                }
                return name + ".fromList " + toString(list);
            } else {
                var output = "";
                for (var i in v) {
                    if (i === 'ctor') continue;
                    var str = toString(v[i]);
                    var parenless = str[0] === '{' || str[0] === '<' || str.indexOf(' ') < 0;
                    output += ' ' + (parenless ? str : '(' + str + ')');
                }
                return v.ctor + output;
            }
        }
        if (typeof v === 'object' && 'recv' in v) return '<signal>';
        return "<internal structure>";
    };
    function show(v) { return NList.fromArray(toString(v)); }

    function showChar (c) {
        return c === '\n' ? '\\n' :
               c === '\t' ? '\\t' :
               c === '\b' ? '\\b' :
               c === '\r' ? '\\r' :
               c === '\v' ? '\\v' :
               c === '\0' ? '\\0' :
               c === '\'' ? "\\'" :
               c === '\"' ? '\\"' :
               c === '\\' ? '\\\\' : c;
    }

    return elm.Native.Show = { show:show };
};
