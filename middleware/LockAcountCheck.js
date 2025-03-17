import User from '../model/User'
export const checkAccountLock = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && user.accountLocked && user.lockExpiration > Date.now()) {
            return res.status(429).json({ message: "Account locked. Use OTP to unlock." });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
