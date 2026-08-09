const axios = require('axios');
const ApexBridge = require('../core/sovereign-bridge');
const EternaCore = require('../core/eterna-core');

/**
 * Merchant Settlement Service
 * Automates payout processing for ecosystem creators and merchants
 */
class SettlementService {
    constructor() {
        this.apexBridge = new ApexBridge();
        this.eterna = new EternaCore();
        this.treasuryVault = process.env.TRINITY_TREASURY_VAULT || 'TRINITY_TREASURY_VAULT';
    }

    /**
     * Process merchant payout
     */
    async settleMerchantPayout(merchantId, amount, currency = 'SOV') {
        try {
            console.log(`Processing payout: ${merchantId} - ${amount} ${currency}`);

            // Validate merchant
            const merchantValid = await this.validateMerchant(merchantId);
            if (!merchantValid) {
                return {
                    success: false,
                    error: 'Invalid merchant ID'
                };
            }

            // Execute settlement
            const result = await this.apexBridge.executeSettlement(
                merchantId,
                amount,
                currency
            );

            if (result.success) {
                // Generate Eterna message
                const message = await this.eterna.generateMessage(
                    merchantId,
                    'settlement_complete',
                    { amount, currency }
                );

                return {
                    success: true,
                    transactionId: result.transactionId,
                    fireblocks_id: result.fireblocks_id,
                    message: message,
                    timestamp: new Date().toISOString()
                };
            }

            return result;
        } catch (error) {
            console.error('Settlement failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate merchant in registry
     */
    async validateMerchant(merchantId) {
        try {
            const response = await axios.get(
                `${process.env.APEX_API_BASE}/merchants/${merchantId}/validate`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.APEX_SESSION_TOKEN}`
                    }
                }
            );
            return response.data.valid === true;
        } catch (err) {
            console.warn(`Merchant validation failed for ${merchantId}:`, err.message);
            return false;
        }
    }

    /**
     * Process batch settlements
     */
    async processBatchSettlements(settlements) {
        const results = [];

        for (const settlement of settlements) {
            const result = await this.settleMerchantPayout(
                settlement.merchantId,
                settlement.amount,
                settlement.currency
            );
            results.push(result);
        }

        return results;
    }

    /**
     * Get settlement history for merchant
     */
    async getSettlementHistory(merchantId, limit = 50) {
        try {
            const response = await axios.get(
                `${process.env.APEX_API_BASE}/settlements/history/${merchantId}?limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.APEX_SESSION_TOKEN}`
                    }
                }
            );

            return {
                merchantId: merchantId,
                settlements: response.data.settlements,
                total: response.data.total
            };
        } catch (err) {
            console.error('History fetch failed:', err.message);
            return {
                error: err.message
            };
        }
    }
}

module.exports = SettlementService;
