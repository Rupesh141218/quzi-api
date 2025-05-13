"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
// Signup validation schema
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
});
// Login validation schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Validate data against schema
const validateInput = (schema, data) => {
    try {
        const validData = schema.parse(data);
        return { success: true, data: validData };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return { success: false, error };
        }
        throw error;
    }
};
exports.validateInput = validateInput;
