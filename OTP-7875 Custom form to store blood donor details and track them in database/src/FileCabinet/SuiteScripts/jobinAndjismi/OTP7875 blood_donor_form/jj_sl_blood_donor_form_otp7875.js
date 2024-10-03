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
define(['N/record','N/ui/serverWidget','N/format'],
    /**
 * @param{record} record
 */
    (record,serverWidget,format) => {

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

                    form.addField({
                        id: 'custpage_jj_gender',
                        label: 'Gender',
                        type: serverWidget.FieldType.TEXT
                    }).isMandatory = true;

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

                    log.debug("type of date: ",typeof(parsedDate));

                    let bloodDonorRecord = record.create({
                        type: 'customrecordjj_blood_donor_form'
                    });

                    bloodDonorRecord.setText({
                        fieldId: 'custrecordjj_first_name',
                        text: firstName
                    });

                    bloodDonorRecord.setText({
                        fieldId: 'custrecordjj_last_name',
                        text: lastName
                    });

                    bloodDonorRecord.setText({
                        fieldId: 'custrecordjj_gender',
                        text: gender
                    });

                    bloodDonorRecord.setValue({
                        fieldId: 'custrecordjj_phone_number',
                        value: phone
                    });

                    bloodDonorRecord.setText({
                        fieldId: 'custrecordjj_blood_group',
                        text: bloodGroup
                    });

                    bloodDonorRecord.setValue({
                        fieldId: 'custrecordjj_last_donation_date',
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
