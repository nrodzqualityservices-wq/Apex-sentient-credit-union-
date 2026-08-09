/**
 * Loyalty and Yield Calculation Engine
 * Manages affectionate reward logic based on ecosystem participation
 */
class LoyaltyEngine {
    constructor() {
        this.baseAPY = 0.02; // 2% base APY
        this.maxAPY = 0.10; // 10% maximum APY
        this.activityMultiplier = 1.0;
    }

    /**
     * Calculate dynamic APY based on activity score
     */
    calculateDynamicAPY(activityScore, holdingAmount) {
        // Activity-based yield boost
        let apy = this.baseAPY;

        if (activityScore >= 80) {
            apy = 0.05; // 5% for high activity (Legacy Tier)
        } else if (activityScore >= 60) {
            apy = 0.04; // 4% for medium-high
        } else if (activityScore >= 40) {
            apy = 0.03; // 3% for medium
        }

        // Holding amount bonus
        if (holdingAmount >= 10000) {
            apy *= 1.2; // 20% boost for 10K+ SOV
        } else if (holdingAmount >= 5000) {
            apy *= 1.1; // 10% boost for 5K+ SOV
        }

        // Cap at maximum
        return Math.min(apy, this.maxAPY);
    }

    /**
     * Calculate nurture yield boost (temporary)
     */
    calculateNurtureBoost(creatorSupport, buildActivity) {
        // 0-24 hour boost
        let boost = 0;

        if (creatorSupport > 0) {
            boost += 0.005; // 0.5% bonus for creator support
        }

        if (buildActivity > 0) {
            boost += 0.005; // 0.5% bonus for building on Merovee
        }

        return boost;
    }

    /**
     * Calculate cashback reward
     */
    calculateCashback(transactionAmount, isCreatorPayment = false) {
        let cashbackRate = 0.05; // 5% base

        if (isCreatorPayment) {
            cashbackRate = 0.075; // 7.5% for creator support
        }

        return transactionAmount * cashbackRate;
    }

    /**
     * Evaluate legacy status tier
     */
    evaluateLegacyTier(totalActivity, holdingAmount, creatorInvestment) {
        if (totalActivity >= 500 && holdingAmount >= 50000 && creatorInvestment >= 10000) {
            return {
                tier: 'ARCHITECT',
                benefits: ['Maximum APY', 'Priority Settlement', 'Custom Fee Waiving'],
                multiplier: 1.5
            };
        } else if (totalActivity >= 300 && holdingAmount >= 20000 && creatorInvestment >= 5000) {
            return {
                tier: 'GUARDIAN',
                benefits: ['High APY', 'Fast Settlement', 'Creator Discounts'],
                multiplier: 1.3
            };
        } else if (totalActivity >= 100 && holdingAmount >= 5000) {
            return {
                tier: 'LEGACY',
                benefits: ['Standard APY Boost', 'Standard Settlement'],
                multiplier: 1.1
            };
        } else {
            return {
                tier: 'SOVEREIGN',
                benefits: ['Base APY', 'Standard Features'],
                multiplier: 1.0
            };
        }
    }
}

module.exports = LoyaltyEngine;
