"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const prisma_1 = require("../lib/prisma");
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
        });
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    }
    catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=admin.js.map