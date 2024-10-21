/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
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
 * Description: This script is for creating a suitelet page and displaying eligible blood donors list.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define(['N/search', 'N/ui/serverWidget','N/format'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (search, serverWidget,format) => {

        /**
         *  Displays a form to search and list eligible blood donors.
         * @param {Object} scriptContext - The context in which the script is executed.
         * @param {Object} scriptContext.request - The HTTP request object.
         * @param {Object} scriptContext.response - The HTTP response object.
         *
         * @returns {void} This function does not return any value.
         *
         * @throws {Error} Will log any error that occurs during the execution of the script. 
        */

        const eligibleBloodDonorsForm = (scriptContext) => {
            try {

                if(scriptContext.request.method === 'GET') {

                    //filters
                    let form = serverWidget.createForm({
                        title: 'Eligible Blood Donors List'
                    });

                    let bloodGroup = form.addField({
                        id: 'custpage_jj_bld_grp',
                        label: 'Blood Group',
                        type: serverWidget.FieldType.SELECT
                    });

                    bloodGroup.addSelectOption({
                        value: '',
                        text: ''
                    });

                    bloodGroup.addSelectOption({
                        value: 'a_positive',
                        text: 'A+'
                    });

                    bloodGroup.addSelectOption({
                        value: 'b_positive',
                        text: 'B+'
                    });

                    bloodGroup.addSelectOption({
                        value: 'a_negative',
                        text: 'A-'
                    });

                    bloodGroup.addSelectOption({
                        value: 'b_negative',
                        text: 'B-'
                    });

                    bloodGroup.addSelectOption({
                        value: 'ab_positive',
                        text: 'AB+'
                    });

                    bloodGroup.addSelectOption({
                        value: 'ab_negative',
                        text: 'AB-'
                    });

                    bloodGroup.addSelectOption({
                        value: 'o_positive',
                        text: 'O+'
                    });

                    bloodGroup.addSelectOption({
                        value: 'o_negative',
                        text: 'O-'
                    });

                    form.addField({
                        id: 'custpage_jj_date',
                        label: 'Last Donation Date',
                        type: serverWidget.FieldType.DATE
                    });

                    //sublist
                    let sublist = form.addSublist({
                        id : 'blood_donor_sublist',
                        type : serverWidget.SublistType.INLINEEDITOR,
                        label : 'Eligible Blood Donors'
                    });

                    sublist.addField({
                        id: 'firstname',
                        type: serverWidget.FieldType.TEXT,
                        label: 'First Name'
                    });

                    sublist.addField({
                        id: 'lastname',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Last Name'
                    });

                    sublist.addField({
                        id: 'gender',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Gender'
                    });

                    sublist.addField({
                        id: 'lastdonationdate',
                        type: serverWidget.FieldType.DATE,
                        label: 'Last Donation Date'
                    });

                    sublist.addField({
                        id: 'phone',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Phone Number'
                    });

                    sublist.addField({
                        id: 'bloodgroup',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Blood Group'
                    });

                    form.clientScriptModulePath = './jj_cs_search_matching_blood_donors_otp7876.js';

                    let bloodDonorSearch = search.create({
                        type: 'customrecord_jj_blood_donor_form',
                        filters: [{
                            name: 'custrecord_jj_last_donation_date',
                            operator: 'before',
                            values: format.format({
                                value: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                                type: format.Type.DATE
                            })
                        }],
                        columns: ['custrecord_jj_first_name','custrecord_jj_last_name','custrecord_jj_gender','custrecord_jj_phone_number','custrecord_jj_blood_group','custrecord_jj_last_donation_date']
                    });

                    let searchResult = bloodDonorSearch.run().getRange({
                        start: 0,
                        end: 1000
                    });

                    // log.debug("search result: ",searchResult);

                    searchResult.forEach((result,index) => {

                        sublist.setSublistValue({
                            id: 'firstname',
                            line: index,
                            value: result.getValue({ name: 'custrecord_jj_first_name' })
                        });

                        log.debug("fn: ",result.getValue({ name: 'custrecord_jj_first_name' }));

                        sublist.setSublistValue({
                            id: 'lastname', 
                            line: index,
                            value: result.getValue({ name: 'custrecord_jj_last_name' })
                        });

                        let filterDate = result.getValue({ name: 'custrecord_jj_last_donation_date' });

                        let parsedDate = format.parse({
                            value: filterDate, 
                            type: format.Type.DATE
                        });

                        let formattedDateString = format.format({
                            value: parsedDate,
                            type: format.Type.DATE
                        });

                        sublist.setSublistValue({
                            id: 'lastdonationdate', 
                            line: index,
                            value: formattedDateString
                        });

                        sublist.setSublistValue({
                            id: 'gender', 
                            line: index,
                            value: result.getValue({ name: 'custrecord_jj_gender' })
                        });

                        sublist.setSublistValue({
                            id: 'phone', 
                            line: index,
                            value: result.getValue({ name: 'custrecord_jj_phone_number' })
                        });

                        sublist.setSublistValue({
                            id: 'bloodgroup', 
                            line: index,
                            value: result.getValue({ name: 'custrecord_jj_blood_group' })
                        });

                    });

                    scriptContext.response.writePage({
                        pageObject: form
                    });
                }
            } catch (error) {
                log.error(error);
                log.error(error.message);
                log.error(error.cause);
            }
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            eligibleBloodDonorsForm(scriptContext);
        }

        return {onRequest}

    });
