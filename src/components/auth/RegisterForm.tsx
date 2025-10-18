"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useAuth } from "./AuthProvider";
import { Loader2, ArrowLeft } from "lucide-react";

const credentialsSchema = z.object({
  email: z.string().email("Lütfen geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır"),
});

const verificationSchema = z.object({
  passcode: z
    .string()
    .length(6, "Doğrulama kodu 6 haneli olmalıdır"),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { register: registerUser, sendVerification } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const firstOtpRef = useRef<HTMLInputElement>(null);

  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const handleCredentialsSubmit = async (data: CredentialsFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await sendVerification(data.email, 'register');
      setUserEmail(data.email);
      setUserPassword(data.password);
      setCurrentStep(2);
      setResendCooldown(60);
      startCooldownTimer();
    } catch (err: any) {
      setError(err.errorMessage || "Doğrulama kodu gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (currentStep === 2 && firstOtpRef.current) {
      setTimeout(() => {
        firstOtpRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await registerUser(userEmail, userPassword, data.passcode);
      onSuccess?.();
    } catch (err: any) {
      setError(err.errorMessage || "Kayıt başarısız. Lütfen daha sonra tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await sendVerification(userEmail, 'register');
      setResendCooldown(60);
      startCooldownTimer();
    } catch (err: any) {
      setError(err.errorMessage || "Doğrulama kodu gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setCurrentStep(1);
    setError(null);
    verificationForm.reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="flex items-center gap-2">
          {currentStep === 2 && (
            <button
              type="button"
              onClick={goBackToCredentials}
              className="p-[5px] hover:bg-gray-100 rounded cursor-pointer"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="text-center text-2xl font-semibold">
            {currentStep === 1 ? "Hesabınızı oluşturun" : "Doğrulama Kodu"}
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          {currentStep === 1 
            ? "XBotMaster'a kaydolun ve yolculuğunuza başlayın"
            : "E-posta adresinize gönderilen kodu girin"
          }
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
            onSubmit={credentialsForm.handleSubmit(handleCredentialsSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="mb-[4px] h-[22px] text-sm font-medium">E-posta</div>
              <Input
                id="email"
                type="email"
                placeholder="e-posta@example.com"
                {...credentialsForm.register("email")}
                disabled={isLoading}
                className="bg-background border-input"
              />
              {credentialsForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {credentialsForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="mb-[4px] h-[22px] text-sm font-medium">Şifre</div>
              <Input
                id="password"
                type="password"
                placeholder="şifre"
                {...credentialsForm.register("password")}
                disabled={isLoading}
                className="bg-background border-input"
              />
              {credentialsForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {credentialsForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full my-[10px] bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hesap Oluştur
            </Button>
            
            {onSwitchToLogin && (
              <div className="text-center text-sm flex items-center justify-center gap-2">
                <span className="text-center text-muted-foreground">
                  Zaten hesabınız var mı?
                </span>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-400 hover:underline cursor-pointer"
                  disabled={isLoading}
                >
                  Giriş yapın
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
              onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    disabled={isLoading}
                    value={verificationForm.watch("passcode") || ""}
                    onChange={(value) =>
                      verificationForm.setValue("passcode", value)
                    }
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
                
                {verificationForm.formState.errors.passcode && (
                  <p className="text-sm text-red-500 text-center">
                    {verificationForm.formState.errors.passcode.message}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full my-[10px] bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                E-postayı Doğrula
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