import Anomaly from '../model/Anomaly.js';
import LoginAttempt from '../model/LoginAttempt.js';
import { createSecurityAlert } from '../UTIL/securityUtils.js';

const detectAnomaly = async (req, res, next) => {
    console.log('Running anomaly detection middleware');
    const { identifier } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
        console.log(`Checking anomalies for IP: ${ipAddress}, identifier: ${identifier}`);
        
        // Pattern 1: Rapid succession attempts (automated tool detection)
        const lastMinute = new Date(Date.now() - 60 * 1000);
        const recentAttempts = await LoginAttempt.find({ 
            ipAddress,
            timestamp: { $gte: lastMinute }
        }).sort({ timestamp: -1 });
        
        console.log(`Found ${recentAttempts.length} recent attempts from this IP in the last minute`);
        
        if (recentAttempts.length >= 3) {
            // Calculate time gaps between successive attempts
            const timeGaps = [];
            for (let i = 0; i < recentAttempts.length - 1; i++) {
                const gap = Math.abs(
                    new Date(recentAttempts[i].timestamp) - 
                    new Date(recentAttempts[i+1].timestamp)
                );
                timeGaps.push(gap);
            }
            
            const avgGap = timeGaps.length > 0 
                ? timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length 
                : 0;
                
            console.log(`Average gap between attempts: ${avgGap}ms`);
            
            // If average gap is less than 2 seconds, likely automated
            if (avgGap < 2000) {
                console.log('ANOMALY DETECTED: Suspected automated login attempts');
                
                // Create an anomaly record
                const anomaly = new Anomaly({
                    ipAddress,
                    userAgent,
                    identifier,
                    reason: 'Suspected automated login attempts',
                    severity: avgGap < 1000 ? 'high' : 'medium',
                    details: {
                        attemptCount: recentAttempts.length,
                        averageGapMs: avgGap,
                        timeframe: '60 seconds',
                        patterns: 'Consistent timing between attempts'
                    }
                });
                
                // Add userId if available
                if (recentAttempts[0].userId) {
                    anomaly.userId = recentAttempts[0].userId;
                }
                
                await anomaly.save();
                console.log('Anomaly saved to database with ID:', anomaly._id);
                
                // Create security alert if we have a userId
                if (recentAttempts[0].userId) {
                    await createSecurityAlert(recentAttempts[0].userId, 'potential_automated_attack', {
                        ipAddress,
                        userAgent,
                        attemptCount: recentAttempts.length,
                        averageGapMs: avgGap,
                        anomalyId: anomaly._id
                    });
                    console.log('Security alert created for user ID:', recentAttempts[0].userId);
                }
                
                // You can choose to block the request here or add to req object to handle in controller
                req.detectedAnomaly = {
                    type: 'automated_attempts',
                    severity: anomaly.severity,
                    anomalyId: anomaly._id
                };
            }
        }
        
        // Pattern 2: Distributed attack detection (from multiple IPs)
        const lastFiveMinutes = new Date(Date.now() - 5 * 60 * 1000);
        const distributedAttempts = await LoginAttempt.find({ 
            identifier,
            timestamp: { $gte: lastFiveMinutes }
        }).sort({ timestamp: -1 });
        
        if (identifier && distributedAttempts.length >= 5) {
            console.log(`Found ${distributedAttempts.length} attempts for identifier "${identifier}" in last 5 minutes`);
            
            // Count unique IPs
            const uniqueIPs = new Set();
            distributedAttempts.forEach(attempt => uniqueIPs.add(attempt.ipAddress));
            
            console.log(`Attempts come from ${uniqueIPs.size} unique IP addresses`);
            
            // If attempts coming from 3+ different IPs, could be distributed attack
            if (uniqueIPs.size >= 3) {
                console.log('ANOMALY DETECTED: Potential distributed brute force attack');
                
                // Create an anomaly record
                const anomaly = new Anomaly({
                    identifier,
                    ipAddress, // Current IP
                    userAgent,
                    reason: 'Potential distributed brute force attack',
                    severity: uniqueIPs.size >= 5 ? 'critical' : 'high',
                    details: {
                        attemptCount: distributedAttempts.length,
                        uniqueIpCount: uniqueIPs.size,
                        ipAddresses: Array.from(uniqueIPs),
                        timeframe: '5 minutes'
                    }
                });
                
                // Add userId if available
                if (distributedAttempts[0].userId) {
                    anomaly.userId = distributedAttempts[0].userId;
                }
                
                await anomaly.save();
                console.log('Distributed attack anomaly saved with ID:', anomaly._id);
                
                // Create security alert if we have a userId
                if (distributedAttempts[0].userId) {
                    await createSecurityAlert(distributedAttempts[0].userId, 'distributed_brute_force', {
                        identifier,
                        attemptCount: distributedAttempts.length,
                        uniqueIpCount: uniqueIPs.size,
                        anomalyId: anomaly._id
                    });
                    console.log('Security alert created for distributed attack on user ID:', distributedAttempts[0].userId);
                }
                
                // Add to request object
                req.detectedAnomaly = {
                    ...req.detectedAnomaly,
                    type: 'distributed_attack', 
                    severity: anomaly.severity,
                    anomalyId: anomaly._id
                };
            }
        }
        
        // Pattern 3: Password spray attack (same IP targeting multiple accounts)
        const lastFifteenMinutes = new Date(Date.now() - 15 * 60 * 1000);
        const ipBasedAttempts = await LoginAttempt.find({ 
            ipAddress,
            timestamp: { $gte: lastFifteenMinutes },
            status: { $in: ['failed', 'user_not_found'] } // Make sure 'user_not_found' is in your LoginAttempt schema enum
        });
        
        if (ipBasedAttempts.length >= 5) {
            // Count unique identifiers
            const uniqueIdentifiers = new Set();
            ipBasedAttempts.forEach(attempt => {
                if (attempt.identifier) uniqueIdentifiers.add(attempt.identifier);
            });
            
            console.log(`IP ${ipAddress} has tried ${uniqueIdentifiers.size} different accounts in 15 minutes`);
            
            // If trying 3+ different accounts, likely password spray
            if (uniqueIdentifiers.size >= 3) {
                console.log('ANOMALY DETECTED: Potential password spray attack');
                
                // Create an anomaly record
                const anomaly = new Anomaly({
                    ipAddress,
                    userAgent,
                    reason: 'Potential password spray attack',
                    severity: uniqueIdentifiers.size >= 5 ? 'high' : 'medium',
                    details: {
                        attemptCount: ipBasedAttempts.length,
                        uniqueAccountCount: uniqueIdentifiers.size,
                        accounts: Array.from(uniqueIdentifiers),
                        timeframe: '15 minutes'
                    }
                });
                
                await anomaly.save();
                console.log('Password spray anomaly saved with ID:', anomaly._id);
                
                // Create a general security alert (not user-specific)
                await createSecurityAlert(null, 'password_spray_attack', {
                    ipAddress,
                    attemptCount: ipBasedAttempts.length,
                    uniqueAccountCount: uniqueIdentifiers.size,
                    anomalyId: anomaly._id
                });
                
                // Add to request object
                req.detectedAnomaly = {
                    ...req.detectedAnomaly,
                    type: 'password_spray',
                    severity: anomaly.severity,
                    anomalyId: anomaly._id
                };
            }
        }
        
        // If critical anomalies detected, you can choose to block the request here
        if (req.detectedAnomaly && req.detectedAnomaly.severity === 'critical') {
            console.log('BLOCKING REQUEST due to critical security anomaly');
            return res.status(429).json({
                success: false,
                message: "Access temporarily blocked due to suspicious activity",
                details: "Multiple security anomalies detected. Please try again later or contact support."
            });
        }
        
        // Continue to next middleware or route handler
        next();
    } catch (error) {
        console.error('Anomaly detection error:', error);
        // Don't block the request on error, just log and continue
        next();
    }
};

export default detectAnomaly;