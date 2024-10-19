/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
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
 * Description: This script is for applying filters in the suitelet form.
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
function(search, format) {

    /**
     * Function to apply filters and populate a sublist with filtered Sales Orders.
     *
     * @param {Object} scriptContext - The context of the script execution.
     * @param {Object} scriptContext.currentRecord - The current record in context.
     * @param {string} scriptContext.fieldId - The ID of the field being modified.
     *
     * @throws Will throw an error if any issue occurs during execution.
     *
     * @returns {void}
     */

    const submitFilters = (scriptContext) => {
        try {
            let fieldId = scriptContext.fieldId;

            let currRecord = scriptContext.currentRecord;

            let filtersArray = ['filter_status','filter_customer','filter_subsidiary','filter_departmet'];

            if(filtersArray.includes(fieldId)) {

                let status = currRecord.getValue({ 
                    fieldId: 'filter_status' 
                });
                let customer = currRecord.getValue({
                    fieldId: 'filter_customer' 
                });
                let subsidiary = currRecord.getValue({ 
                    fieldId: 'filter_subsidiary' 
                });
                let department = currRecord.getValue({ 
                    fieldId: 'filter_departmet' 
                });

                console.log("customer: ",customer);

                let searchFilters = [{
                    name: 'mainline',
                    operator: 'is',
                    values: ['T']
                },{
                    name: 'status',
                    operator: 'is',
                    values: ['SalesOrd:B','SalesOrd:F']
                }];

                let customerFilter = {
                    name: 'internalid',
                    join: 'customer',
                    operator: 'is',
                    values: customer
                }

                let subsidiaryFilter = {
                    name: 'subsidiary',
                    operator: 'is',
                    values: subsidiary
                }

                let departmentFilter = {
                    name: 'department',
                    operator: 'is',
                    values: department
                }

                status ? searchFilters[1] = { name: 'status', operator: 'is', values: status } : searchFilters = searchFilters;
                customer ? searchFilters.push(customerFilter) : searchFilters = searchFilters;
                subsidiary ? searchFilters.push(subsidiaryFilter) : searchFilters = searchFilters;
                department ? searchFilters.push(departmentFilter) : searchFilters = searchFilters;

                console.log("search filters: ",searchFilters);

                let lineCount = currRecord.getLineCount({
                    sublistId: 'so_sublist'
                });

                console.log("line count: ",lineCount);       

                for(let i = lineCount-1; i>=0; i--) {

                    currRecord.removeLine({
                        sublistId: 'so_sublist',
                        line: i,
                        ignoreRecalc: true
                    });
                }

                let salesOrderSearch = search.create({
                    type: search.Type.SALES_ORDER,
                    filters: searchFilters,
                    columns: ['internalid','tranid','trandate','status','entity','subsidiary','department','class','amount','taxtotal','total']
                });

                let resultArray = salesOrderSearch.run().getRange({
                    start: 0,
                    end: 1000
                });
                
                resultArray.forEach((result) => {

                    currRecord.selectNewLine({
                        sublistId: 'so_sublist'
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'internal_id',
                        value: String(result.getValue({ name: 'internalid' }))
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'doc_name', 
                        value: String(result.getValue({ name: 'tranid' }))
                    });

                    let filterDate = result.getValue({ name: 'trandate' });

                    let parsedDate = format.parse({
                        value: filterDate, 
                        type: format.Type.DATE
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'date', 
                        value: parsedDate
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'status', 
                        value: result.getText({ name: 'status' })
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'customer_name', 
                        value: result.getText({ name: 'entity' })
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'subsidiary', 
                        value: result.getText({ name: 'subsidiary' })
                    });

                    let dept = result.getText({ name: 'department' });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'department', 
                        value: `${dept ? dept : ' '}`
                    });

                    let cls = result.getText({ name: 'class' });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'class', 
                        value: `${cls ? cls : ' '}`
                    });

                    let taxValue = result.getValue({ name: 'taxtotal' });

                    let totalValue = result.getValue({ name: 'total' });

                    let subTotal = totalValue - taxValue;

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'subtotal', 
                        value: String(subTotal)
                    });

                    let taxAmount = String(result.getValue({ name: 'taxtotal' }));

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'tax', 
                        value: `${taxAmount ? taxAmount : '0.00'}`
                    });

                    currRecord.setCurrentSublistValue({
                        sublistId: 'so_sublist',
                        fieldId: 'total', 
                        value: String(result.getValue({ name: 'total' }))
                    });

                    currRecord.commitLine({
                        sublistId: 'so_sublist'
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
        submitFilters(scriptContext);
    }

    return {
        fieldChanged: fieldChanged,
    };
    
});
