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
        // Get failed attempts in the last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // If we have both userId and identifier, we need to count attempts for EITHER
        // If we have just one, we only count for that specific one
        const query = {
            status: 'failed',
            timestamp: { $gte: thirtyMinutesAgo }
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
        const alert = new SecurityAlert({
            userId,
            alertType,
            details,
            timestamp: new Date(),
            status: 'active'
        });
        
        await alert.save();
        
        // Here you could add notification logic (email, SMS, etc.)
        // For example:
        // await sendSecurityAlertNotification(userId, alertType, details);
        
        return true;
    } catch (error) {
        console.error("Error creating security alert:", error);
        return false;
    }
};


// Update this function in securityUtils.js
export const checkLoginRateLimit = async (userId, identifier, ipAddress) => {
    try {
        // Get failed attempts in the last 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        
        // Create query for failed attempts
        const query = {
            status: 'failed',
            timestamp: { $gte: fifteenMinutesAgo }
        };
        
        // Add identifiers to the query
        const identifiers = [];
        if (userId) identifiers.push({ userId });
        if (identifier) identifiers.push({ identifier });
        if (ipAddress) identifiers.push({ ipAddress });
        
        if (identifiers.length > 0) {
            query.$or = identifiers;
        }
        
        const count = await LoginAttempt.countDocuments(query);
        
        // If we have a userId or identifier, we can check if the account is already locked
        if (userId || identifier) {
            // Check if this account is already marked as locked in the database
            const user = await User.findOne({
                $or: [
                    { _id: userId },
                    { email: identifier },
                    { username: identifier }
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
        
        if (count >= 5) {
            // Find the most recent failed attempt to calculate lockout time
            const mostRecentAttempt = await LoginAttempt.findOne(query)
                .sort({ timestamp: -1 })
                .limit(1);
            
            if (mostRecentAttempt) {
                const lockoutUntil = new Date(mostRecentAttempt.timestamp.getTime() + 5 * 60 * 1000);
                const now = new Date();
                
                if (now < lockoutUntil) {
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
                    
                    // Account is locked out
                    return {
                        isLocked: true,
                        lockedUntil: lockoutUntil,
                        remainingTime: Math.ceil((lockoutUntil - now) / 1000) // in seconds
                    };
                }
            }
        }
        
        // Not locked
        return { isLocked: false };
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
        lockDuration: '5 minutes'
    });
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