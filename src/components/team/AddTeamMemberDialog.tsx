
import React, { useState } from 'react';
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Department, addTeamMember, TeamMember, updateTeamMember } from '@/services/teamService';
import { useToast } from "@/hooks/use-toast";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  onSuccess: (updatedMember?: TeamMember) => void; // Made updatedMember optional
  editMember?: TeamMember; // Added for editing existing members
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "agent"]),
  departmentId: z.string().optional(),
  grantWhatsAppAccess: z.boolean().default(false),
  message: z.string().optional(),
});

const AddTeamMemberDialog = ({
  open,
  onOpenChange,
  departments,
  onSuccess,
  editMember
}: AddTeamMemberDialogProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editMember?.name || "",
      email: editMember?.email || "",
      phone: editMember?.phone || "",
      role: (editMember?.role as "admin" | "manager" | "agent") || "agent",
      departmentId: departments.find(d => d.name === editMember?.department)?.id || undefined,
      grantWhatsAppAccess: editMember?.whatsappAccounts.length ? true : false,
      message: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const departmentName = values.departmentId 
        ? departments.find(d => d.id === values.departmentId)?.name 
        : undefined;
      
      if (editMember) {
        // Update existing team member
        const updatedMember = await updateTeamMember(editMember.id, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          department: departmentName,
          whatsappAccounts: values.grantWhatsAppAccess 
            ? (editMember.whatsappAccounts.length ? editMember.whatsappAccounts : ['Default Account']) 
            : [],
        });
        
        toast({
          title: "Team member updated",
          description: `${values.name}'s information has been updated`,
        });
        
        onSuccess(updatedMember);
      } else {
        // Add new team member
        const newMember = await addTeamMember({
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          status: 'pending',
          whatsappAccounts: values.grantWhatsAppAccess ? ['Default Account'] : [],
          department: departmentName,
        });
        
        toast({
          title: "Team member added",
          description: `${values.name} has been added to your team`,
        });
        
        onSuccess(newMember);
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          <DialogDescription>
            {editMember 
              ? "Update this team member's information" 
              : "Add a new member to your WhatsApp management team"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
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
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8901" {...field} />
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
