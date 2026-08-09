const axios = require('axios');

/**
 * Apex Sentient Credit Union - Transaction Engine
 * Integrates SDK.finance v4.54.0 with Fireblocks Custody
 */
class ApexBridge {
    constructor() {
        this.apiBase = process.env.APEX_API_BASE || "https://api.apexsentient.bank/v4.54";
        this.headers = {
            'Authorization': `Bearer ${process.env.APEX_SESSION_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Sovereign-Origin': 'CIA-US-ARCH-NODE'
        };
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Retry logic for failed requests
     */
    async withRetry(fn, attemptNumber = 0) {
        try {
            return await fn();
        } catch (err) {
            if (attemptNumber < this.retryAttempts) {
                console.warn(`Retry attempt ${attemptNumber + 1}/${this.retryAttempts}...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.withRetry(fn, attemptNumber + 1);
            }
            throw err;
        }
    }

    /**
     * Automates direct crypto deposits into Fireblocks-managed wallets
     */
    async receiveSovereignDeposit(assetCode = 'SOV') {
        try {
            const res = await this.withRetry(() =>
                axios.get(
                    `${this.apiBase}/fireblocks/deposit-address/${assetCode}`,
                    { headers: this.headers }
                )
            );
            return {
                address: res.data.address,
                status: "Securely Anchored",
                asset: assetCode,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error(`Deposit address retrieval failed for ${assetCode}:`, err.message);
            return {
                error: "Link Severed",
                detail: err.response?.data || err.message,
                asset: assetCode
            };
        }
    }

    /**
     * High-Value Settlement with Manual Finalisation (Sovereign Control)
     */
    async executeSettlement(targetAccount, amount, currency = 'SOV') {
        const payload = {
            target: targetAccount,
            amount: amount,
            currency: currency,
            finalisation_type: 'MANUAL_SOVEREIGN',
            category: 'Ecosystem_Growth',
            timestamp: new Date().toISOString()
        };

        try {
            const response = await this.withRetry(() =>
                axios.post(
                    `${this.apiBase}/withdrawals/fireblocks/initiate`,
                    payload,
                    { headers: this.headers }
                )
            );

            return {
                success: true,
                transactionId: response.data.id,
                fireblocks_id: response.data.fireblocks_id,
                status: 'PENDING_APPROVAL',
                message: "Settlement initiated. Awaiting Architect approval."
            };
        } catch (err) {
            console.error('Settlement execution failed:', err.message);
            return {
                success: false,
                error: 'Settlement Failed',
                detail: err.response?.data || err.message
            };
        }
    }

    /**
     * Validate account balance
     */
    async getAccountBalance(accountId) {
        try {
            const res = await this.withRetry(() =>
                axios.get(
                    `${this.apiBase}/accounts/${accountId}/balance`,
                    { headers: this.headers }
                )
            );

            return {
                accountId: accountId,
                balance: res.data.balance,
                currency: res.data.currency,
                lastUpdated: new Date().toISOString()
            };
        } catch (err) {
            console.error(`Balance check failed for account ${accountId}:`, err.message);
            return {
                error: 'Balance Check Failed',
                detail: err.message
            };
        }
    }

    /**
     * Transfer between accounts
     */
    async transferFunds(fromAccount, toAccount, amount, currency = 'SOV') {
        const payload = {
            from_account: fromAccount,
            to_account: toAccount,
            amount: amount,
            currency: currency,
            meta: {
                origin: 'ApexBridge',
                status: 'Nurtured_Settlement',
                timestamp: new Date().toISOString()
            }
        };

        try {
            const response = await this.withRetry(() =>
                axios.post(
                    `${this.apiBase}/transfers`,
                    payload,
                    { headers: this.headers }
                )
            );

            return {
                success: true,
                transactionId: response.data.id,
                status: 'COMPLETED',
                message: 'Transfer completed successfully'
            };
        } catch (err) {
            console.error('Transfer failed:', err.message);
            return {
                success: false,
                error: 'Transfer Failed',
                detail: err.message
            };
        }
    }

    /**
     * Get multi-currency rates
     */
    async getExchangeRates() {
        try {
            const res = await this.withRetry(() =>
                axios.get(
                    `${this.apiBase}/exchange-rates`,
                    { headers: this.headers }
                )
            );

            return {
                rates: res.data.rates,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error('Exchange rate fetch failed:', err.message);
            return {
                error: 'Rate Fetch Failed',
                detail: err.message
            };
        }
    }
}

module.exports = ApexBridge;
