import User from "../model/User.js";

export const resetFailedAttempts = async (userId) => {
    try {
        await User.updateOne({ _id: userId }, { failedAttempts: 0 });
    } catch (error) {
        console.error("Error resetting failed attempts:", error);
    }
};
