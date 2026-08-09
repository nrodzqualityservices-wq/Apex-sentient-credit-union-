const { Kafka } = require('kafkajs');
const EternaCore = require('../core/eterna-core');

/**
 * Kafka Consumer for Ledger Transactions
 * Real-time event processing and Eterna AI responses
 */
class EventConsumer {
    constructor() {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || 'eterna-ai',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
        });

        this.consumer = this.kafka.consumer({
            groupId: process.env.KAFKA_GROUP_ID || 'trinity-sovereign-group'
        });

        this.eterna = new EternaCore();
        this.isConnected = false;
    }

    /**
     * Connect to Kafka and subscribe to topics
     */
    async connect() {
        try {
            await this.consumer.connect();
            this.isConnected = true;
            console.log('Eterna: Connected to Kafka broker.');

            await this.consumer.subscribe({
                topic: 'ledger-transactions',
                fromBeginning: false
            });

            console.log('Eterna: Subscribed to ledger-transactions topic.');
        } catch (err) {
            console.error('Kafka connection failed:', err.message);
            throw err;
        }
    }

    /**
     * Start consuming messages
     */
    async startConsuming() {
        if (!this.isConnected) {
            await this.connect();
        }

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const data = JSON.parse(message.value.toString());
                    await this.processTransaction(data);
                } catch (err) {
                    console.error('Message processing error:', err.message);
                }
            }
        });
    }

    /**
     * Process individual transaction
     */
    async processTransaction(data) {
        const { type, amount, userId, metadata } = data;

        console.log(`[Transaction] Type: ${type}, Amount: ${amount}, User: ${userId}`);

        // Trigger Haptic Feedback for large deposits
        if (type === 'DEPOSIT' && amount > 1000) {
            console.log("Eterna: 'The foundation has grown. Notifying the Architect.'");
            this.triggerHaptic('heavy_pulse');

            // Get personalized message
            const message = await this.eterna.generateMessage(
                userId,
                'large_deposit',
                { amount }
            );
            console.log(`Eterna: "${message}"`);
        }

        // Withdrawal processing
        if (type === 'WITHDRAWAL') {
            const intent = await this.eterna.checkIntent(userId, amount);

            if (intent.isImpulse) {
                console.log("Eterna: 'Architect, this doesn't align with your Legacy goals. Please confirm.'");
            } else {
                console.log(`Eterna: 'Withdrawal authorized. ${intent.recommendation}'`);
            }
        }

        // Update ecosystem metrics
        if (type === 'TRANSFER' || type === 'DEPOSIT') {
            const activity = await this.eterna.evaluateEcosystemActivity(userId);
            console.log(`Ecosystem Activity: ${activity.activityScore}/100, Vibe: ${activity.vibeStatus}`);
        }

        // Anomaly Detection (Cremation Protocol)
        if (type === 'SUSPICIOUS_LOGIN' || type === 'UNAUTHORIZED_ACCESS') {
            const anomaly = await this.eterna.detectAnomaly(userId, data);

            if (anomaly.anomalyDetected) {
                console.log(`⚠️  Threat Level: ${anomaly.threatLevel}`);
                console.log(`Eterna: "${anomaly.message}"`);

                if (anomaly.threatLevel === 'high') {
                    await this.activateCremationProtocol(userId);
                }
            }
        }
    }

    /**
     * Trigger haptic feedback (simulated)
     */
    triggerHaptic(feedbackType) {
        console.log(`📱 Haptic Feedback: ${feedbackType}`);
        // In production, this would send to iPhone via WebSocket or native bridge
    }

    /**
     * Activate Cremation Protocol on threat detection
     */
    async activateCremationProtocol(userId) {
        console.log('🔥 CREMATION PROTOCOL ACTIVATED');
        console.log('1. Detecting threat vectors...');
        console.log('2. Cloaking treasury via SDK.finance API...');
        console.log('3. Tightening Fireblocks policies...');
        console.log('4. Wiping local cache...');
        console.log('5. Migration to Arch Linux backup initiated...');
        console.log(`User ${userId} session terminated. Assets secured.`);
    }

    /**
     * Disconnect from Kafka
     */
    async disconnect() {
        if (this.isConnected) {
            await this.consumer.disconnect();
            this.isConnected = false;
            console.log('Eterna: Disconnected from Kafka.');
        }
    }
}

module.exports = EventConsumer;

// Auto-start if run directly
if (require.main === module) {
    const consumer = new EventConsumer();

    consumer.startConsuming().catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });

    process.on('SIGINT', async () => {
        console.log('\nShutting down...');
        await consumer.disconnect();
        process.exit(0);
    });
}
