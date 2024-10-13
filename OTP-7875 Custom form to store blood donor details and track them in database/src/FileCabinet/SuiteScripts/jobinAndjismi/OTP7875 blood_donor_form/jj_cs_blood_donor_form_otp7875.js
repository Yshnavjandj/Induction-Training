/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*******************************************************************************************************************
 * 
 * OTP-7875: Custom form to store blood donor details and track them in database
 * 
 * Author: Jobin And Jismi IT Services
 * 
 * *****************************************************************************************************************
 * 
 * Date created: 30-September-2024
 * 
 * Description: This script is for creating custom form to record blood donor details in NetSuite database.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define([],

function() {

    /**
     * Safely sets the field value and prevents the recursive call to fieldChanged.
     * @param {Object} scriptContext
     * @param {string} fieldId - The field that needs to be updated
     * @param {any} value - The value to set
     * @returns {void}
     */

    const isFieldChanged = (scriptContext,fieldId,value) => {
        try {
            if(!scriptContext.currentRecord._bool) {

                scriptContext.currentRecord._bool = true

                alert("Enter a valid phone number.");

                scriptContext.currentRecord.setValue({
                    fieldId: fieldId,
                    value: value
                });

                scriptContext.currentRecord._bool = false;
            }
        } catch (error) {
            console.error(error);
        }
    }

    // let isChanged = false;

     /**
     * Creates a custom form
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.currentRecord - Incoming request
     * @param {string} scriptContext.fieldId - Field name
     * @returns {void} This function does not return any value
     */

    const restrictFutureDate = (scriptContext) => {
        try {

            if(scriptContext.fieldId === 'custpage_jj_date') {

                let today = new Date();

                let selectedDate = scriptContext.currentRecord.getValue({
                    fieldId: 'custpage_jj_date'
                });

                if(selectedDate > today) {

                    alert("Future date cannot be entered.");

                    scriptContext.currentRecord.setValue({
                        fieldId: 'custpage_jj_date',
                        value: ''
                    });
                }
            }

            if(scriptContext.fieldId === 'custpage_jj_phone') {

                let phoneNumber = scriptContext.currentRecord.getValue({
                    fieldId: 'custpage_jj_phone'
                });

                if(phoneNumber.length !== 10) {

                    isFieldChanged(scriptContext,'custpage_jj_phone','');

                    let ph = scriptContext.currentRecord.getValue({
                        fieldId: 'custpage_jj_phone'
                    });

                    console.log("phone number: ",ph);
                }
            }
        } catch (error) {
            console.error(error);
            console.error(error.message);
            console.error(error.cause);
        }
    }
    

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try {
            restrictFutureDate(scriptContext);
        } catch (error) {
            console.error(error);
        }
    }

    return {
        fieldChanged: fieldChanged
    };
    
});
