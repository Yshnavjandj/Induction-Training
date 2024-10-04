/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*******************************************************************************************************************
 * 
 * OTP-7874: External Custom Record Form and Actions
 * 
 * Author: Jobin And Jismi IT Services
 * 
 * *****************************************************************************************************************
 * 
 * Date created: 27-September-2024
 * 
 * Description: This script is for sending email notifications to netsuite admin and sales rep if a new custom record is created.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define(['N/record','N/ui/serverWidget','N/search','N/url','N/email'],
    /**
 * @param{record} record
 */
    (record,serverWidget,search,url,email) => {

        /**
        * @param {Object} scriptContext - The context object provided by NetSuite containing the request and response objects.
        * @param {Object} scriptContext.request - The HTTP request object.
        * @param {Object} scriptContext.response - The HTTP response object.
        *
        * @returns {void} This function does not return any value.
        *
        * @throws {Error} Throws an error if any issue occurs during the process, and logs the error details.
         */

        const createCustomRecord = (scriptContext) => {
            try {

                if(scriptContext.request.method === 'GET') {
                    let form = serverWidget.createForm({
                        title: 'Customer Notification'
                    });

                    form.addField({
                        id: 'custpage_jj_name',
                        label: 'Customer Name',
                        type: serverWidget.FieldType.TEXT
                    });

                    form.addField({
                        id: 'custpage_jj_email',
                        label: 'Customer Email',
                        type: serverWidget.FieldType.EMAIL
                    }).isMandatory = true;

                    form.addField({
                        id: 'custpage_jj_subject',
                        label: 'Subject',
                        type: serverWidget.FieldType.TEXT
                    });

                    form.addField({
                        id: 'custpage_jj_msg',
                        label: 'Message',
                        type: serverWidget.FieldType.TEXTAREA
                    });

                    form.addSubmitButton({
                        label: 'Submit'
                    });

                    scriptContext.response.writePage({
                        pageObject: form
                    });

                }
                else if(scriptContext.request.method === 'POST') {

                    let cusEmail = scriptContext.request.parameters.custpage_jj_email;
                    let name = scriptContext.request.parameters.custpage_jj_name;
                    let subject = scriptContext.request.parameters.custpage_jj_subject;
                    let suiteletMessage = scriptContext.request.parameters.custpage_jj_msg;
                    
                    // search to check whther any customer with provided email id.
                    let customerSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: [{
                            name: 'email',
                            operator: 'is',
                            values: cusEmail
                        }],
                        columns: ['internalid','entityid','salesrep']
                    });

                    let searchResult = customerSearch.run().getRange({
                        start: 0,
                        end: 1
                    });

                    let selectedCustomer;
                    let customerRecordLink;

                    if(searchResult.length > 0) {
                        selectedCustomer = searchResult[0].id; //customer id

                        customerRecordLink = url.resolveRecord({
                            recordType: 'customer',
                            recordId: selectedCustomer,
                            isEditMode: true
                        });
                    }

                    // Check for duplicate record
                    let cusRecordSearch = search.create({
                        type: 'customrecord_jj_customer_notifications',
                        filters: [{
                            name: 'custrecord_jj_customer_email',
                            operator: 'is',
                            values: cusEmail
                        }],// provide email filter, because multiple custom records are possible with same customer name but email is unique.
                        columns: ['custrecord_jj_customer_email']
                    });

                    let flag = 0;

                    // In this each function no need to put 'return true' statement, because this each loop want to be iterated only one time
                    cusRecordSearch.run().each(result => {
                        let customCusEmail = result.getValue({
                            name: 'custrecord_jj_customer_email'
                        });
                        if(customCusEmail) {
                            flag = 1;
                            log.debug("Already have the same record");
                        }
                    });

                    log.debug("flag: ",flag);

                    let notification;

                    if(flag === 0) {
                        let customRecord = record.create({
                            type: 'customrecord_jj_customer_notifications' // provide internal id of custom record type.
                        });
    
                        customRecord.setValue({
                            fieldId: 'custrecord_jj_customer_name',
                            value: name
                        });
    
                        customRecord.setValue({
                            fieldId: 'custrecord_jj_customer_email',
                            value: cusEmail
                        });
    
                        customRecord.setValue({
                            fieldId: 'custrecord_jj_subject',
                            value: subject
                        });
    
                        customRecord.setValue({
                            fieldId: 'custrecord_jj_message',
                            value: suiteletMessage
                        });
    
                        if(selectedCustomer) {
                            customRecord.setValue({
                                fieldId: 'custrecord_jj_customer',
                                value: customerRecordLink
                            });
                        }

                        let newRecordId = customRecord.save();
    
                        let salesrep = searchResult.map(result => {
                            let repId = result.getValue({
                                name: 'salesrep'
                            });
                            return repId;
                        });
    
                        log.debug("rep: ",salesrep[0]);
    
                        if(newRecordId) {
                            email.send({
                                author: 7,
                                recipients: -5,
                                subject: `${subject ? subject : 'No subject'}`,
                                body: `${suiteletMessage ? suiteletMessage : 'No body'}`
                            });

                            notification = `<script>alert("Record is created. Successfully sent an email to NetSuite admin")</script><h2>Successfully sent an email to NetSuite admin</h2><div><h3>Customer name: ${name ? name : ''}</h3><h3>Customer email: ${cusEmail}</h3><h3>Subject: ${subject ? subject : ''}</h3><h3>Message: ${suiteletMessage ? suiteletMessage : ''}</h3></div>`;

                            if(salesrep[0] && salesrep[0] !== -5) {

                                email.send({
                                    author: 7,
                                    recipients: salesrep[0],
                                    subject: `${subject ? subject : 'No subject'}`,
                                    body: `${suiteletMessage ? suiteletMessage : 'No body'}`
                                });

                                notification = `<script>alert("Record is created. Successfully sent an email to NetSuite admin")</script><h2>Successfully sent an email to NetSuite admin and sales rep</h2><div><h3>Customer name: ${name ? name : ''}</h3><h3>Customer email: ${cusEmail ? cusEmail : ''}</h3><h3>Subject: ${subject ? subject : ''}</h3><h3>Message: ${suiteletMessage ? suiteletMessage : ''}</h3></div>`;
                                
                            }
                        }
                    }else {
                        notification = `<script>alert("Can't create new record. Already have the same custom record")</script><h2>!!! Can't create new record. Already have the same custom record !!!</h2>`;
                    }

                    scriptContext.response.write({
                        output: notification
                    });
                    
                }
                
            } catch (error) {
                log.error("error: ",error);
                log.error("message: ",error.message);
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
            createCustomRecord(scriptContext);
        }

        return {onRequest}

    });
