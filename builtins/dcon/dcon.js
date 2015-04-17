/**
 * Created by mschwartz on 4/10/15.
 */

var Dim = Packages.org.mozilla.javascript.tools.debugger.Dim,
    Kit = Packages.org.mozilla.javascript.Kit,
    dim = new Dim();

//console.dir(Dim);
//console.dir(dim);

function IProxy(type, scope) {
    return new JavaAdapter(java.lang.Runnable, org.mozilla.javascript.tools.debugger.ScopeProvider, {
        type     : type,
        scope    : scope,
        run      : function () {
            if (this.type !== IProxy.EXIT_ACTION) {
                Kit.codeBug();
            }
            java.lang.System.exit(0);
        },
        getScope : function () {
            if (this.type !== IProxy.SCOPE_PROVIDER) {
                Kit.codeBug();
            }
            if (scope === null) {
                Kit.codeBug();
            }
            return scope;
        }
    });
}
decaf.extend(IProxy, {
    EXIT_ACTION    : 1,
    SCOPE_PROVIDER : 2
});


//function main() {
console.log('dcon main')
var args = Array.prototype.splice.call(arguments, 1);
dim.setBreak();
dim.setGuiCallback({
    updateSourceText     : function (sourceInfo) {
        console.dir({updateSourceContext : sourceInfo});
    },
    enterInterupt        : function (lastFame, threadTitle, alertMessage) {
        console.dir({
            enterInterrupt : true,
            lastFrame      : lastFrame,
            threadTitle    : threadTitle,
            alertMessage   : alertMessage
        });
    },
    isGuiEvent           : function () {
        return true;
    },
    dispatchNextGuiEvnet : function () {
        console.dir({dispatchNextGuiEvent : arguments})
    }
});

dim.attachTo(org.mozilla.javascript.tools.shell.Main.shellContextFactory);

//var factory = org.mozilla.javascript.ContextFactory.getGlobal();
//var g = new org.mozilla.javascript.tools.shell.Global();
//g.init(factory);
//console.dir(g)


//console.dir(org.mozilla.javascript.tools.shell.Main.getGlobal())
dim.setScopeProvider(IProxy(org.mozilla.javascript.tools.shell.Main.getGlobal()));

//args.shift();
console.dir(args);
org.mozilla.javascript.tools.shell.Main.exec(args);
console.log('after shell main')
//}