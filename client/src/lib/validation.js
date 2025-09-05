import { z } from 'zod';

// --- Reusable Regex Patterns ---
const githubUsernamePattern = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+(\/)?$/;
const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+(\/)?$/;
const twitterPattern = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/(\w){1,15}(\/)?$/;

// --- Signup Schema ---
export const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).optional().or(z.literal('')),
    username: z.string().min(1, {message: "Username is required"}).min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, {
        message: "Can only contain letters, numbers, and underscores.", // Message for invalid characters
    }),
    email: z.string().min(1, {message: "Email is required"}).email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, {message: "Password is required"}).min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(1, {message: "Please confirm your password"})
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});


// --- Profile Schema (The Master Blueprint) ---
export const profileSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email(), // Not editable, so no validation message needed for user
    bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional(),
    avatarId: z.string().optional(),
    avatarUrl: z.string().optional(),
    isHireable: z.boolean(),
    socialLinks: z.object({

        github: z.string().optional().or(z.literal(''))
            .refine((val) => {
                if (!val) return true; // Optional field
                return githubUsernamePattern.test(val) || githubUrlPattern.test(val);
            }, {
                message: "Invalid GitHub username or URL.",
            }),

        linkedin: z.string().optional().or(z.literal(''))
            .refine((val) => {
                if (!val) return true;
                // LinkedIn usernames are less strict, so we allow a wider pattern
                const usernamePattern = /^[a-zA-Z0-9-]{3,100}$/;
                return usernamePattern.test(val) || linkedinPattern.test(val);
            }, {
                message: "Invalid LinkedIn username or URL.",
            }),

        twitter: z.string().optional().or(z.literal(''))
            .refine((val) => {
                if (!val) return true;
                const handlePattern = /^@?(\w){1,15}$/;
                return handlePattern.test(val) || twitterPattern.test(val);
            }, {
                message: "Invalid Twitter handle or URL.",
            }),
    }),
});

export const loginSchema = z.object({
    identifier: z.string().min(1, "Email or username is required."),
    password: z.string().min(1, "Password is required."),
}).superRefine(({ identifier }, ctx) => {
    // If it contains '@', validate as an email
    if (identifier.includes('@')) {
        const emailCheck = z.string().email().safeParse(identifier);
        if (!emailCheck.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please enter a valid email address.",
                path: ['identifier'],
            });
        }
    }
    // Otherwise, validate as a username
    else {
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