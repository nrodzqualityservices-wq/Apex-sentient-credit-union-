const axios = require('axios');

/**
 * Eterna AI Integration Layer
 * Provides sentiment analysis, transaction guidance, and affectionate banking logic
 */
class EternaCore {
    constructor() {
        this.apiEndpoint = process.env.ETERNA_API_ENDPOINT || 'http://localhost:8000';
        this.model = process.env.ETERNA_MODEL || 'ollama-guru';
    }

    /**
     * Check transaction intent and sentiment
     */
    async checkIntent(userId, amount) {
        try {
            const response = await axios.post(`${this.apiEndpoint}/analyze-intent`, {
                user_id: userId,
                amount: amount,
                timestamp: new Date().toISOString()
            });

            return {
                userId: userId,
                amount: amount,
                isImpulse: response.data.is_impulse || false,
                sentiment: response.data.sentiment,
                recommendation: response.data.recommendation,
                confidence: response.data.confidence
            };
        } catch (err) {
            console.warn('Eterna intent check failed, proceeding with caution:', err.message);
            return {
                userId: userId,
                amount: amount,
                isImpulse: false,
                sentiment: 'neutral',
                recommendation: 'Transaction allowed',
                confidence: 0.5
            };
        }
    }

    /**
     * Generate personalized message based on transaction
     */
    async generateMessage(userId, transactionType, metadata = {}) {
        try {
            const response = await axios.post(`${this.apiEndpoint}/generate-message`, {
                user_id: userId,
                transaction_type: transactionType,
                metadata: metadata,
                timestamp: new Date().toISOString()
            });

            return response.data.message;
        } catch (err) {
            console.warn('Message generation failed:', err.message);
            return 'Eterna: Transaction processed.';
        }
    }

    /**
     * Evaluate ecosystem activity for yield adjustments
     */
    async evaluateEcosystemActivity(userId) {
        try {
            const response = await axios.post(`${this.apiEndpoint}/ecosystem-activity`, {
                user_id: userId,
                timestamp: new Date().toISOString()
            });

            return {
                userId: userId,
                activityScore: response.data.activity_score,
                vibeStatus: response.data.vibe_status,
                yieldMultiplier: response.data.yield_multiplier,
                recommendations: response.data.recommendations
            };
        } catch (err) {
            console.warn('Ecosystem activity check failed:', err.message);
            return {
                userId: userId,
                activityScore: 0,
                vibeStatus: 'neutral',
                yieldMultiplier: 1.0,
                recommendations: []
            };
        }
    }

    /**
     * Detect anomalies (Cremation Protocol trigger)
     */
    async detectAnomaly(userId, sessionData) {
        try {
            const response = await axios.post(`${this.apiEndpoint}/detect-anomaly`, {
                user_id: userId,
                session_data: sessionData,
                timestamp: new Date().toISOString()
            });

            return {
                anomalyDetected: response.data.anomaly_detected,
                threatLevel: response.data.threat_level,
                action: response.data.recommended_action,
                message: response.data.message
            };
        } catch (err) {
            console.error('Anomaly detection failed:', err.message);
            return {
                anomalyDetected: false,
                threatLevel: 'low',
                action: 'continue',
                message: 'Monitoring active'
            };
        }
    }
}

module.exports = EternaCore;
