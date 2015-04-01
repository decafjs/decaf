/**
 * Created by mschwartz on 3/28/15.
 */

/**
 *    UI Layout Callback: resizePaneAccordions
 *
 *    This callback is used when a layout-pane contains 1 or more accordions
 *    - whether the accordion a child of the pane or is nested within other elements
 *    Assign this callback to the pane.onresize event:
 *
 *    SAMPLE:
 *    < jQuery UI 1.9: $("#elem").tabs({ show: $.layout.callbacks.resizePaneAccordions });
 *    > jQuery UI 1.9: $("#elem").tabs({ activate: $.layout.callbacks.resizePaneAccordions });
 *    $("body").layout({ center__onresize: $.layout.callbacks.resizePaneAccordions });
 *
 *    Version:    1.2 - 2013-01-12
 *    Author:        Kevin Dalman (kevin@jquery-dev.com)
 */
(function ( $ ) {
    var _ = $.layout;

// make sure the callbacks branch exists
    if ( !_.callbacks ) {
        _.callbacks = {};
    }

    _.callbacks.resizePaneAccordions = function ( x, ui ) {
        // may be called EITHER from layout-pane.onresize OR tabs.show
        var $P = ui.jquery ? ui : $(ui.newPanel || ui.panel);
        // find all VISIBLE accordions inside this pane and resize them
        $P.find(".ui-accordion:visible").each(function () {
            var $E = $(this);
            if ( $E.data("accordion") )		// jQuery < 1.9
            {
                $E.accordion("resize");
            }
            if ( $E.data("ui-accordion") )	// jQuery >= 1.9
            {
                $E.accordion("refresh");
            }
        });
    };
})(jQuery);

var Layout = {
    init: function() {
        $('body').layout({
            south__size          : 300,
            east__onresize       : $.layout.callbacks.resizePaneAccordions,
            north__resizable     : false,
            center__childOptions : {
                north__spacing_open : 0,
                north__resizable    : false,
                south__spacing_open : 0,
                south__resizable    : false
            },
            onresize             : function () {
                Sources.refresh();
            }
        });
        $(window).resize(function ( e ) {
//        control('resize ' + $('body').width() + ' x ' + $('body').height());
            layout.resizeAll();
            $('body').layout();
        });
    }
}