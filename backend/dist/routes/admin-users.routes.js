"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
// Create admin user (for initial setup)
router.post("/create-admin", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required" });
        }
        // Check if admin already exists
        const existingAdmin = await prisma_1.prisma.user.findFirst({
            where: { role: "ADMIN" }
        });
        if (existingAdmin) {
            return res.status(400).json({ error: "Admin user already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma_1.prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email,
                password: hashedPassword,
                name,
                role: "ADMIN",
            },
        });
        res.json({
            message: "Admin user created successfully",
            user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
        });
    }
    catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ error: "Failed to create admin user" });
    }
});
// Get all users (admin only)
router.get("/users", auth_1.authenticateToken, async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// Update user role (admin only)
router.put("/users/:id/role", auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role || (role !== "CLIENT" && role !== "ADMIN")) {
            return res.status(400).json({ error: "Valid role is required" });
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: String(id) },
            data: { role },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Failed to update user role" });
    }
});
// Delete user (admin only)
router.delete("/users/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.user.delete({
            where: { id: String(id) },
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});
exports.default = router;
//# sourceMappingURL=admin-users.routes.js.map