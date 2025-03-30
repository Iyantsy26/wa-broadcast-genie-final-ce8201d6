
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, Edit, UserPlus, BarChart3, 
  Trash2, Users, MessageSquare
} from "lucide-react";
import type { Department } from "@/services/teamService";

interface DepartmentCardProps {
  department: Department;
  onEdit: (id: string) => void;
  onAddMembers: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  onDelete: (id: string) => void;
  onViewMembers: (id: string) => void;
  onViewConversations: (id: string) => void;
}

const DepartmentCard = ({
  department,
  onEdit,
  onAddMembers,
  onViewAnalytics,
  onDelete,
  onViewMembers,
  onViewConversations,
}: DepartmentCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{department.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(department.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Department
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddMembers(department.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewAnalytics(department.id)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(department.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          {department.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Department Lead</span>
            <span className="text-sm font-medium">
              {department.leadName || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Team Members</span>
            <span className="text-sm font-medium">{department.memberCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewMembers(department.id)}
        >
          <Users className="mr-2 h-4 w-4" />
          View Members
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewConversations(department.id)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          View Conversations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DepartmentCard;
