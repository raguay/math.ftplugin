//
// File:            main.js
//
// Description:    This file defines the math mode for FoldingText. It
//                 processes the math lines using mathjs library. The
//                 library should be in the same directory as the extension.
//
// Author:        Richard A. Guay
// Author Email:  raguay@customct.com
//
define(function(require, exports, module) {
    'use strict';

    //
    // Load the libraries I need to use.
    //
    var Extensions = require('ft/core/extensions').Extensions;
    var mathjs = require("./mathjs.js");

    //
    // Add the 'imath' mode and 'plot' mode extension to the system.
    //
    Extensions.addMode({
        name: 'imath'
    });

    Extensions.addMode({
        name: 'plot'
    })

    //
    // Function:          inMathArea
    //
    // Description:       This function determines if the current node is in
    //                    a math area and is not empty.
    //
    function inMathArea(node) {
        if ((node.modeContext() === 'imath') && (node.text().trim() != "")) {
            return (true);
        } else {
            return (false);
        }
    };

    //
    // Function:          inPlotArea
    //
    // Description:       This function determines if the current node is in
    //                    a plot area and is not empty.
    //
    function inPlotArea(node) {
        if ((node.modeContext() === 'plot') && (node.text().trim() != "")) {
            return (true);
        } else {
            return (false);
        }
    };

    //
    // Function:          Calculate
    //
    // Description:       This function get the current node and the current node's
    //                    string contents. It returns the result of the calculation.
    //
    function Calculate(str) {
        var result = 0,
            scope = {};
        try {
            //
            // Use the Mathjs library to evaluate the equation.
            //
            var lines = str.substr(0, str.length - 2).split("\n");
            lines.forEach(function(line) {
                var node, code;
                code = mathjs.compile(line);
                result = code.eval(scope);
            });
        } catch (e) {
            //
            // Mathjs had a problem with the expressions. Return an ?
            //
            result = "?" + " - " + e.toString();
        }
        return (result);
    };

    function ProcessPreviousNodes(node) {
        var pnode = node,
            text = "",
            result = "";
        while (pnode && (!pnode.mode()) && (pnode.modeContext() === 'imath')) {
            //
            // Not a heading, see if it has an evaluate command.
            //
            text = pnode.text();
            if (text.search("=>") < 0) {
                //
                // No evaluation, add it to the rest.
                //
                result = text + "\n" + result;
            }
            pnode = pnode.previousBranch();
        }

        return (result);
    }

    //
    // Function:      ProcessMathNode
    //
    // Description:   This function is used to process a node in the math
    //                context. It expects the node to be passed to it.
    //
    function ProcessMathNode(node) {
        //
        // Calculate if needed. Get the text of the line.
        //
        var result = node.text();

        //
        // See if it ends in "=>". If so, process the line.
        //
        if (result.substr(-2) == "=>") {
            //
            // See if some of the previous lines had
            // variable declarations.
            //
            result = ProcessPreviousNodes(node) + "\n" + result;

            //
            // See if other areas have variable definitions.
            //
            var pnode = node.parent.previousBranch();
            while (pnode) {
                if (pnode.modeContext() === 'imath') {
                    if (!editor.nodeIsHiddenInFold(pnode) && !editor.isCollapsed(pnode)) {
                        result = ProcessPreviousNodes(pnode.lastChild) + "\n" + result;
                    }
                }
                pnode = pnode.previousBranch();
            }

            //
            // Calculate the result. If Calculate returns an array, there were
            // variables figured in as well. Just get the final result.
            //
            var cresult = Calculate(result);
            if (isArray(cresult)) {
                //
                // We will get more than on answer back. Therefore,
                // just get the last result.
                //
                cresult = cresult[cresult.length - 1];
            }

            //
            // Put the result together with the original line.
            //
            result = node.text() + " " + cresult;

            //
            // Update the line.
            //
            node.setText(result);
        }
    };

    //
    // Function:      ProcessMathNode
    //
    // Description:   This function is used to process a node in the math
    //                context. It expects the node to be passed to it.
    //
    function ProcessPlotNode(node) {
        //
        // Calculate if needed. Get the text of the line.
        //
        var result = node.text();

    };

    //
    // Add a TreeChanged event handler to figure out when to run
    // a calculation.
    //
    Extensions.addTreeChanged(function(editor, e) {
        var deltas = e.deltas;
        for (var i = 0; i < deltas.length; i++) {
            var updatedNode = deltas[i].updatedNode,
                insertedNodes = deltas[i].insertedNodes,
                length = 0;

            //
            // Check all the inserted nodes.
            //
            length = insertedNodes.length;
            for (var j = 0; j < length; j++) {
                var each = insertedNodes[j];
                if (inMathArea(each)) {
                    //
                    // It's a math node. Process it.
                    //
                    ProcessMathNode(each);
                } else if (inPlotArea(each)) {
                    //
                    // It's a plot node. Prcess it.
                    //
                    ProcessPlotNode(each);
                }
            }

            //
            // Check the updated Nodes.
            //
            if (updatedNode) {
                //
                // It is an updated Node. Make sure it is in the math area.
                //
                if (inMathArea(updatedNode)) {
                    //
                    // It's a math node. Process it.
                    //
                    ProcessMathNode(updatedNode);
                }else if (inPlotArea(updatedNode)) {
                    //
                    // It's a plot node. Process it.
                    //
                    ProcessPlotNode(updatedNode);
                }
            }
        }
    });

    function fun1(x) {
        return Math.sin(x);
    }

    function fun2(x) {
        return Math.cos(3 * x);
    }

    function draw(canvas) {
        if (null == canvas || !canvas.getContext) return;

        var axes = {},
            ctx = canvas.getContext("2d");
        axes.x0 = .5 + .5 * canvas.width; // x0 pixels from left to x=0
        axes.y0 = .5 + .5 * canvas.height; // y0 pixels from top to y=0
        axes.scale = 40; // 40 pixels from x=0 to x=1
        axes.doNegativeX = true;

        showAxes(ctx, axes);
        funGraph(ctx, axes, fun1, "rgb(11,153,11)", 1);
        funGraph(ctx, axes, fun2, "rgb(66,44,255)", 2);
    }

    function funGraph(ctx, axes, func, color, thick) {
        var xx, yy, dx = 4,
            x0 = axes.x0,
            y0 = axes.y0,
            scale = axes.scale;
        var iMax = Math.round((ctx.canvas.width - x0) / dx);
        var iMin = axes.doNegativeX ? Math.round(-x0 / dx) : 0;
        ctx.beginPath();
        ctx.lineWidth = thick;
        ctx.strokeStyle = color;

        for (var i = iMin; i <= iMax; i++) {
            xx = dx * i;
            yy = scale * func(xx / scale);
            if (i == iMin) ctx.moveTo(x0 + xx, y0 - yy);
            else ctx.lineTo(x0 + xx, y0 - yy);
        }
        ctx.stroke();
    }

    function showAxes(ctx, axes) {
        var x0 = axes.x0,
            w = ctx.canvas.width;
        var y0 = axes.y0,
            h = ctx.canvas.height;
        var xmin = axes.doNegativeX ? 0 : x0;
        ctx.beginPath();
        ctx.strokeStyle = "rgb(128,128,128)";
        ctx.moveTo(xmin, y0);
        ctx.lineTo(w, y0); // X axis
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, h); // Y axis
        ctx.stroke();
    }
});
