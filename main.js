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
    // Add the 'imath' mode extension to the system.
    //
    Extensions.addMode({
        name: 'imath'
    });

    //
    // Function:          inMathArea
    //
    // Description:       This function determines if the current node is in
    //                    a math area and is not empty.
    //
    function inMathArea(node) {
        if((node.modeContext() === 'imath')&&(node.text().trim() != "")) {
            return(true);
        } else {
            return(false);
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
           var lines = str.substr(0,str.length-2).split("\n");
           lines.forEach(function(line){
               var node, code;
               code = mathjs.compile(line);
               result = code.eval(scope);
           });
        } catch(e) {
            //
            // Mathjs had a problem with the expressions. Return an ?
            //
            result = "?" + " - " + e.toString();
        }
        return(result);
    };

    function ProcessPreviousNodes(node) {
        var pnode = node,
            text = "",
            result = "";
        while(pnode && (!pnode.mode()) && (pnode.modeContext() === 'imath')) {
            //
            // Not a heading, see if it has an evaluate command.
            //
            text = pnode.text();
            if(text.search("=>") < 0) {
                //
                // No evaluation, add it to the rest.
                //
                result = text + "\n" + result;
            }
            pnode = pnode.previousBranch();
        }

        return(result);
    }

    //
    // Function:      ProcessNode
    //
    // Description:   This function is used to process a node in the math
    //                context. It expects the node to be passed to it.
    //
    function ProcessNode(node) {
        //
        // Calculate if needed. Get the text of the line.
        //
        var result = node.text();

        //
        // See if it ends in "=>". If so, process the line.
        //
        if(result.substr(-2) == "=>"){
            //
            // See if some of the previous lines had
            // variable declarations.
            //
            result = ProcessPreviousNodes(node) + "\n" + result;

            //
            // See if other areas have variable definitions.
            //
            var pnode = node.parent.previousBranch();
            while(pnode) {
                if(pnode.modeContext() === 'imath') {
                    if(!editor.nodeIsHiddenInFold(pnode) && !editor.isCollapsed(pnode)) {
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
            if(isArray(cresult)){
                //
                // We will get more than on answer back. Therefore,
                // just get the last result.
                //
                cresult = cresult[cresult.length-1];
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
    // Add a TreeChanged event handler to figure out when to run
    // a calculation.
    //
    Extensions.addTreeChanged(function(editor, e) {
        var deltas = e.deltas;
        for (var i = 0; i < deltas.length; i++) {
            var updatedNode = deltas[i].updatedNode,
                insertedNodes = deltas[i].insertedNodes,
                length = 0;

            length = insertedNodes.length;
            for (var j = 0; j < length; j++) {
                var each = insertedNodes[j];
                if (inMathArea(each)) {
                    ProcessNode(each);
                }
            }

            if (updatedNode) {
                //
                // It is an updated Node. Make sure it is in the math area.
                //
                if(inMathArea(updatedNode)) {
                    //
                    // It's a math node. Process it.
                    //
                    ProcessNode(updatedNode);
                }
            }
        }
    });
});
