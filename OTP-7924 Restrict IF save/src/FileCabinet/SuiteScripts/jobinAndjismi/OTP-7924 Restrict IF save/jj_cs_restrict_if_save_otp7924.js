/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*******************************************************************************************************************
 * 
 * OTP-7924: Restrict IF Save
 * 
 * Author: Jobin And Jismi IT Services
 * 
 * *****************************************************************************************************************
 * 
 * Date created: 30-September-2024
 * 
 * Description: This script is for restricting item fulfillment if customer deposit is less than the sales order amount.
 * 
 * RVISION HISTORY 1.0
 * 
 *******************************************************************************************************************
 */
define(['N/search'],
/**
 * @param{search} search
 */
function(search) {

    /**
     * Restricts the fulfillment of a Sales Order based on attached Customer Deposits.
     * This function checks if the total of any customer deposit attached to the sales order is 
     * greater than or equal to the sales order total. If the deposit is sufficient, the fulfillment proceeds; 
     * otherwise, the fulfillment is restricted.
     * 
     * @param {Object} scriptContext - The context object provided by NetSuite containing the current record.
     * @param {Object} scriptContext.currentRecord - The current record (Item Fulfillment) that is being processed.
     * 
     * @returns {boolean} - Returns `true` if the fulfillment is allowed (i.e., the customer deposit is sufficient), or `false` if the fulfillment is restricted.
     * 
     * @throws {Error} Throws an error if any issue occurs during the process, and logs the error details.
     * 
     */

    const restrictFulfill = (scriptContext) => {
        try {
            let salesOrderId = scriptContext.currentRecord.getValue({
                fieldId: "createdfrom"
            });

            console.log("sales order id: ",salesOrderId);

            let customerDepositSearch = search.create({
                type: search.Type.CUSTOMER_DEPOSIT,
                filters: [{
                    name: 'mainline',
                    operator: 'is',
                    values: ['T']
                },{
                    name: 'status',
                    operator: 'anyof',
                    values: ['CustDep:A','CustDep:B']
                },{
                    name: 'salesorder',
                    operator: 'is',
                    values: salesOrderId
                }],
                columns: ['amount']
            });

            let depositAmount = 0;

            customerDepositSearch.run().each(result => {
                let amount = result.getValue('amount');

                depositAmount += amount;

                return true;
            });

            depositAmount = parseFloat(depositAmount);

            console.log("deposit amount: ",depositAmount);

            let salesOrderAmountLookup = search.lookupFields({
                type: search.Type.SALES_ORDER,
                id: salesOrderId,
                columns: ['total']
            });

            // console.log("lookup fields: ", salesOrderAmountLookup);

            let salesOrderAmount = salesOrderAmountLookup.total;
            salesOrderAmount = parseFloat(salesOrderAmount);

            console.log("sales order amount",salesOrderAmount);

            if(depositAmount) {
                if(depositAmount >= salesOrderAmount) {
                    console.log("deposit amount greater than or equal to sales order amount");
                    return true;
                }else {
                    console.log("deposit amount is less than sales order amount");
                }
            }else {
                console.log("There is no customer deposit");
            }

            return false;
            

        } catch (error) {
            console.error(error);
            console.error(error.message);
            console.error(error.cause);

            return true;
        }
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        try {
            if(restrictFulfill(scriptContext)) {
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            console.log(error);

            return false;
        }
    }

    return {
        saveRecord: saveRecord
    };
    
});
