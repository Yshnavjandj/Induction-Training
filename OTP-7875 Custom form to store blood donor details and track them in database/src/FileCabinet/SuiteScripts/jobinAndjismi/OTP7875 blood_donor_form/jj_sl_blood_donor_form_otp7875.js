/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
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
define(['N/record','N/ui/serverWidget','N/format','N/search'],
    /**
 * @param{record} record
 */
    (record,serverWidget,format,search) => {

        /**
         * Creates a custom form
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response 
         * @returns {void} This function does not return any value
         */ 

        const bloodDonorForm = (scriptContext) => {
            try {

                if(scriptContext.request.method === 'GET') {
                    let form = serverWidget.createForm({
                        title: 'Blood Donor Form'
                    });

                    form.addField({
                        id: 'custpage_jj_fn',
                        label: 'First Name',
                        type: serverWidget.FieldType.TEXT
                    }).isMandatory = true;

                    form.addField({
                        id: 'custpage_jj_ln',
                        label: 'Last Name',
                        type: serverWidget.FieldType.TEXT
                    }).isMandatory = true;

                    let genderSelect = form.addField({
                        id: 'custpage_jj_gender',
                        label: 'Gender',
                        type: serverWidget.FieldType.SELECT
                    });

                    genderSelect.isMandatory = true;

                    form.addField({
                        id: 'custpage_jj_phone',
                        label: 'Phone Number',
                        type: serverWidget.FieldType.PHONE
                    }).isMandatory = true;

                    let bloodGroup = form.addField({
                        id: 'custpage_jj_bld_grp',
                        label: 'Blood Group',
                        type: serverWidget.FieldType.SELECT
                    });

                    bloodGroup.isMandatory = true;

                    form.addField({
                        id: 'custpage_jj_date',
                        label: 'Last Donation Date',
                        type: serverWidget.FieldType.DATE
                    }).isMandatory = true;

                    genderSelect.addSelectOption({
                        value: '',
                        text: ''
                    });

                    genderSelect.addSelectOption({
                        value: 'male',
                        text: 'Male'
                    });

                    genderSelect.addSelectOption({
                        value: 'female',
                        text: 'Female'
                    });

                    genderSelect.addSelectOption({
                        value: 'other',
                        text: 'Other'
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

                    form.addSubmitButton({
                        label: 'Submit'
                    });

                    form.clientScriptModulePath = './jj_cs_blood_donor_form_otp7875.js';

                    scriptContext.response.writePage({
                        pageObject: form
                    });

                }else {
                    let firstName = scriptContext.request.parameters.custpage_jj_fn;
                    let lastName = scriptContext.request.parameters.custpage_jj_ln;
                    let gender = scriptContext.request.parameters.custpage_jj_gender;
                    let phone = scriptContext.request.parameters.custpage_jj_phone;
                    let bloodGroup = scriptContext.request.parameters.custpage_jj_bld_grp; //custpage_jj_date
                    let date = scriptContext.request.parameters.custpage_jj_date;

                    let parsedDate = format.parse({
                        value: date,
                        type: format.Type.DATE
                    });

                    let dupeSearch = search.create({
                        type: 'customrecord_jj_blood_donor_form',
                        filters: [{
                            name: 'custrecord_jj_phone_number',
                            operator: 'is',
                            values: phone
                        }],
                        columns: ['custrecord_jj_phone_number']
                    });

                    let dupeSearchResult = dupeSearch.run().getRange({
                        start: 0,
                        end: 1
                    });

                    if(dupeSearchResult.length > 0) {

                        scriptContext.response.write({
                            output: `<h2>Can't create record. There exist a duplicate record.</h2>`
                        });

                    }else {
                        let bloodDonorRecord = record.create({
                            type: 'customrecord_jj_blood_donor_form'
                        });
    
                        bloodDonorRecord.setText({
                            fieldId: 'custrecord_jj_first_name',
                            text: firstName
                        });
    
                        bloodDonorRecord.setText({
                            fieldId: 'custrecord_jj_last_name',
                            text: lastName
                        });
    
                        bloodDonorRecord.setText({
                            fieldId: 'custrecord_jj_gender',
                            text: gender
                        });
    
                        bloodDonorRecord.setValue({
                            fieldId: 'custrecord_jj_phone_number',
                            value: phone
                        });
    
                        bloodDonorRecord.setText({
                            fieldId: 'custrecord_jj_blood_group',
                            text: bloodGroup
                        });
    
                        bloodDonorRecord.setValue({
                            fieldId: 'custrecord_jj_last_donation_date',
                            value: parsedDate
                        });
    
                        let id = bloodDonorRecord.save();
    
                        let output;
    
                        log.debug("id: ",id);
    
                        if(id) {
                            output = `<h2>Blood donor record created suceesfully.</h2>`;
                        }else {
                            output = `<h2>Blood donor record didn't created.</h2>`;
                        }
    
                        scriptContext.response.write({
                            output: output
                        });
                    }
                    
                }
            } catch (error) {
                log.error("error: ",error);
                log.error("msg: ",error.message);
                log.error("cause: ",error.cause);
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
            bloodDonorForm(scriptContext);
        }

        return {onRequest}

});
