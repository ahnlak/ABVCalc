/*
 * abv-calc.js - the actual logic begind ABVCalc.
 *
 * This file, along with the rest of the ABV Calculator, is licensed under
 * the MIT License - see the accompanying LICENSE file for more details.
 *
 * Copyright (C) 2014 Pete Favelle, pete@petedrinks.com
 */

// Wrap everything in a protective namespace, to hopefully avoid clashing 
// with any other code being included.
var PeteDrinksABVCalc = PeteDrinksABVCalc || {

    // Internal variable to keep track of the div containing all our forms -
    // this is so that we can run jQuery selectors in a more localised way,
    // just in case there are name clashes elsewhere on the page.
    mFormDiv: 0,

    // Init function; will identify the target div and attach appropriate
    // handlers to the fields.
    init: function() {

        // Find the div to work on, save it for later
        PeteDrinksABVCalc.mFormDiv = jQuery( "div#petedrinks-abv-calculator" );

        // Can only attach handlers if we found the div!
        if ( PeteDrinksABVCalc.mFormDiv.length > 0 ) {

            // Activate the tabs
            PeteDrinksABVCalc.mFormDiv.tabs();

            // Set up our required handlers - hydrometer first
            jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.HydroOGChange );
            jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.HydroFGChange );
            jQuery( "select#pdac-h-units", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.HydroUnitChange );

            // And now the equivalent refractometer ones
            jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.RefractOGChange );
            jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.RefractFGChange );
            jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.RefractWCChange );
            jQuery( "select#pdac-r-units", PeteDrinksABVCalc.mFormDiv ).change( PeteDrinksABVCalc.RefractUnitChange );
        }
    },

    // Handler for a new Hydrometer OG value
    HydroOGChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();

        // Need to know if we're in SG or Plato mode
        var sg_mode = ( jQuery( "select#pdac-h-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" );

        // Normalise the value
        var normalised;
        var normalised_sg;
        var final_sg;
        if ( sg_mode ) {
            normalised = PeteDrinksABVCalc.NormaliseSG( 
                jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv )
            );
            normalised_sg = normalised;
            final_sg = jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val();
        } else {
            normalised = PeteDrinksABVCalc.NormalisePlato( 
                jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv )
            );
            normalised_sg = PeteDrinksABVCalc.PlatoToSG( normalised );
            final_sg = PeteDrinksABVCalc.PlatoToSG( jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val() );
            jQuery( "span#pdac-h-calc-og", PeteDrinksABVCalc.mFormDiv ).text( normalised_sg );
        }
        jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val( normalised );

        // And then see if we have values for both
        if ( ( normalised_sg > 0 ) && ( final_sg > 0 ) ) {
            jQuery( "input#pdac-h-result", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.SGToABV( normalised_sg, final_sg ) );
        }
    },

    // Handler for a new Hydrometer FG value
    HydroFGChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();

        // Need to know if we're in SG or Plato mode
        var sg_mode = ( jQuery( "select#pdac-h-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" );

        // Normalise the value
        var normalised;
        var original_sg;
        var normalised_sg;

        if ( sg_mode ) {
            normalised = PeteDrinksABVCalc.NormaliseSG( 
                jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv )
            );
            original_sg = jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val();
            normalised_sg = normalised;
        } else {
            normalised = PeteDrinksABVCalc.NormalisePlato( 
                jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv )
            );
            original_sg = PeteDrinksABVCalc.PlatoToSG( jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val() );
            normalised_sg = PeteDrinksABVCalc.PlatoToSG( normalised );
            jQuery( "span#pdac-h-calc-fg", PeteDrinksABVCalc.mFormDiv ).text( normalised_sg );
        }
        jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val( normalised );

        // And then see if we have values for both
        if ( ( original_sg > 0 ) && ( normalised_sg > 0 ) ) {
            jQuery( "input#pdac-h-result", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.SGToABV( original_sg, normalised_sg ) );
        }
    },

    // Handler for changing hydrometer units
    HydroUnitChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();
        var original_sg;
        var final_sg;

        if ( jQuery( "select#pdac-h-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" ) {
            // Convert any existing Plato to SG
            var original_plato = jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val();
            var final_plato = jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val();
            if ( original_plato > 0 ) {
                original_sg = PeteDrinksABVCalc.PlatoToSG( original_plato );
                jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val( original_sg );
            }
            if ( final_plato > 0 ) {
                final_sg = PeteDrinksABVCalc.PlatoToSG( final_plato );
                jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val( final_sg );
            }
            jQuery( "span.pdac-h-sg", PeteDrinksABVCalc.mFormDiv ).hide();
        } else {
            // Convert any existing SG to Plato 
            original_sg = jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val();
            final_sg = jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val();
            if ( original_sg > 0 ) {
                jQuery( "span#pdac-h-calc-og", PeteDrinksABVCalc.mFormDiv ).text( original_sg );
                jQuery( "input#pdac-h-og", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.SGToPlato( original_sg ) );
            }
            if ( final_sg > 0 ) {
                jQuery( "span#pdac-h-calc-fg", PeteDrinksABVCalc.mFormDiv ).text( final_sg );
                jQuery( "input#pdac-h-fg", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.SGToPlato( final_sg ) );
            }
            jQuery( "span.pdac-h-sg", PeteDrinksABVCalc.mFormDiv ).show();
        }

        // And then see if we have values for both
        if ( ( original_sg > 0 ) && ( final_sg > 0 ) ) {
            jQuery( "input#pdac-h-result", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.SGToABV( original_sg, final_sg ) );
        }
    },

    // Handler for changing the refractor original gravity
    RefractOGChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();

        var sg_mode = ( jQuery( "select#pdac-r-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" );

        // Normalise the value
        var normalised;
        var normalised_brix;
        var final_brix;
        var wcf;
        if ( sg_mode ) {
            normalised = PeteDrinksABVCalc.NormaliseSG( 
                jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv )
            );
            normalised_brix = PeteDrinksABVCalc.SGToPlato( normalised );
            final_brix = PeteDrinksABVCalc.SGToPlato( jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val() );
        } else {
            normalised = PeteDrinksABVCalc.NormalisePlato( 
                jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv )
            );
            jQuery( "span#pdac-r-calc-og", PeteDrinksABVCalc.mFormDiv ).text( PeteDrinksABVCalc.PlatoToSG( normalised ) );
            normalised_brix = normalised;
            final_brix = jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val();
        }
        wcf = jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).val();
        jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val( normalised );

        // Attempt to calculate anything we can
        PeteDrinksABVCalc.RefractCalc( normalised_brix, final_brix, wcf );
    },

    // Handler for changing the refractor final gravity
    RefractFGChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();

        var sg_mode = ( jQuery( "select#pdac-r-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" );

        // Normalise the value
        var normalised;
        var normalised_brix;
        var original_brix;
        var wcf;
        if ( sg_mode ) {
            normalised = PeteDrinksABVCalc.NormaliseSG( 
                jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv )
            );
            normalised_brix = PeteDrinksABVCalc.SGToPlato( normalised );
            original_brix = PeteDrinksABVCalc.SGToPlato( jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val() );
        } else {
            normalised = PeteDrinksABVCalc.NormalisePlato( 
                jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val(),
                jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv )
            );
            jQuery( "span#pdac-r-calc-fg", PeteDrinksABVCalc.mFormDiv ).text( PeteDrinksABVCalc.PlatoToSG( normalised ) );
            normalised_brix = normalised;
            original_brix = jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val();
        }
        wcf = jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).val();
        jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val( normalised );

        // Attempt to calculate anything we can
        PeteDrinksABVCalc.RefractCalc( original_brix, normalised_brix, wcf );
    },

    // Handler for changing the refractor wort correction factor
    RefractWCChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();

        var sg_mode = ( jQuery( "select#pdac-r-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" );

        // Check that the WCF is vaguely sensible (say 0.5 < wcf < 1.5)
        var wcf = Number( jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).val() );
        if ( ( wcf < 0.5 ) || ( wcf > 1.5 ) ) {
            PeteDrinksABVCalc.Error( "Invalid Wort Correction Factor provided<br>Please enter values 0.50-1.50" );
            jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).focus();
            return;
        }

        // Get the original/final gravities
        var original_brix;
        var final_brix;
        if ( sg_mode ) {
            original_brix = PeteDrinksABVCalc.SGToPlato( jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val() );
            final_brix = PeteDrinksABVCalc.SGToPlato( jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val() );
        } else {
            original_brix = jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val();
            final_brix = jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val();
        }

        // Attempt to calculate anything we can
        PeteDrinksABVCalc.RefractCalc( original_brix, final_brix, wcf );
    },

    // Handler for changing the refractor units
    RefractUnitChange: function() {

        // Clear any errors
        PeteDrinksABVCalc.ClearError();
        var original_brix;
        var final_brix;
        var wcf = jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).val();

        if ( jQuery( "select#pdac-r-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" ) {
            // Convert any existing brix to SG
            original_brix = jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val();
            final_brix = jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val();
            if ( original_brix > 0 ) {
                original_sg = PeteDrinksABVCalc.PlatoToSG( original_brix );
                jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val( original_sg );
            }
            if ( final_brix > 0 ) {
                final_sg = PeteDrinksABVCalc.PlatoToSG( final_brix );
                jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val( final_sg );
            }
            jQuery( "span.pdac-r-sg", PeteDrinksABVCalc.mFormDiv ).hide();

            // If the WCF hasn't been changed from the default, switch it
            if ( wcf == 1.04 ) {
                wcf = 1.0;
                jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).val( wcf );
            }
        } else {
            // Convert any existing SG to Brix
            original_sg = jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val();
            final_sg = jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val();
            if ( original_sg > 0 ) {
                original_brix = PeteDrinksABVCalc.SGToPlato( original_sg );
                jQuery( "span#pdac-r-calc-og", PeteDrinksABVCalc.mFormDiv ).text( original_sg );
                jQuery( "input#pdac-r-og", PeteDrinksABVCalc.mFormDiv ).val( original_brix );
            }
            if ( final_sg > 0 ) {
                final_brix = PeteDrinksABVCalc.SGToPlato( final_sg );
                jQuery( "span#pdac-r-calc-fg", PeteDrinksABVCalc.mFormDiv ).text( final_sg );
                jQuery( "input#pdac-r-fg", PeteDrinksABVCalc.mFormDiv ).val( final_brix );
            }
            jQuery( "span.pdac-r-sg", PeteDrinksABVCalc.mFormDiv ).show();

            // If the WCF hasn't been changed from the default, switch it
            if ( wcf == 1.0 ) {
                wcf = 1.04;
                jQuery( "input#pdac-r-wc", PeteDrinksABVCalc.mFormDiv ).val( wcf );
            }
        }

        // Attempt to calculate anything we can
        PeteDrinksABVCalc.RefractCalc( original_brix, final_brix, wcf );
    },

    // Perform all the calculations for refractometer stuff
    RefractCalc: function( original_brix, final_brix, wcf ) {

        var corrected_og = 0;
        var corrected_fg = 0;
        var calc_fg = 0;
        var sg_mode = ( jQuery( "select#pdac-r-units", PeteDrinksABVCalc.mFormDiv ).val() == "sg" );

        // If we have OG figures, perform that calculation
        if ( ( original_brix > 0 ) && ( wcf > 0 ) ) {
            corrected_og = PeteDrinksABVCalc.WortCorrect( original_brix, wcf );
            if ( sg_mode ) {
                jQuery( "input#pdac-r-cog", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.PlatoToSG( corrected_og ) );
            } else {
                jQuery( "input#pdac-r-cog", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.NormalisePlato( corrected_og ) );
                jQuery( "span#pdac-r-calc-cog", PeteDrinksABVCalc.mFormDiv ).text( PeteDrinksABVCalc.PlatoToSG( corrected_og ) );
            }

            // Ditto to the FG figures
            if ( final_brix > 0 ) {
                corrected_fg = PeteDrinksABVCalc.WortCorrect( final_brix, wcf );
                calc_fg = PeteDrinksABVCalc.RefractFinal( corrected_og, corrected_fg );
                if ( sg_mode ) {
                    jQuery( "input#pdac-r-cfg", PeteDrinksABVCalc.mFormDiv ).val( calc_fg );
                } else {
                    jQuery( "input#pdac-r-cfg", PeteDrinksABVCalc.mFormDiv ).val( PeteDrinksABVCalc.SGToPlato( calc_fg ) );
                    jQuery( "span#pdac-r-calc-cfg", PeteDrinksABVCalc.mFormDiv ).text( calc_fg );
                }

                // And if we have both, do the ABV sums too!
                jQuery( "input#pdac-r-result", PeteDrinksABVCalc.mFormDiv ).val( 
                    PeteDrinksABVCalc.SGToABV( 
                        PeteDrinksABVCalc.PlatoToSG( corrected_og ), calc_fg
                    ) 
                );
            }
        }
    },

    // Convert from Plato to SG
    PlatoToSG: function( plato ) {
        var result = 1.0 + ( plato / ( 258.6 - ( ( plato / 258.2 ) * 227.1 ) ) );
        return PeteDrinksABVCalc.NormaliseSG( result );
    },

    // Convert from SG to Plato
    SGToPlato: function( sg ) {
        var result = -616.868 + ( 1111.14 * sg ) - ( 630.272 * sg * sg ) + ( 135.997 * sg * sg * sg );
        return PeteDrinksABVCalc.NormalisePlato( result );
    },

    // Convert all manner of versions of SG to something normal
    NormaliseSG: function( sg, field ) {
        var sg_val = Number( sg );
        var ret_val = sg_val;

        // Process the different formats folks might use
        if ( sg_val > 1000 ) {
            // Simple SGs without a decimal point
            ret_val = ( sg_val / 1000.0 ).toFixed(3);
        } else if ( sg_val > 2 ) {
            // Also need to handle brewer's points
            ret_val = ( 1 + ( sg_val / 1000.0 ) ).toFixed(3);
        } else if ( sg_val > 1 ) {
            // Sounds like the 1.nnn form then
            ret_val = sg_val.toFixed(3);
        } else {
            // Some sort of invalid format that we can't make sense of; if we can, tell them
            if ( field != undefined ) {
                PeteDrinksABVCalc.Error( "Invalid Specific Gravity provided<br>Please enter values 1.001-1.999" );
                field.focus();
                ret_val = sg;
            }
        }
        return ret_val;
    },

    // Do a similar job for odd Plato formats
    NormalisePlato: function( plato, field ) {
        var plato_val = Number( plato );

        // Just need to sanity check; plato *really* needs to be between 1 and 100!
        if ( ( ( plato_val < 1 ) || ( plato_val > 99 ) ) && ( field != undefined ) ) {
            PeteDrinksABVCalc.Error( "Invalid Brix provided<br>Please enter values 1-99" );
            field.focus();
            return plato;
        }

        return plato_val.toFixed(1);
    },

    // Calculate ABV
    SGToABV: function( sg, fg ) {
        // First off, we need the difference
        var diff = sg - fg;

        // Check that the figures are the right way aroundf
        if ( diff < 0 ) {
            PeteDrinksABVCalc.Error( "Final Gravity must be lower than Original!" );
            return "-.-%";
        }

        // Use the more complex (and more accurate) formula
        // ABV =(76.08 * (og-fg) / (1.775-og)) * (fg / 0.794)
        var abv = ( 76.08 * ( sg - fg ) / ( 1.775 - sg ) ) * ( fg / 0.794 );
        return abv.toFixed( 2 ) + "%";
    },

    // Generate a corrected OG from an initial Brix refractometer reading
    WortCorrect: function( brix, wcf ) {
        return brix / wcf;
    },

    // Generate a final gravity, given start and end Brix refractometer figures
    // Uses the following rather horrific calculation:
    // FG = 1.0000 - 0.0044993*RIi + 0.011774*RIf + 0.00027581*RIi^2 - 0.0012717*RIf^2 - 0.0000072800*RIi^3 + 0.000063293*RIf^3
    RefractFinal: function( obrix, fbrix ) {
        var final = 1.000 - ( 0.004493 * obrix ) + ( 0.011774 * fbrix )
                  + ( 0.00027581 * obrix * obrix ) - ( 0.0012717 * fbrix * fbrix )
                  - ( 0.00000728 * obrix * obrix * obrix ) + ( 0.000063293 * fbrix * fbrix * fbrix );
        return final.toFixed(3);
    },

    // Error reporting; best to tell the user when something's up!
    Error: function( errmsg ) {
        jQuery( "div#pdac-err", PeteDrinksABVCalc.mFormDiv ).html( errmsg );
        jQuery( "div#pdac-err", PeteDrinksABVCalc.mFormDiv ).show();
    },

    ClearError: function() {
        jQuery( "div#pdac-err", PeteDrinksABVCalc.mFormDiv ).hide();
    }
}

jQuery( document ).ready( function() {
    PeteDrinksABVCalc.init();
});
