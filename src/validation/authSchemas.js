import { z } from 'zod'

const passwordRules = z.string()
    .min(8, 'Mat khau toi thieu 8 ky tu')
    .refine(v => /[a-z]/.test(v), 'Can co chu thuong')
    .refine(v => /[A-Z]/.test(v), 'Can co chu in hoa')
    .refine(v => /[0-9]/.test(v), 'Can co so')
    .refine(v => /[^A-Za-z0-9]/.test(v), 'Can co ky tu dac biet');

export const registerSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email('Email khong hop le'),
    password: passwordRules,
    fullName: z.string()
        .trim()
        .min(2, 'Ten qua ngan')
        .max(100, 'Ten qua dai'),
});

export const loginSchema = z.object({
    email: z.string()
        .trim().toLowerCase()
        .email('Email không hợp lệ'),

    password: z.string()
        .min(1, 'Thiếu mật khẩu'),
})