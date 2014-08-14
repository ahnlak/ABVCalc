ABVCalc
=======

A flexible Javascript ABV Calculator, for hydrometers and refractometers - 
primarily for beer brewers.

It grew out of a tool I developed for my own blog, 
[petedrinks.com](http://www.petedrinks.com/abv-calculator) but after spending
the time to track down the best formulae to use, I thought I'd share them!


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

ABVCalc uses jQuery and jQueryUI (which is required for the tab switching
between hydrometer and refractometer usage).


Usage
-----

To use the script in your own pages, simply include the `abv-calc.js`
script and the `abv-calc.css` stylesheet, and copy the 
`petedrinks-abv-calculator` div from `abv-calc.html`. This contains
two forms - one for hydrometer users, and one for refractometers.

The script will automatically add appropriate handlers to the form fields,
and applies the jQueryUI handling to wrap them into nice tabs, 
so nothing else should be necessary.

You will also need to ensure that both jQuery and jQueryUI scripts 
(along with an appropriate jQueryUI stylesheet) are also included -
again, see `abv-calc.html` for an example.


Formulae
--------

There are two fundamental operations required for the ABV Calculator. 

Firstly, we need to be able to calculate the ABV for a given original and
final gravity pair. I initially planned to use HMRC's calculation (on the
basis that the Government knows what it's doing) but it seems woefully
inaccurate - I have therefore returned to the formula I've used before:

    ABV = ( 76.08 * ( OG - FG ) / ( 1.775 - OG ) ) * ( FG / 0.794 )

This appears widely on the Internet; I seem to have first encountered it
on [brewersfriend.com] 
(http://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/).

Secondly, we need to be able to convert between Specific Gravity and Plato /
Brix. After evaluating a surprisingly wide variety of available formulae,
I've settled on the ones from [brewersfriend.com]
(http://www.brewersfriend.com/plato-to-sg-conversion-chart/). 

    SG = 1.0 + ( P / ( 258.6 - ( ( P / 258.2 ) * 227.1 ) ) )
    P = -616.868 + ( 1111.14 * SG ) - ( 630.272 * SG^2 ) + ( 135.997 * SG^3 )

They are relatively simple and, although not perfect, deliver the same 
results as more complex calculations up to gravities of 1.100 - more than 
adequate for 99+% of beers.


License
-------

This code is licensed under the MIT license. This means that you're free
to use it as you wish, as long as you credit me. See `LICENSE` for more
details.

It would be great if you could drop me a note to <pete@petedrinks.com>, or
even better leave a comment on the ABV Calculator link above.

Share And Enjoy!
