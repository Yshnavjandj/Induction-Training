/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*******************************************************************************************************************
 * 
 * OTP-7876: Search through the database to find the matching blood donors
 * 
 * Author: Jobin And Jismi IT Services
 * 
 * *****************************************************************************************************************
 * 
 * Date created: 18-October-2024
 * 
 * Description: This script is for applying filters to eligilble blood donors search.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define(['N/search','N/format'],
/**
 * @param{search} search
 * @param{format} format
 */
function(search,format) {

    const applyFilters = (scriptContext) => {
        try {
            if(scriptContext.fieldId === 'custpage_jj_bld_grp' || scriptContext.fieldId === 'custpage_jj_date') {

                let currRecord = scriptContext.currentRecord;

                let bloodGroupFilter = currRecord.getValue({
                    fieldId: 'custpage_jj_bld_grp' 
                });

                let lastDonationFilter = currRecord.getValue({
                    fieldId: 'custpage_jj_date' 
                });

                let threeMonthsBefore = new Date(new Date().setMonth(new Date().getMonth() - 3));

                let parsedFilterDate;
                let formattedFilterDateString;

                let searchFilters = [];

                if(bloodGroupFilter) {
                    searchFilters.push({name: 'custrecord_jj_blood_group', operator: 'is', values: bloodGroupFilter})
                }else {
                    searchFilters = searchFilters;
                }

                if(lastDonationFilter) {
                    parsedFilterDate = format.parse({
                        value: lastDonationFilter, 
                        type: format.Type.DATE
                    });

                    formattedFilterDateString = format.format({
                        value: parsedFilterDate,
                        type: format.Type.DATE
                    });

                    if(parsedFilterDate > threeMonthsBefore) {

                        alert("Last donation date should be 3 months before!!!");
    
                        currRecord.setValue({
                            fieldId: 'custpage_jj_date',
                            value: ''
                        });

                        searchFilters.push({
                            name: 'custrecord_jj_last_donation_date',
                            operator: 'before',
                            values: format.format({
                                value: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                                type: format.Type.DATE
                            })
                        });
    
                    }else {
                        searchFilters.push({name: 'custrecord_jj_last_donation_date', operator: 'onorbefore', values: formattedFilterDateString});
                    }
                }else {
                    searchFilters.push({
                        name: 'custrecord_jj_last_donation_date',
                        operator: 'before',
                        values: format.format({
                            value: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                            type: format.Type.DATE
                        })
                    });
                }

                let lineCount = currRecord.getLineCount({
                    sublistId: 'blood_donor_sublist'
                });       

                for(let i = 0; i < lineCount; i++) {

                    currRecord.removeLine({
                        sublistId: 'blood_donor_sublist',
                        line: 0,
                        ignoreRecalc: true
                    });
                }

                console.log("search filters: ",searchFilters[0]);

                let bloodDonorSearch;

                bloodDonorSearch = search.create({
                    type: 'customrecord_jj_blood_donor_form',
                    filters: searchFilters,
                    columns: ['custrecord_jj_first_name','custrecord_jj_last_name','custrecord_jj_gender','custrecord_jj_phone_number','custrecord_jj_blood_group','custrecord_jj_last_donation_date']
                });

                let searchResult = bloodDonorSearch.run().getRange({
                    start: 0,
                    end: 10
                });

                searchResult.forEach((result) => {

                    currRecord.selectNewLine({
                        sublistId: 'blood_donor_sublist'
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'blood_donor_sublist',
                        fieldId: 'firstname',
                        value: String(result.getValue({ name: 'custrecord_jj_first_name' }))
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'blood_donor_sublist',
                        fieldId: 'lastname', 
                        value: String(result.getValue({ name: 'custrecord_jj_last_name' }))
                    });

                    let filterDate = result.getValue({ name: 'custrecord_jj_last_donation_date' });

                    let parsedDate = format.parse({
                        value: filterDate, 
                        type: format.Type.DATE
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'blood_donor_sublist',
                        fieldId: 'lastdonationdate',
                        value: parsedDate
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'blood_donor_sublist',
                        fieldId: 'gender', 
                        value: result.getValue({ name: 'custrecord_jj_gender' })
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'blood_donor_sublist',
                        fieldId: 'phone', 
                        value: result.getValue({ name: 'custrecord_jj_phone_number' })
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'blood_donor_sublist',
                        fieldId: 'bloodgroup', 
                        value: result.getValue({ name: 'custrecord_jj_blood_group' })
                    });

                    currRecord.commitLine({
                        sublistId: 'blood_donor_sublist'
                    });

                });
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
        applyFilters(scriptContext);
    }


    return {
        fieldChanged: fieldChanged,
    };
    
});
