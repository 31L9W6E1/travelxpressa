import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp";
export function OTPForm({ ...props }) {
    return (_jsxs(Card, { ...props, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Enter verification code" }), _jsx(CardDescription, { children: "We sent a 6-digit code to your email." })] }), _jsx(CardContent, { children: _jsx("form", { children: _jsxs(FieldGroup, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { htmlFor: "otp", children: "Verification code" }), _jsx(InputOTP, { maxLength: 6, id: "otp", required: true, children: _jsxs(InputOTPGroup, { className: "gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border", children: [_jsx(InputOTPSlot, { index: 0 }), _jsx(InputOTPSlot, { index: 1 }), _jsx(InputOTPSlot, { index: 2 }), _jsx(InputOTPSlot, { index: 3 }), _jsx(InputOTPSlot, { index: 4 }), _jsx(InputOTPSlot, { index: 5 })] }) }), _jsx(FieldDescription, { children: "Enter the 6-digit code sent to your email." })] }), _jsxs(FieldGroup, { children: [_jsx(Button, { type: "submit", children: "Verify" }), _jsxs(FieldDescription, { className: "text-center", children: ["Didn't receive the code? ", _jsx("a", { href: "#", children: "Resend" })] })] })] }) }) })] }));
}
