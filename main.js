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
    var math = require("./mathjs.js");

    //
    // Add the 'math' mode extension to the system.
    //
    Extensions.addMode({
        name: 'math'
    });

    //
    // Function:          inMathArea
    //
    // Description:       This function determines if the current node is in
    //                    a math area and is not empty.
    //
    function inMathArea(node) {
        if((node.modeContext() == "math")&&(node.text().trim()) != "") {
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
        var result = 0;
        try {
            //
            // Use the Mathjs library to evaluate the equation.
            //
           result = math.eval(str.substr(0,str.length-2));
        } catch(e) {
            //
            // Mathjs had a problem with the expressions. Return an ?
            //
            result = "?";
        }
        return(result);
    };

    //
    // Add a TreeChanged event handler to figure out when to run
    // a calculation.
    //
    Extensions.addTreeChanged(function(editor, e) {
        var deltas = e.deltas;
        for (var i = 0; i < deltas.length; i++) {
            var updatedNode = deltas[i].updatedNode;

            if (updatedNode) {
                //
                // It is an updated Node. Make sure it is in the math area.
                //
                if(inMathArea(updatedNode)) {
                    //
                    // Calculate if needed. Get the text of the line.
                    //
                    var result = updatedNode.text();

                    //
                    // See if it ends in "=>". If so, process the line.
                    //
                    if(result.substr(-2) == "=>"){
                        //
                        // See if some of the previous lines had
                        // variable declarations.
                        //
                        var loop = false;
                        var pnode = updatedNode;
                        do {
                            pnode = pnode.previousBranch();
                            if((pnode.text().search("=>") < 0) && (pnode.type() != "heading")) {
                                //
                                // We have a multiple line equation. Load it and look for more.
                                //
                                result = pnode.text() + "\n" + result;
                                loop = true;
                            } else {
                                loop = false;
                            }
                        } while(loop);

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
                        result = updatedNode.text() + " " + cresult;

                        //
                        // Update the line.
                        //
                        updatedNode.setText(result);
                    }
                }
            }
        }
    });
});