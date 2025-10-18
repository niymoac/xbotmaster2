"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthProvider";

const emailSchema = z.object({
  email: z.string().email("Lütfen geçerli bir e-posta adresi girin"),
});

const resetPasswordSchema = z
  .object({
    passcode: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z.string().min(6, "Lütfen şifrenizi onaylayın"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordForm({
  onBack,
  onSuccess,
}: ResetPasswordFormProps) {
  const { sendVerification, resetPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const firstOtpRef = useRef<HTMLInputElement>(null);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const startCooldownTimer = () => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await sendVerification(data.email, 'reset-password');
      setUserEmail(data.email);
      setCurrentStep(2);
      setResendCooldown(60);
      startCooldownTimer();
    } catch (err: any) {
      setError(err.errorMessage || "Doğrulama kodu gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(userEmail, data.passcode, data.password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.errorMessage || "Şifre sıfırlama başarısız. Lütfen daha sonra tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await sendVerification(userEmail, 'reset-password');
      setResendCooldown(60);
      startCooldownTimer();
    } catch (err: any) {
      setError(err.errorMessage || "Doğrulama kodu gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEmail = () => {
    setCurrentStep(1);
    setError(null);
    resetForm.reset();
  };

  useEffect(() => {
    if (currentStep === 2 && firstOtpRef.current) {
      setTimeout(() => {
        firstOtpRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="flex items-center gap-2">
          {currentStep === 2 && (
            <button
              type="button"
              onClick={goBackToEmail}
              className="p-[5px] hover:bg-gray-100 rounded cursor-pointer"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="text-center text-2xl font-semibold">
            {currentStep === 1 ? "Şifre Sıfırla" : "Yeni Şifre Belirle"}
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Şifrenizi sıfırlayın ve hesabınızı güvence altına alın
        </div>
      </div>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 1 && (
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="mb-[4px] h-[22px] text-sm font-medium">E-posta</div>
              <Input
                id="email"
                type="email"
                placeholder="E-posta adresinizi girin"
                {...emailForm.register("email")}
                disabled={isLoading}
                className="bg-background border-input"
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full my-[10px] bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Doğrulama Kodu Gönder
            </Button>
            
            {onBack && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-sm text-muted-foreground hover:text-purple-400 hover:underline cursor-pointer"
                  disabled={isLoading}
                >
                  Giriş sayfasına dön
                </button>
              </div>
            )}
          </form>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-6">
              <span className="font-medium">{userEmail}</span> adresine doğrulama kodu gönderdik
            </div>
            
            <form
              onSubmit={resetForm.handleSubmit(handleResetSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    disabled={isLoading}
                    value={resetForm.watch("passcode") || ""}
                    onChange={(value) => resetForm.setValue("passcode", value)}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }, (_, i) => (
                        <InputOTPSlot
                          key={i}
                          ref={i === 0 ? firstOtpRef : undefined}
                          index={i}
                          className="rounded-md border border-input"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                {resetForm.formState.errors.passcode && (
                  <p className="text-sm text-red-500 text-center">
                    {resetForm.formState.errors.passcode.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="mb-[4px] h-[22px] text-sm font-medium">Yeni Şifre</div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Yeni şifre"
                  {...resetForm.register("password")}
                  disabled={isLoading}
                  className="bg-background border-input"
                />
                {resetForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="mb-[4px] h-[22px] text-sm font-medium">Şifre Onay</div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifre onay"
                  {...resetForm.register("confirmPassword")}
                  disabled={isLoading}
                  className="bg-background border-input"
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full my-[10px] bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Şifreyi Sıfırla
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Kodu almadınız mı?{" "}
                </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-purple-400 hover:underline cursor-pointer"
                  disabled={isLoading || resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Tekrar gönder (${resendCooldown}s)`
                    : "Tekrar gönder"}
                </button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}