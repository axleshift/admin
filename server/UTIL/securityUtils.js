import SecurityAlert from "../model/SecurityAlert.js";
import LoginAttempt from "../model/LoginAttempt.js";
import User from "../model/User.js";

export const logLoginAttempt = async (attemptData) => {
    try {
        const loginAttempt = new LoginAttempt(attemptData);
        await loginAttempt.save();
        return true;
    } catch (error) {
        console.error("Error logging login attempt:", error);
        return false;
    }
};

export const checkForUnusualLogin = async (userId, currentIp, currentUserAgent) => {
    try {
        // Get the last successful login for this user
        const lastLogin = await LoginAttempt.findOne({ 
            userId, 
            status: 'success' 
        }).sort({ timestamp: -1 }).limit(1);
        
        if (!lastLogin) return false; // First login
        
        // If IP or user agent is different from the last successful login
        if (lastLogin.ipAddress !== currentIp || lastLogin.userAgent !== currentUserAgent) {
            return {
                previousIp: lastLogin.ipAddress,
                previousUserAgent: lastLogin.userAgent
            };
        }
        
        return false;
    } catch (error) {
        console.error("Error checking for unusual login:", error);
        return false;
    }
};

export const getRecentFailedAttempts = async (userId, identifier) => {
    try {
        // Consistently use 15 minutes for all time windows
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        
        // If we have both userId and identifier, we need to count attempts for EITHER
        const query = {
            status: 'failed',
            timestamp: { $gte: fifteenMinutesAgo }
        };
        
        if (userId && identifier) {
            query.$or = [{ userId }, { identifier }];
        } else if (userId) {
            query.userId = userId;
        } else if (identifier) {
            query.identifier = identifier;
        }
        
        const count = await LoginAttempt.countDocuments(query);
        return count;
    } catch (error) {
        console.error("Error counting failed attempts:", error);
        return 0;
    }
};

export const createSecurityAlert = async (userId, alertType, details) => {
    try {
        console.log(`Creating security alert - Type: ${alertType}, UserId: ${userId}`);
        console.log('Alert details:', details);
        
        const alert = new SecurityAlert({
            userId,
            alertType,
            details, // Now this will properly store as an object
            timestamp: new Date(),
            status: 'active'
        });
        
        const savedAlert = await alert.save();
        console.log('Security alert created successfully:', savedAlert._id);
        
        return savedAlert;
    } catch (error) {
        console.error("Error creating security alert:", error);
        console.error("Error details:", error.message);
        return false;
    }
};

export const checkLoginRateLimit = async (userId, identifier, ipAddress) => {
    try {
        // Consistently use 15 minutes for all time windows
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        
        // Create query for failed attempts that haven't been reset
        // Only count actual password failures, not 'user_not_found'
        const query = {
            status: 'failed', // This will now only include actual password failures 
            timestamp: { $gte: fifteenMinutesAgo }
        };
        
        // Check for existing account lock first
        if (userId || identifier) {
            const user = await User.findOne({
                $or: [
                    ...(userId ? [{ _id: userId }] : []),
                    ...(identifier ? [{ email: identifier }, { username: identifier }] : [])
                ],
                accountLocked: true,
                lockExpiration: { $gt: new Date() }
            });
            
            if (user) {
                return {
                    isLocked: true,
                    lockedUntil: user.lockExpiration,
                    remainingTime: Math.ceil((user.lockExpiration - new Date()) / 1000) // in seconds
                };
            }
        }
        
        // If we're looking up a specific user/identifier, prioritize those attempts
        // rather than including IP-based attempts from other users
        if (userId || identifier) {
            const identifiers = [];
            if (userId) identifiers.push({ userId });
            if (identifier) identifiers.push({ identifier });
            
            query.$or = identifiers;
        } else if (ipAddress) {
            // Only use IP address if we don't have userId or identifier
            query.ipAddress = ipAddress;
        }
        
        const count = await LoginAttempt.countDocuments(query);
        
        // Check if we need to lock the account (5 or more failed attempts)
        if (count >= 5) {
            // Find the most recent failed attempt to calculate lockout time
            const mostRecentAttempt = await LoginAttempt.findOne(query)
                .sort({ timestamp: -1 })
                .limit(1);
            
            if (mostRecentAttempt) {
                const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
                
                // If we have a user ID or identifier, lock the account in the database
                if (userId || identifier) {
                    const userQuery = userId ? 
                        { _id: userId } : 
                        { $or: [{ email: identifier }, { username: identifier }] };
                    
                    // Update user record to mark account as locked
                    await User.updateOne(userQuery, {
                        accountLocked: true,
                        lockExpiration: lockoutUntil
                    });
                    
                    // Create a security alert for the account lockout
                    if (userId) {
                        await createAccountLockoutAlert(userId, ipAddress, mostRecentAttempt.userAgent);
                    }
                }
                
                // Return locked status
                return {
                    isLocked: true,
                    lockedUntil: lockoutUntil,
                    remainingTime: Math.ceil((lockoutUntil - new Date()) / 1000) // in seconds
                };
            }
        }
        
        // Not locked, return attempt count for informational purposes
        return { 
            isLocked: false,
            attemptCount: count,
            remainingAttempts: 5 - count
        };
    } catch (error) {
        console.error("Error checking rate limit:", error);
        return { isLocked: false }; // Default to not locked if there's an error
    }
};

export const createAccountLockoutAlert = async (userId, ipAddress, userAgent) => {
    return await createSecurityAlert(userId, 'account_locked', {
        ipAddress,
        userAgent,
        timestamp: new Date(),
        lockDuration: '15 minutes'
    });
};

export const resetFailedAttempts = async (userId, identifier, ipAddress = null) => {
    try {
        console.log(`Resetting failed attempts - UserId: ${userId}, Identifier: ${identifier}, IP: ${ipAddress}`);
        
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const query = {
            status: 'failed',
            timestamp: { $gte: fifteenMinutesAgo }
        };
        
        const identifiers = [];
        if (userId) identifiers.push({ userId });
        if (identifier) identifiers.push({ identifier });
        if (ipAddress) identifiers.push({ ipAddress });
        
        if (identifiers.length > 0) {
            query.$or = identifiers;
        }
        
        // Mark these attempts as 'reset' instead of deleting them
        const updateResult = await LoginAttempt.updateMany(query, { $set: { status: 'reset' } });
        console.log("Reset result:", updateResult);
        
        // Also unlock the user account if it was locked
        if (userId || identifier) {
            const userQuery = userId ? 
                { _id: userId } : 
                { $or: [{ email: identifier }, { username: identifier }] };
            
            const unlockResult = await User.updateOne(
                userQuery,
                { 
                    $set: { 
                        accountLocked: false, 
                        lockExpiration: null 
                    },
                    $unset: { failedLoginAttempts: "" }
                }
            );
            
            console.log("Account unlock result:", unlockResult);
        }
        
        return true;
    } catch (error) {
        console.error("Error resetting failed attempts:", error);
        return false;
    }
};

export const createLogger = async (user, action, description, additionalData = {}) => {
    try {
        // Assuming you have an AuditLog model
        const log = new AuditLog({
            userId: user.id,
            username: user.username,
            action,
            description,
            timestamp: new Date(),
            additionalData
        });
        
        await log.save();
        return true;
    } catch (error) {
        console.error("Error creating audit log:", error);
        return false;
    }
};