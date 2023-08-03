ABVCalc
=======

A flexible Javascript ABV Calculator, for hydrometers and refractometers - 
primarily for beer brewers.

It grew out of a tool I developed for my own blog, 
[petedrinks.com](https://www.petedrinks.com/tools/abv-calculator/) but after
spending the time to track down the best formulae to use, I thought I'd share
them!

All of this work relies on the formulae derived from people far smarter than me,
so thanks very much for all their work (and I hope I've now credited *all* my
maths sources!)


Updated August 2023
-------------------

The calculator has been rebuilt to be considerably smaller, and to remove
any dependency on things like jQuery - as well as being a lot more responsive
than it used to be.

The basic operation - and the underlying calculations - have not changed.

If you decide to upgrade, make sure you also take the updated `css` and `js`
file(s), or behaviour may be ... unexpected!


User Guide
----------

ABV calculations when using a hydrometer are fairly simple; the devices
are usually marked in SG (specific gravity), but may be marked in Plato
as well / instead. Both units are handled.

Refractometers are complicated on a number of fronts. Firstly, the alcohol
present in fermented liquor affects the reading, so it's necessary to use
both the original and current readings to calculate the *actual* final
gravity. This is why the calculator displays a "calculated final gravity"
that is significantly lower than the one you read.

Refractometers are normally marked in Brix (which, for our purposes, is 
essentially the same as Plato), but may also be marked in SG (specific
gravity). Readings in Brix will require a correction (because of the form
of sugar present in wort), which is what the 'wort correction factor' is -
if you don't know, then it's probably safest to leave it at the default
value of 1.04.

Readings in SG *probably* don't require correction, because that's done
by the manufacturer when they set it up. The calculator therefore sets
a default 'wort correction factor' of 1 when using SG values. Again, if you
aren't sure then leave it at the defaults.


Requirements
------------

ABVCalc no longer relies on any external libraries; Javascript will need to
be enabled on your browser.


Limits
------

This calculator is primarily built for brewing beer; the formulae I'm using 
become increasingly inaccurate as the level of sugar / alcohol increases. As
such, gravity readings are capped at 1.125 (SG) / 30 (Brix).

This translates to maximum ABVs of around 18%; if you're fermenting higher than
that then you're probably beyond the capabilities of this tool, and you are
using some *amazing* yeast.


Usage
-----

To use the script in your own pages, simply include the `abv-calc.js` script and
the `abv-calc.css` and `tiny-grid.min.css` stylesheets, and copy the
`pdac-panel` div from `abv-calc.html`. This form now accomodates both hydrometer
and refractometer readings in one.

The script will automatically add appropriate handlers to the form fields. No 
other action should be necessary.


Formula - ABV
-------------

We need to be able to calculate the ABV for a given original and final gravity
pair. I initially planned to use HMRC's calculation (on the basis that the
Government knows what it's doing) but it seems woefully inaccurate - I have
therefore returned to the formula I've used before:

    ABV = ( 76.08 * ( OG - FG ) / ( 1.775 - OG ) ) * ( FG / 0.794 )

This appears widely on the Internet; I seem to have first encountered it on
[brewersfriend.com] (https://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/).


Formula - Unit Conversion
-------------------------

We potentially need to be able to convert between Specific Gravity and Brix
(_Plato_). After evaluating a surprisingly wide variety of available formulae,
I've settled on the ones from
[brewersfriend.com](https://www.brewersfriend.com/plato-to-sg-conversion-chart/).

    SG = 1.0 + ( Bx / ( 258.6 - ( ( Bx / 258.2 ) * 227.1 ) ) )
    Bx = -616.868 + ( 1111.14 * SG ) - ( 630.272 * SG^2 ) + ( 135.997 * SG^3 )

They are relatively simple and, although not perfect, deliver the same 
results as more complex calculations up to gravities of 1.100 - more than 
adequate for 99+% of beers.


Formula - Refractometer FG
--------------------------

As mentioned above, when using a refractometer it's necessary to derive the
*true* final gravity from both the OG and FG readings; after a lot of poking
around, I've ended up using the excellent work of
[Sean Terrill](http://seanterrill.com/2011/04/07/refractometer-fg-results/).

    FG = 1.0000 - 0.0044993*RIi + 0.011774*RIf + 0.00027581*RIi^2 - 0.0012717*RIf^2 - 0.0000072800*RIi^3 + 0.000063293*RIf^3

Where `RIi` is the initial gravity reading, and `RIf` is the final gravity.


License
-------

This code is licensed under the MIT license. This means that you're free
to use it as you wish, as long as you credit me. See `LICENSE` for more
details.

It would be great if you could drop me a note to <pete@petedrinks.com>, or
even better leave a comment on the ABV Calculator link above.


Problems?
---------

If you encounter any issue, feel free to raise an Issue (or even a PR!)


---

Share And Enjoy!
