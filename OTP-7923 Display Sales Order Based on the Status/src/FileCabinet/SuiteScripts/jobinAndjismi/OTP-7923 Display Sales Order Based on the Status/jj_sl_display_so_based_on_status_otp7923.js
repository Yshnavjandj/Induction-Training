/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/ui/serverWidget','N/search'],
    /**
 * @param{record} record
 */
    (record,serverWidget,search) => {

        const displaySalesOrder = (scriptContext) => {
            try {
                if(scriptContext.request.method === 'GET') {
                    let form = serverWidget.createForm({
                        title: 'Sales Order Page'
                    });

                    //filters
                    form.addField({
                        id: 'filter_status',
                        type: serverWidget.Type.SELECT,
                        label: 'Status',
                        source: 'transactionstatus'
                    });

                    form.addField({
                        id: 'filter_customer',
                        type: serverWidget.Type.SELECT,
                        label: 'Customer',
                        source: 'entity'
                    });

                    form.addField({
                        id: 'filter_subsidiary',
                        type: serverWidget.Type.SELECT,
                        label: 'Subsidiary',
                        source: 'subsidiary'
                    });

                    form.addField({
                        id: 'filter_departmet',
                        type: serverWidget.Type.SELECT,
                        label: 'Department',
                        source: 'department'
                    });

                    //sublist columns

                    let sublist = form.addSublist({
                        id : 'so_sublist',
                        type : serverWidget.SublistType.LIST,
                        label : 'Sales Order'
                    });

                    let internalId = sublist.addField({
                        id: 'internal_id',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Internal ID'
                    });

                    let docName = sublist.addField({
                        id: 'doc_name',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Document Name'
                    });

                    let date = sublist.addField({
                        id: 'date',
                        type: serverWidget.FieldType.DATE,
                        label: 'Date'
                    });

                    let status = sublist.addField({
                        id: 'status',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Status'
                    });

                    let customerName = sublist.addField({
                        id: 'customer_name',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Customer Name'
                    });

                    let subsidiary = sublist.addField({
                        id: 'subsidiary',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Subsidiary'
                    });

                    let department = sublist.addField({
                        id: 'dpartment',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Department'
                    });

                    let class_ = sublist.addField({
                        id: 'class',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Class'
                    });

                    let subTotal = sublist.addField({
                        id: 'subtotal',
                        type: serverWidget.FieldType.FLOAT,
                        label: 'Subtotal'
                    });

                    let tax = sublist.addField({
                        id: 'tax',
                        type: serverWidget.FieldType.FLOAT,
                        label: 'Tax'
                    });

                    let total = sublist.addField({
                        id: 'total',
                        type: serverWidget.FieldType.FLOAT,
                        label: 'Total'
                    });

                    scriptContext.response.writePage({
                        pageObject: form
                    });

                }
                else {

                    let statusFilter = scriptContext.request.parameters.filter_status;
                    let customerFilter = scriptContext.request.parameters.filter_customer;
                    let subsidiaryFilter = scriptContext.request.parameters.filter_subsidiary;
                    let departmentFilter = scriptContext.request.parameters.filter_department;

                    let salesOrderSearch = search.create({
                        type: search.Type.SALES_ORDER,
                        filters: [{
                            name: 'mainline',
                            operator: 'is',
                            values: ['T']
                        }],
                        columns: ['internalid','tranid','trandate','status','entity','subsidiary','department','class','amount','taxtotal','total']
                    });

                    let searchObject = {};

                    salesOrderSearch.run().each(result => {
                        // let subtotal = result.getValue('amount');

                        searchObject.internalId = result.getValue('internalid');
                        searchObject.docName = result.getValue('tranid');
                        searchObject.date = result.getValue('trandate');
                        searchObject.status = result.getText('status');
                        searchObject.customer = result.getText('entity');
                        searchObject.subsidiary = result.getText('subsidiary');
                        searchObject.department = result.getText('department');
                        searchObject.class = result.getText('class');
                        searchObject.subtotal = result.getValue('amount');
                        searchObject.tax = result.getValue('taxtotal');
                        searchObject.total = result.getValue('total');

                        sublist.setSublistValue({
                            id: ''
                        })

                        log.debug("search object: ",searchObject);

                        return true;
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
