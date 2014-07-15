math.ftplugin
=============

An extension to FoldingText to do math calculations. When you add this directory to your plugins directory for [Foldingtext](http://www.foldingtext.com/), you will have the math extension. To use it, add `.math` to a header. Type in your math line ending with `=>`. When you type the `=>`, the math expression will be evaluated and added to the line.

If you have multiple lines, you can define variables. The last line with a => will be evaluated.

For example:

`
# test.math
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

g = [ 1, 2, 3]
h = [ 5, 5, 5 ]
g-h=> [-4, -3, -2]

g = [ 1, 2, 3]
h = [ 5, 5, 5 ]
g+h=> [6, 7, 8]
`

It uses the [math.js](http://mathjs.org/) library to evaluate the math.
