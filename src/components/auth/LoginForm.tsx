"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "./AuthProvider";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { XLoginButton } from "./x-login-button";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Lütfen geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Lütfen şifrenizi girin"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
}: LoginFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.errorMessage || "Giriş başarısız. Lütfen daha sonra tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="text-center text-2xl font-semibold">Hoş geldiniz</div>
        <div className="text-center text-sm text-muted-foreground">
          XBotMaster hesabınıza giriş yapın
        </div>
      </div>
      <CardContent>
        <div className="space-y-3">
          <XLoginButton />
          <GoogleLoginButton />
          <div className="my-[20px] flex items-center">
            <Separator className="flex-1" />
            <span className="mx-3 text-xs uppercase text-muted-foreground">VEYA</span>
            <Separator className="flex-1" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <div className="mb-[4px] h-[22px] text-sm font-medium">E-posta</div>
            <Input
              id="email"
              type="email"
              placeholder="e-posta@example.com"
              {...register("email")}
              disabled={isLoading}
              className="bg-background border-input"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-[4px] h-[22px] text-sm font-medium">
              <span className="h-[22px]">Şifre</span>
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-muted-foreground hover:underline cursor-pointer"
                  disabled={isLoading}
                >
                  Şifremi unuttum?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="şifre"
              {...register("password")}
              disabled={isLoading}
              className="bg-background border-input"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full my-[10px] bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Giriş Yap
          </Button>
          
          {onSwitchToRegister && (
            <div className="text-center text-sm flex items-center justify-center gap-2">
              <span className="text-center text-muted-foreground">
                Hesabınız yok mu?
              </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-purple-400 hover:underline cursor-pointer"
                disabled={isLoading}
              >
                Şimdi kaydolun
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}