/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/*******************************************************************************************************************
 * 
 * OTP-7873: Identify change in Address
 * 
 * Author: Jobin And Jismi IT Services
 * 
 * *****************************************************************************************************************
 * 
 * Date created: 30-September-2024
 * 
 * Description: This script is for identifying whether a new address is added or existing address is changed.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {

        /**
         * Checks whether the address is changed or new address is added and check or uncheck the custom box accordingly.
         * @param {Object} scriptContext 
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @return {Boolean} returns true or false
         */

        const checkBox = (scriptContext) => {
            try {
                if(scriptContext.type === 'edit') {
                    let oldRecord = scriptContext.oldRecord;
                    let newRecord = scriptContext.newRecord;

                    let oldLineCount = oldRecord.getLineCount({
                        sublistId: 'addressbook'
                    });

                    let newLineCount = newRecord.getLineCount({
                        sublistId: 'addressbook'
                    });

                    if(oldLineCount !== newLineCount) {
                        newRecord.setValue({
                            fieldId: 'custentity_jj_address_box',
                            value: true
                        });
                    }else {
                        for(let i = 0; i < oldLineCount; i++) {
                            let oldAddress = oldRecord.getSublistText({
                                sublistId: 'addressbook',
                                fieldId: 'addressbookaddress_text',
                                line: i
                            });
        
                            let newAddress = newRecord.getSublistText({
                                sublistId: 'addressbook',
                                fieldId: 'addressbookaddress_text',
                                line: i
                            });

                            if(oldAddress !== newAddress) {
                                newRecord.setValue({
                                    fieldId: 'custentity_jj_address_box',
                                    value: true
                                });
                                break;
                            }
                        }
                    }

                    log.debug("old address: ",addrOld);
                    log.debug("new address: ",addrNew);
                }
            } catch (error) {
                log.debug(error);
                log.debug(error.message);
                log.debug(error.cause);
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            checkBox(scriptContext);
        }

        return {
            beforeSubmit
        }

    });
