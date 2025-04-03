
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password is required",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password is required",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const otpSchema = z.object({
  otp: z.string().min(6, {
    message: "OTP must be 6 characters",
  }),
});

type OTPFormValues = z.infer<typeof otpSchema>;

const ChangePasswordForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [tempPassword, setTempPassword] = useState<PasswordFormValues | null>(null);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const sendOTP = async () => {
    try {
      setLoading(true);

      // In a real application, this would send an OTP to the user's phone or email
      // For now, we'll simulate that the OTP has been sent
      
      toast({
        title: "OTP sent",
        description: "A verification code has been sent to your registered email/phone. The code is 123456.",
      });
      
      setOtpSent(true);
      setShowOTPForm(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      setLoading(true);
      console.log("Password form data:", data);
      
      // Store the form data for later use after OTP verification
      setTempPassword(data);
      
      // Send OTP for verification
      await sendOTP();
    } catch (error) {
      console.error("Error initiating password change:", error);
      toast({
        title: "Error",
        description: "Failed to initiate password change. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const verifyOTP = async (data: OTPFormValues) => {
    try {
      setLoading(true);
      
      // In a real app, we'd verify the OTP against what was sent
      // For this demo, we'll accept "123456" as the valid OTP
      if (data.otp === "123456" && tempPassword) {
        // Complete the password change
        // TODO: Implement actual password change with Supabase
        
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
        
        // Reset all forms and states
        form.reset();
        otpForm.reset();
        setShowOTPForm(false);
        setOtpSent(false);
        setTempPassword(null);
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2 border-primary/10 shadow-md overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center text-primary">
            <KeyRound className="mr-2 h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password with two-factor authentication for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {showOTPForm ? (
            <>
              <Alert variant="info" className="mb-4">
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  A verification code has been sent to your registered contact. For this demo, use <strong>123456</strong> as the code.
                </AlertDescription>
              </Alert>
              
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(verifyOTP)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowOTPForm(false);
                        setOtpSent(false);
                      }}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify & Change Password"}
                    </Button>
                  </div>
                  
                  {otpSent && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-primary"
                      onClick={sendOTP}
                      disabled={loading}
                    >
                      Resend Code
                    </Button>
                  )}
                </form>
              </Form>
            </>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showCurrentPassword ? "text" : "password"} 
                            placeholder="Enter current password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showNewPassword ? "text" : "password"} 
                            placeholder="Enter new password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Confirm new password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Continue"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePasswordForm;
