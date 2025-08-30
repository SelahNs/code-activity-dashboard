import { z } from 'zod';

// --- Reusable Regex Patterns ---
const githubUsernamePattern = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+(\/)?$/;
const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+(\/)?$/;
const twitterPattern = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/(\w){1,15}(\/)?$/;

// --- Signup Schema ---
export const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).optional().or(z.literal('')),
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string()
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