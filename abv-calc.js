/*
 * abv-calc.js - the actual logic begind ABVCalc.
 *
 * This has been considerably re-factored to remove our dependency on jQuery
 * and generally streamline things.
 *
 * This file, along with the rest of the ABV Calculator, is licensed under
 * the MIT License - see the accompanying LICENSE file for more details.
 *
 * Copyright (C) 2014, 2023 Pete Favelle, pete@petedrinks.com
 */

// Wrap everything in a protective namespace, to hopefully avoid clashing 
// with any other code being included.
var PeteDrinksABVCalc = PeteDrinksABVCalc || {

    // Need to remember the current reader and unit options, so that we can
    // spot when it changes.
    mCurrentReader: 0,
    mCurrentUnits: 0,

    // Init function; will identify the target div and attach appropriate
    // handlers to the fields.
    init: function() {

        // Initialise the current options
        PeteDrinksABVCalc.mCurrentReader = document.querySelector( "input[name = 'pdac-reader']:checked" ).value;
        PeteDrinksABVCalc.mCurrentUnits = document.querySelector( "input[name = 'pdac-units']:checked" ).value;

        // Attach change handlers to inputs
        document.getElementById( "pdac-measured-og" ).addEventListener( "change", function(){ PeteDrinksABVCalc.GravityChange(this) } );
        document.getElementById( "pdac-measured-fg" ).addEventListener( "change", function(){ PeteDrinksABVCalc.GravityChange(this) } );
        document.getElementById( "pdac-wcf" ).addEventListener( "change", function(){ PeteDrinksABVCalc.WCFChange(this) } );

        let lUnitRadio = document.getElementsByName( "pdac-units" );
        for ( let i = 0; i < lUnitRadio.length; i++ )
        {
            lUnitRadio[i].addEventListener( "click", function(){ PeteDrinksABVCalc.UnitChange(this) } );
        }
        let lReaderRadio = document.getElementsByName( "pdac-reader" );
        for ( let i = 0; i < lReaderRadio.length; i++ )
        {
            lReaderRadio[i].addEventListener( "click", function(){ PeteDrinksABVCalc.ReaderChange(this) } );
        }
    },

    // Main calculation routine; called whenever things change
    //
    CalcABV: function() {

        // First off, we try to work out the 'calculated' OG/FG - which depends
        // on the device being used.
        const lCalcOG = document.getElementById( "pdac-calculated-og" );
        const lCalcFG = document.getElementById( "pdac-calculated-fg" );
        const lABV = document.getElementById( "pdac-calculated-abv" );

        // We'll potentially need Brix, if we need to apply refractometer fixes
        let lBrixOG = 0;
        let lBrixFG = 0;

        // When units are SG, it's (probably) a straight copy
        let lUnits = document.querySelector( "input[name = 'pdac-units']:checked" ).value;
        if ( lUnits == "SG" )
        {
            lBrixOG = PeteDrinksABVCalc.ConvertSGToBrix( document.getElementById( "pdac-measured-og" ), false );
            lBrixFG = PeteDrinksABVCalc.ConvertSGToBrix( document.getElementById( "pdac-measured-fg" ), false );

            lCalcOG.value = Number.parseFloat( document.getElementById( "pdac-measured-og" ).value ).toFixed( 3 );
            lCalcFG.value = Number.parseFloat( document.getElementById( "pdac-measured-fg" ).value ).toFixed( 3 );
        }
        else
        {
            lBrixOG = Number.parseFloat( document.getElementById( "pdac-measured-og" ).value );
            lBrixFG = Number.parseFloat( document.getElementById( "pdac-measured-fg" ).value );

            // The gravities are the same, but in SG
            lCalcOG.value = PeteDrinksABVCalc.ConvertBrixToSG( document.getElementById( "pdac-measured-og" ), false ).toFixed( 3 );
            lCalcFG.value = PeteDrinksABVCalc.ConvertBrixToSG( document.getElementById( "pdac-measured-fg" ), false ).toFixed( 3 );
        }

        // Now if we're using a refractometer there's more processing
        let lReader = document.querySelector( "input[name = 'pdac-reader']:checked" ).value;
        if ( lReader == "R" )
        {
            // Any wort correction needs to be applied to both OG and FG
            let lWCF = Number.parseFloat( document.getElementById( "pdac-wcf" ).value );
            lBrixOG = lBrixOG / lWCF;
            lBrixFG = lBrixFG / lWCF;

            // We'll need to update the calculated figures, then
            lCalcOG.value = lBrixOG;
            lCalcOG.value = PeteDrinksABVCalc.ConvertBrixToSG( lCalcOG, false ).toFixed( 3 );
            lCalcFG.value = lBrixFG;
            lCalcFG.value = PeteDrinksABVCalc.ConvertBrixToSG( lCalcFG, false ).toFixed( 3 );

            // And the final gravity needs correcting
            lCalcFG.value = ( 1.0000 - 0.0044993*lBrixOG + 0.011774*lBrixFG + 
                              0.00027581*lBrixOG*lBrixOG - 0.0012717*lBrixFG*lBrixFG -
                              0.0000072800*lBrixOG*lBrixOG*lBrixOG + 0.000063293*lBrixFG*lBrixFG*lBrixFG ).toFixed( 3 );
        }

        // Default to a blank ABV
        lABV.value = "--.--%";

        // Now, if we have good values, we can work out our ABV
        if ( lCalcOG.value >= 1 && lCalcOG.value <= 1.125 &&
             lCalcFG.value >= 1 && lCalcFG.value <= 1.125 )
        {
            lABV.value = ( ( 76.08 * ( lCalcOG.value - lCalcFG.value ) / ( 1.775 - lCalcOG.value ) ) * 
                           ( lCalcFG.value / 0.794 ) ).toFixed( 2 ) + "%";
        }

    },

    // Process the reader in use changing between Hydrometer and Refractometer
    //
    ReaderChange: function( pControl ) {

        // Clear any outstanding error messages
        PeteDrinksABVCalc.ClearError();

        // We only need to do work if the units have actually changed
        if ( pControl.value != PeteDrinksABVCalc.mCurrentReader )
        {
            // Refractometers (might) need Wort Correction Factors
            if ( pControl.value == "R" )
            {
                document.getElementById( "pdac-wcf-row" ).style.display = "block";
            }
            else
            {
                document.getElementById( "pdac-wcf-row" ).style.display = "none";
            }

            // And remember this new value.
            PeteDrinksABVCalc.mCurrentReader = pControl.value;
        }

        // Re-call the calculation routine; nothing *should* change, but...
        PeteDrinksABVCalc.CalcABV();

    },

    // Processes the units of measure being changed between SG and Brix
    //
    UnitChange: function( pControl ) {

        // Clear any outstanding error messages
        PeteDrinksABVCalc.ClearError();

        // We only need to do work if the units have actually changed
        if ( pControl.value != PeteDrinksABVCalc.mCurrentUnits )
        {
            // Convert any input values automagically
            if ( pControl.value == "Brix" )
            {
                PeteDrinksABVCalc.ConvertSGToBrix( document.getElementById( "pdac-measured-og" ), true );
                PeteDrinksABVCalc.ConvertSGToBrix( document.getElementById( "pdac-measured-fg" ), true );

            }
            else
            {
                PeteDrinksABVCalc.ConvertBrixToSG( document.getElementById( "pdac-measured-og" ), true );
                PeteDrinksABVCalc.ConvertBrixToSG( document.getElementById( "pdac-measured-fg" ), true );
            }
            // And then normalize it
            PeteDrinksABVCalc.Normalize( document.getElementById( "pdac-measured-og" ) );
            PeteDrinksABVCalc.Normalize( document.getElementById( "pdac-measured-fg" ) );

            // And remember this new value.
            PeteDrinksABVCalc.mCurrentUnits = pControl.value;
        }

        // Re-call the calculation routine; nothing *should* change, but...
        PeteDrinksABVCalc.CalcABV();

    },

    // Conversion routines; to switch between SG and Brix
    //
    ConvertSGToBrix: function( pControl, pSet ) {

        let lConvertedValue = 0;

        // Sanity check; only convert if it looks like a valid SG
        if ( pControl.value >= 1 && pControl.value <= 1.125 )
        {
            // Calculate the new value
            lConvertedValue = ( 135.997 * pControl.value * pControl.value * pControl.value ) -
                              ( 630.272 * pControl.value * pControl.value ) +
                              ( 1111.14 * pControl.value ) -
                              616.868;

            // Cap it to zero
            if ( lConvertedValue < 0 )
            {
                lConvertedValue = 0;
            }
        }

        // If requested, set the control value to this
        if ( pSet )
        {
            pControl.value = lConvertedValue;
        }

        return lConvertedValue;

    },

    ConvertBrixToSG: function( pControl, pSet ) {

        let lConvertedValue = 0;

        // Sanity check; only convert if it looks like a valid Brix
        if ( pControl.value >= 0 && pControl.value <= 30 )
        {
            // Calculate the new value
            lConvertedValue = 1.0 + ( pControl.value / ( 258.6 - ( ( pControl.value / 258.2 ) * 227.1 ) ) );
        }

        // If requested, set the control value to this
        if ( pSet )
        {
            pControl.value = lConvertedValue;
        }

        return lConvertedValue;

    },

    // Handle changes in the Original/Final Gravity fields
    //
    GravityChange: function( pControl ) {

        // Clear any outstanding error messages
        PeteDrinksABVCalc.ClearError();

        // First step, normalize the entered value taking into account the units
        // we're working in.
        PeteDrinksABVCalc.Normalize( pControl );

        // And then call the main calculation routine to do the maths!
        PeteDrinksABVCalc.CalcABV();
    },

    // And handle the Wort Correction Factor changing, too
    //
    WCFChange: function( pControl ) {

        // Clear any outstanding error messages
        PeteDrinksABVCalc.ClearError();

        // Clamp the entered value to something moderately sensible
        if ( pControl.value < 0.75 )
        {
            PeteDrinksABVCalc.Error( "WCF cannot be below 0.75", pControl.id + "-error" );
            pControl.value = 0.75;
        }
        if ( pControl.value > 1.25 )
        {
            PeteDrinksABVCalc.Error( "WCF cannot be above 1.25", pControl.id + "-error" );
            pControl.value = 1.25;
        }

        // Lastly, ensure it's to the right precision
        pControl.value = Number.parseFloat( pControl.value ).toFixed( 2 );

        // And then call the main calculation routine to do the maths!
        PeteDrinksABVCalc.CalcABV();

    },

    // Normalise a Gravity field, taking into account what units we use
    //
    Normalize: function( pControl ) {

        // So, what mode are we in - Specific Gravity, or Brix?
        let lUnits = document.querySelector( "input[name = 'pdac-units']:checked" ).value;

        // The ranges vary, obviously.
        if ( lUnits == "SG" )
        {
            // If the user has keyed a four digit value, assume the decimal
            if ( pControl.value > 999 && pControl.value < 1125 )
            {
                pControl.value = pControl.value / 1000;
            }

            // Needs to be between 1 and 1.25 (any higher and things get messy)
            if ( pControl.value < 1 )
            {
                PeteDrinksABVCalc.Error( "Input gravity cannot be below 1", pControl.id + "-error" );
                pControl.value = 1;
            }
            if ( pControl.value > 1.125 )
            {
                PeteDrinksABVCalc.Error( "Input gravity cannot exceed 1.125", pControl.id + "-error" );
                pControl.value = 1.125;
            }

            // Lastly, ensure it's to the right precision
            pControl.value = Number.parseFloat( pControl.value ).toFixed( 3 );
        }
        else
        {
            // Brix are a little easier, need to be between 0 and 30
            if ( pControl.value < 0 )
            {
                PeteDrinksABVCalc.Error( "Input brix cannot be below 0", pControl.id + "-error" );
                pControl.value = 0;
            }
            if ( pControl.value > 30 )
            {
                PeteDrinksABVCalc.Error( "Input brix cannot exceed 30.0", pControl.id + "-error" );
                pControl.value = 30;
            }

            // Lastly, ensure it's to the right precision
            pControl.value = Number.parseFloat( pControl.value ).toFixed( 1 );
        }
    },

    // Show an error message; if no location provided, use the default
    //
    Error: function( pErrorText, pErrorDiv = "pdac-err" ) {

        // Find the location to put the error.
        let lErrorDiv = document.getElementById( pErrorDiv );

        // If the error box is a row, wrap it in an internal div
        if ( lErrorDiv.classList.contains( "row" ) )
        {
            lErrorDiv.innerHTML = "<div>" + pErrorText + "</div>";
        }
        else
        {
            lErrorDiv.innerHTML = pErrorText;
        }

        // And make it visible
        lErrorDiv.style.display = "block";
    },

    // Clear all error messages; identified by the 'pdac-err' class
    ClearError: function() {
        let lErrorDivs = document.getElementsByClassName( "pdac-err" );
        for ( let i = 0; i < lErrorDivs.length; i++ )
        {
            lErrorDivs[i].style.display = "none";
        }
    }

}

// A jQuery-free ready function
if ( document.attachEvent ? document.readyState === 'complete'
                          : document.readyState !== 'loading' )
{
    PeteDrinksABVCalc.init();
}
else
{
    document.addEventListener( 'DOMContentLoaded', PeteDrinksABVCalc.init );
}
