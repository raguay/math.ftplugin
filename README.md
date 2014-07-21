math.ftplugin
=============

An extension to FoldingText to do math calculations and keep the results in the text. When you add this directory to your plugins directory for [Foldingtext](http://www.foldingtext.com/), you have to relaunch FoldingText to get the math extension working. 

To use it, add `.imath` to a header or any line. Type in your math line(s) ending with `=>`. When you type the `=>`, the math expression will be evaluated and added to the line. If the line that has the `.imath` extension is a normal line, then your math lines will have to be indented.

Already evaluated lines will not get recalculated until the result and the space infront of it is removed. The `=>` has to be the last thing on the line for evaluation. Therefore, if you define a variable and change it, you will have to delete the last result for the expression to be re-evaluated. I did it this way so that they system is not constantly recalculating everything all the time.

**Latest Addition: July 21, 2014**
You can now define functions and use them. You can also have variables in another section. If it is folded, then that section will not be used in the calculations. If unfolded, then it will be used. Very handy for doing cases. Also, if the mathjs library gives an error, the error information is added to the result after the `?`.

Functions are defined with the `=`.

For example:

<pre>

# test.imath
1 + 1 => 2
(2 * 2)/7 => 0.5714285714285714
4 + 8 => 12
sin(50 deg) => 0.766044443118978
log(5) => 1.6094379124341003
10^log(5) => 40.68533651197375
10^1.61 => 40.73802778041128
a = 1
b = 2
c = 1
result = (b + sqrt(b^2-4*a*c))/2*a
result => 1

d = 4
e = -8
f = 1 
g = 80
m(x) = d*x^3 + e*x^2 + f*x + g
m(10) => 3290

g = [ 1, 2, 3]
h = [ 5, 5, 5 ]
g-h=> [-4, -3, -2]

g = [ 1, 2, 3]
h = [ 5, 5, 5 ]
g+h=> [6, 7, 8]

</pre>

It uses the [math.js](http://mathjs.org/) library to evaluate the math. Therefore, to know what math it can handle, please refer to the [math.js](http://mathjs.org/) library website.
