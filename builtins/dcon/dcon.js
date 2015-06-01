/**
 * Created by mschwartz on 4/10/15.
 */

var args = Array.prototype.splice.call(arguments, 1);
var contextFactory =   org.mozilla.javascript.ContextFactory.getGlobal();
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

//dim.attachTo(contextFactory);

//var factory = org.mozilla.javascript.ContextFactory.getGlobal();
//var g = new org.mozilla.javascript.tools.shell.Global();
//g.init(factory);
//console.dir(g)


//console.dir(org.mozilla.javascript.tools.shell.Main.getGlobal())
dim.setScopeProvider(IProxy(org.mozilla.javascript.tools.shell.Main.getGlobal()));

//args.shift();
global.arguments = args;
console.dir(args);
console.log('before shell main');

//java.lang.Thread.sleep(2000);

dim.setBreak();
dim.setGuiCallback({
    updateSourceText     : function (sourceInfo) {
        console.dir({ updateSourceContext : sourceInfo });
    },
    enterInterrupt        : function (lastFame, threadTitle, alertMessage) {
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
        console.dir({ dispatchNextGuiEvent : arguments })
    }
});


//org.mozilla.javascript.tools.shell.Main.exec(args);
console.log('enter context')
var ctx = contextFactory.enterContext();
ctx.setDebugger({
    run: function(cx) {
        console.dir({ run: cs })
    }
});
include(args[0])
console.log('after shell main');
//}
