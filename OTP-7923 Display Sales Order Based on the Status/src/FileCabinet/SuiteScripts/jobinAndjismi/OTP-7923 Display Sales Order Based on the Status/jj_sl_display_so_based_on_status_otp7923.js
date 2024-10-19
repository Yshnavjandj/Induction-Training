/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*******************************************************************************************************************
 * 
 * OTP-7923: Custom page for display sales order based on the status
 * 
 * Author: Jobin And Jismi IT Services
 * 
 * *****************************************************************************************************************
 * 
 * Date created: 3-October-2024
 * 
 * Description: This script is for creating a form and display sales order details in the sublist.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define(['N/ui/serverWidget','N/search','N/format'],
   /**
 * @param{format} format
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (serverWidget,search,format) => {

        /**
         * Suitelet that displays a custom sales order page with filters and a sublist showing sales orders.
         * 
         * @param {Object} scriptContext - Context of the Suitelet execution.
         * @param {Object} scriptContext.request - The HTTP request object.
         * @param {Object} scriptContext.response - The HTTP response object.
         * 
         * @returns {void} Writes the custom sales order form to the response.
         * 
         * @throws {Error} If any error occurs during the execution of the Suitelet, logs the error details.
        */

        const displaySalesOrder = (scriptContext) => {
            try {
                if(scriptContext.request.method === 'GET') {
                    
                    let form = serverWidget.createForm({
                        title: 'Sales Order Page'
                    });

                    //filters
                    let statusFilterSelect = form.addField({
                        id: 'filter_status',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Status',
                    });

                    statusFilterSelect.addSelectOption({
                        value : '',
                        text : ''
                    });
                    
                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:A',
                        text : 'Pending Approval'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:B',
                        text : 'Pending Fulfillment'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:C',
                        text : 'Cancelled'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:D',
                        text : 'Partially Fulfilled'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:E',
                        text : 'Pending Billing/Partially Fulfilled'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:F',
                        text : 'Pending Billing'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:G',
                        text : 'Billed'
                    });

                    statusFilterSelect.addSelectOption({
                        value : 'SalesOrd:H',
                        text : 'Closed'
                    });

                    form.addField({
                        id: 'filter_customer',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Customer',
                        source: 'customer'
                    });

                    form.addField({
                        id: 'filter_subsidiary',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Subsidiary',
                        source: 'subsidiary'
                    });

                    form.addField({
                        id: 'filter_departmet',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Department',
                        source: 'department'
                    });

                    //sublist columns

                    let sublist = form.addSublist({
                        id : 'so_sublist',
                        type : serverWidget.SublistType.INLINEEDITOR,
                        label : 'Sales Order'
                    });

                    sublist.addField({
                        id: 'internal_id',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Internal ID'
                    });

                    sublist.addField({
                        id: 'doc_name',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Document Name'
                    });

                    sublist.addField({
                        id: 'date',
                        type: serverWidget.FieldType.DATE,
                        label: 'Date'
                    });

                    sublist.addField({
                        id: 'status',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Status'
                    });

                    sublist.addField({
                        id: 'customer_name',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Customer Name'
                    });

                    sublist.addField({
                        id: 'subsidiary',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Subsidiary'
                    });

                    sublist.addField({
                        id: 'department',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Department'
                    });

                    sublist.addField({
                        id: 'class',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Class'
                    });

                    sublist.addField({
                        id: 'subtotal',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Subtotal'
                    });

                    sublist.addField({
                        id: 'tax',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Tax'
                    });

                    sublist.addField({
                        id: 'total',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Total'
                    });

                    form.clientScriptModulePath = './jj_cs_display_so_based_on_status_otp7923.js';

                    let searchFilters = [{
                        name: 'mainline',
                        operator: 'is',
                        values: ['T']
                    },{
                        name: 'status',
                        operator: 'is',
                        values: ['SalesOrd:B','SalesOrd:F']
                    }];

                    let salesOrderSearch = search.create({
                        type: search.Type.SALES_ORDER,
                        filters: searchFilters,
                        columns: ['internalid','tranid','trandate','status','entity','subsidiary','department','class','taxtotal','total']
                    });

                    let resultArray = salesOrderSearch.run().getRange({
                        start: 0,
                        end: 1000
                    });

                    resultArray.forEach((result,index) => {

                        sublist.setSublistValue({
                            id: 'internal_id',
                            line: index,
                            value: String(result.getValue({ name: 'internalid' }))
                        });

                        sublist.setSublistValue({
                            id: 'doc_name', 
                            line: index,
                            value: String(result.getValue({ name: 'tranid' }))
                        });

                        let filterDate = result.getValue({ name: 'trandate' });

                        let parsedDate = format.parse({
                            value: filterDate, 
                            type: format.Type.DATE
                        });

                        let formattedDateString = format.format({
                            value: parsedDate,
                            type: format.Type.DATE
                        });

                        sublist.setSublistValue({
                            id: 'date', 
                            line: index,
                            value: formattedDateString
                        });

                        sublist.setSublistValue({
                            id: 'status', 
                            line: index,
                            value: result.getText({ name: 'status' })
                        });

                        sublist.setSublistValue({
                            id: 'customer_name', 
                            line: index,
                            value: result.getText({ name: 'entity' })
                        });

                        sublist.setSublistValue({
                            id: 'subsidiary', 
                            line: index,
                            value: result.getText({ name: 'subsidiary' })
                        });

                        let dept = result.getText({ name: 'department' });

                        sublist.setSublistValue({
                            id: 'department', 
                            line: index,
                            value: `${dept ? dept : ' '}`
                        });

                        let cls = result.getText({ name: 'class' });

                        sublist.setSublistValue({
                            id: 'class', 
                            line: index,
                            value: `${cls ? cls : ' '}`
                        });

                        let taxValue = result.getValue({ name: 'taxtotal' });

                        let totalValue = result.getValue({ name: 'total' });

                        let subTotal = totalValue - taxValue;

                        let taxAmount = String(result.getValue({ name: 'taxtotal' }));

                        sublist.setSublistValue({
                            id: 'subtotal', 
                            line: index,
                            value: String(subTotal)
                        });

                        sublist.setSublistValue({
                            id: 'tax', 
                            line: index,
                            value: `${taxAmount ? taxAmount : '0.00'}`
                        });

                        sublist.setSublistValue({
                            id: 'total', 
                            line: index,
                            value: String(result.getValue({ name: 'total' }))
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
            displaySalesOrder(scriptContext);
        }

        return {onRequest}

    });
