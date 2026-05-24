import { z } from 'zod';

// Reusable URL & handle patterns
const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+(\/)?$/;
const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+(\/)?$/;
const twitterPattern = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/(\w){1,15}(\/)?$/;

export const signupSchema = z.object({
    fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters." }).optional().or(z.literal('')),
    username: z.string().trim().min(1, { message: "Username is required" }).min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, {
        message: "Can only contain letters, numbers, and underscores.",
    }),
    email: z.string().trim().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required" }).min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export const profileSchema = z.object({
    fullName: z.string().trim().max(255, "Full name cannot exceed 255 characters").optional().or(z.literal('')),
    bio: z.string().max(300, "Bio cannot exceed 300 characters").optional().or(z.literal('')),
    location: z.string().trim().max(200, "Location cannot exceed 200 characters").optional().or(z.literal('')),
    company: z.string().trim().max(100, "Company name is too long").optional().or(z.literal('')),
    website: z.string().trim().max(500, "Website URL is too long").url("Invalid URL").optional().or(z.literal('')),
    isHireable: z.boolean(),
    avatarPresetId: z.string().optional(),
    avatarUrl: z.string().optional().nullable(),
    socials: z.object({
        github: z.string().trim().max(500, "URL too long").optional().or(z.literal(''))
            .refine((val) => !val || githubUrlPattern.test(val) || /^[a-zA-Z0-9-]+$/.test(val), {
                message: "Invalid GitHub handle or URL.",
            }),
        linkedin: z.string().trim().max(500, "URL too long").optional().or(z.literal(''))
            .refine((val) => !val || linkedinPattern.test(val) || /^[a-zA-Z0-9-]+$/.test(val), {
                message: "Invalid LinkedIn handle or URL.",
            }),
        twitter: z.string().trim().max(500, "URL too long").optional().or(z.literal(''))
            .refine((val) => !val || twitterPattern.test(val) || /^@?(\w){1,15}$/.test(val), {
                message: "Invalid Twitter handle or URL.",
            })
    })
});

export const loginSchema = z.object({
    identifier: z.string().trim().min(1, "Email or username is required."),
    password: z.string().min(1, "Password is required."),
}).superRefine(({ identifier }, ctx) => {
    if (identifier.includes('@')) {
        const emailCheck = z.string().email().safeParse(identifier);
        if (!emailCheck.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please enter a valid email address.",
                path: ['identifier'],
            });
        }
    } else {
        const usernameCheck = z.string().min(3).safeParse(identifier);
        if (!usernameCheck.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Username must be at least 3 characters.",
                path: ['identifier'],
            });
        }
    }
});

export const resendVerificationSchema = z.object({
    email: z.string().trim().min(1, { message: "Email is required." }).email({ message: "Please enter a valid email address." })
});