import Anomaly from '../model/Anomaly.js';
import LoginAttempt from '../model/LoginAttempt.js';
import { createSecurityAlert } from '../UTIL/securityUtils.js';

// This middleware now focuses on more sophisticated anomaly detection
// rather than duplicating the rate limiting logic
const detectAnomaly = async (req, res, next) => {
    const { identifier } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
        // We'll look for patterns that suggest automation or unusual behavior
        // but won't block login - just log anomalies for security review
        
        // Pattern 1: Rapid succession attempts (multiple attempts within seconds)
        const lastMinute = new Date(Date.now() - 60 * 1000); // Last minute
        const recentAttempts = await LoginAttempt.find({ 
            ipAddress,
            timestamp: { $gte: lastMinute }
        }).sort({ timestamp: -1 });
        
        if (recentAttempts.length >= 3) {
            // Check time between attempts
            const timeGaps = [];
            for (let i = 0; i < recentAttempts.length - 1; i++) {
                const gap = Math.abs(
                    new Date(recentAttempts[i].timestamp) - 
                    new Date(recentAttempts[i+1].timestamp)
                );
                timeGaps.push(gap);
            }
            
            // If average gap is less than 2 seconds, flag as potential automation
            const avgGap = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
            if (avgGap < 2000) { // 2 seconds
                const anomaly = new Anomaly({
                    ipAddress,
                    userAgent,
                    reason: 'Suspected automated login attempts',
                    details: {
                        attemptCount: recentAttempts.length,
                        averageGapMs: avgGap,
                        identifier
                    }
                });
                await anomaly.save();
                
                // If we have a userId, create a security alert
                if (recentAttempts[0].userId) {
                    await createSecurityAlert(recentAttempts[0].userId, 'potential_automated_attack', {
                        ipAddress,
                        userAgent,
                        attemptCount: recentAttempts.length,
                        averageGapMs: avgGap
                    });
                }
                
                // We don't block the request, just log the anomaly
                // Security team can review these patterns
            }
        }
        
        // Pattern 2: Distributed attacks (many identifiers from same IP)
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        const uniqueIdentifiers = await LoginAttempt.distinct('identifier', {
            ipAddress,
            timestamp: { $gte: fourHoursAgo },
            identifier: { $exists: true, $ne: null }
        });
        
        if (uniqueIdentifiers.length >= 5) {
            const anomaly = new Anomaly({
                ipAddress,
                userAgent,
                reason: 'Multiple accounts targeted from same IP',
                details: {
                    uniqueIdentifierCount: uniqueIdentifiers.length,
                    timeWindowHours: 4
                }
            });
            await anomaly.save();
        }
        
        // Continue to the next middleware without blocking
        next();
    } catch (error) {
        console.error('Anomaly detection error:', error);
        // Don't block the login process if anomaly detection fails
        next();
    }
};

export default detectAnomaly;