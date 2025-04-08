
import React, { useState, useRef, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox
} from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { 
  Department, 
  addTeamMember, 
  TeamMember, 
  updateTeamMember, 
  getWhatsAppAccounts
} from '@/services/teamService';
import { useToast } from "@/hooks/use-toast";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  onSuccess: (updatedMember?: TeamMember) => void;
  editMember?: TeamMember;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  countryCode: z.string().default("+1"),
  role: z.enum(["admin", "manager", "agent"]),
  departmentId: z.string().optional(),
  grantWhatsAppAccess: z.boolean().default(false),
  selectedWhatsAppAccounts: z.array(z.string()).default([]),
  position: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  message: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

const countryCodes = [
  { code: "+1", name: "United States (US)" },
  { code: "+44", name: "United Kingdom (UK)" },
  { code: "+91", name: "India (IN)" },
  { code: "+61", name: "Australia (AU)" },
  { code: "+86", name: "China (CN)" },
  { code: "+52", name: "Mexico (MX)" },
  { code: "+971", name: "United Arab Emirates (UAE)" },
  { code: "+65", name: "Singapore (SG)" },
  { code: "+49", name: "Germany (DE)" },
  { code: "+33", name: "France (FR)" },
  { code: "+81", name: "Japan (JP)" },
  { code: "+82", name: "South Korea (KR)" },
  { code: "+55", name: "Brazil (BR)" },
  { code: "+7", name: "Russia (RU)" },
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const AddTeamMemberDialog = ({
  open,
  onOpenChange,
  departments,
  onSuccess,
  editMember
}: AddTeamMemberDialogProps) => {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [whatsappAccounts, setWhatsappAccounts] = useState<Array<{id: string, account_name: string}>>([]);
  
  useEffect(() => {
    if (open) {
      loadWhatsAppAccounts();
    }
  }, [open]);
  
  const loadWhatsAppAccounts = async () => {
    try {
      const accounts = await getWhatsAppAccounts();
      setWhatsappAccounts(accounts);
    } catch (error) {
      console.error("Error loading WhatsApp accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load WhatsApp accounts",
        variant: "destructive"
      });
    }
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editMember?.name || "",
      email: editMember?.email || "",
      phone: editMember?.phone ? editMember.phone.replace(/^\+\d+\s/, "") : "",
      countryCode: editMember?.phone?.match(/^\+\d+/)?.[0] || "+1",
      role: (editMember?.role as "admin" | "manager" | "agent") || "agent",
      departmentId: departments.find(d => d.name === editMember?.department)?.id || undefined,
      grantWhatsAppAccess: editMember?.whatsappAccounts.length ? true : false,
      selectedWhatsAppAccounts: [], // Will be populated when WhatsApp accounts are loaded
      position: editMember?.position || "",
      company: editMember?.company || "",
      address: editMember?.address || "",
      message: "",
    },
  });

  useEffect(() => {
    if (editMember?.avatar) {
      setAvatarPreview(editMember.avatar);
    }
    
    if (open && editMember && whatsappAccounts.length > 0) {
      // Find the IDs of the WhatsApp accounts assigned to the member
      const selectedAccountIds = whatsappAccounts
        .filter(acc => editMember.whatsappAccounts.includes(acc.account_name))
        .map(acc => acc.id);
      
      form.setValue('selectedWhatsAppAccounts', selectedAccountIds);
    }
  }, [editMember, open, whatsappAccounts]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    form.setValue("avatar", file);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Format the phone number with country code
      const formattedPhone = values.phone ? `${values.countryCode} ${values.phone}` : undefined;
      
      const departmentName = values.departmentId 
        ? departments.find(d => d.id === values.departmentId)?.name 
        : undefined;
      
      // Get the WhatsApp account names from selected IDs
      const selectedAccounts = values.selectedWhatsAppAccounts.length > 0
        ? whatsappAccounts
          .filter(acc => values.selectedWhatsAppAccounts.includes(acc.id))
          .map(acc => acc.account_name)
        : [];
      
      if (editMember) {
        // Update existing team member
        const updatedMember = await updateTeamMember(editMember.id, {
          name: values.name,
          email: values.email,
          phone: formattedPhone,
          role: values.role,
          department: departmentName,
          whatsappAccounts: values.grantWhatsAppAccess ? selectedAccounts : [],
          avatar: avatarPreview,
          position: values.position,
          company: values.company,
          address: values.address
        });
        
        toast({
          title: "Team member updated",
          description: `${values.name}'s information has been updated`,
        });
        
        onSuccess(updatedMember);
      } else {
        // Add new team member using Supabase
        const newMember = await addTeamMember({
          name: values.name,
          email: values.email,
          phone: formattedPhone,
          role: values.role,
          status: 'pending',
          whatsappAccounts: values.grantWhatsAppAccess ? selectedAccounts : [],
          department: departmentName,
          avatar: avatarPreview,
          position: values.position,
          company: values.company,
          address: values.address
        });
        
        toast({
          title: "Team member added",
          description: `${values.name} has been added to your team`,
        });
        
        onSuccess(newMember);
      }
      
      form.reset();
      setAvatarPreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding/updating team member:", error);
      toast({
        title: "Error",
        description: editMember 
          ? "Failed to update team member" 
          : "Failed to add team member",
        variant: "destructive",
      });
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to all system features and settings';
      case 'manager':
        return 'Department-level management and oversight';
      case 'agent':
        return 'Handle customer conversations and basic tasks';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          <DialogDescription>
            {editMember 
              ? "Update this team member's information" 
              : "Add a new member to your WhatsApp management team"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-primary/20">
                  <AvatarImage src={avatarPreview || editMember?.avatar} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="h-12 w-12 text-primary/80" />
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1 text-white shadow-sm cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Max size: 2MB
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Select 
                          onValueChange={(value) => form.setValue("countryCode", value)}
                          defaultValue={form.getValues("countryCode")}
                        >
                          <SelectTrigger className="w-[140px] rounded-r-none">
                            <SelectValue placeholder="Country code" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {countryCodes.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.code} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          placeholder="Phone number" 
                          className="rounded-l-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getRoleDescription(form.watch("role"))}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Business address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="grantWhatsAppAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>WhatsApp Access</FormLabel>
                    <FormDescription>
                      Grant access to send and receive WhatsApp messages
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch("grantWhatsAppAccess") && (
              <FormField
                control={form.control}
                name="selectedWhatsAppAccounts"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Assign WhatsApp Accounts</FormLabel>
                      <FormDescription>
                        Select which WhatsApp accounts this team member can access
                      </FormDescription>
                    </div>
                    {whatsappAccounts.length > 0 ? (
                      <div className="space-y-2">
                        {whatsappAccounts.map((account) => (
                          <FormField
                            key={account.id}
                            control={form.control}
                            name="selectedWhatsAppAccounts"
                            render={({ field }) => (
                              <FormItem
                                key={account.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(account.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedSelection = checked
                                        ? [...field.value, account.id]
                                        : field.value.filter((id) => id !== account.id);
                                      field.onChange(updatedSelection);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {account.account_name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No WhatsApp accounts available.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {!editMember && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a personal note to the welcome email" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editMember ? "Save Changes" : "Add Team Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberDialog;
