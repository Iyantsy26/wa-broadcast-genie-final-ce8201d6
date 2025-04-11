
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  FileText, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Copy, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Filter, 
  MessageSquare,
  Image,
  Video,
  File,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import { toast } from "sonner";
import { 
  fetchTemplates, 
  deleteTemplate, 
  updateTemplate,
  Template
} from "@/services/templates/templateService";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Templates = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  
  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);
  
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Handle template actions
  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleEdit = (template: Template) => {
    // In a real app, you would open an edit dialog with the template data
    toast.info('Edit functionality will be implemented in a future update');
    // For now, just show a toast message
  };

  const handleDuplicate = async (template: Template) => {
    try {
      // Create a duplicate template with a slightly modified name
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        status: 'pending' as 'approved' | 'pending' | 'rejected'
      };
      
      // Remove the id to create a new entry
      delete (duplicatedTemplate as any).id;
      delete (duplicatedTemplate as any).created_at;
      
      // Call the API to create the new template
      await updateTemplate(template.id, duplicatedTemplate);
      toast.success('Template duplicated successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    
    try {
      await deleteTemplate(selectedTemplate.id);
      toast.success('Template deleted successfully');
      setIsDeleteDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const openDeleteDialog = (template: Template) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.content && template.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || template.status === statusFilter;
    const matchesType = typeFilter === "all" || template.type === typeFilter;
    const matchesLanguage = languageFilter === "all" || template.language === languageFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesLanguage;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'rejected':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'media':
        return <Image className="h-4 w-4" />;
      case 'interactive':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getMediaTypeIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <File className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your WhatsApp Business message templates
          </p>
        </div>
        
        <CreateTemplateDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
          onSuccess={loadTemplates}
        />
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <p className="text-xs font-medium mb-1">Status</p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-xs font-medium mb-1">Type</p>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-xs font-medium mb-1">Language</p>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setLanguageFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing <b>{filteredTemplates.length}</b> of <b>{templates.length}</b> templates
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            View and manage your message templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No templates found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="font-medium cursor-pointer hover:text-blue-600">
                            {template.name}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 text-sm">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            <div className="text-muted-foreground break-words">
                              {template.content}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                        {getStatusIcon(template.status)}
                        <span className="ml-1 capitalize">{template.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(template.type)}
                        <span className="text-sm capitalize">{template.type}</span>
                        {template.media_type && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({template.media_type})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.language === 'en' ? 'English' : 
                       template.language === 'es' ? 'Spanish' : 
                       template.language === 'fr' ? 'French' : 
                       template.language === 'pt' ? 'Portuguese' : template.language}
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {template.last_used ? new Date(template.last_used).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(template)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => openDeleteDialog(template)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Preview Template Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Template Preview</SheetTitle>
            <SheetDescription>
              This is how your template will appear to recipients
            </SheetDescription>
          </SheetHeader>
          {selectedTemplate && (
            <div className="mt-6 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm">{selectedTemplate.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Status</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTemplate.status)}`}>
                  {getStatusIcon(selectedTemplate.status)}
                  <span className="ml-1 capitalize">{selectedTemplate.status}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Type</p>
                <div className="flex items-center gap-1.5">
                  {getTypeIcon(selectedTemplate.type)}
                  <span className="text-sm capitalize">{selectedTemplate.type}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Language</p>
                <p className="text-sm">{selectedTemplate.language === 'en' ? 'English' : selectedTemplate.language}</p>
              </div>
              
              {selectedTemplate.media_type && selectedTemplate.media_url && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Media</p>
                  <div className="flex items-center gap-1.5">
                    {getMediaTypeIcon(selectedTemplate.media_type)}
                    <span className="text-sm">{selectedTemplate.media_type}</span>
                  </div>
                  {selectedTemplate.media_type === 'image' && (
                    <div className="mt-2 border rounded overflow-hidden">
                      <img 
                        src={selectedTemplate.media_url} 
                        alt="Template media" 
                        className="max-h-40 w-auto mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Content</p>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm whitespace-pre-line">{selectedTemplate.content}</p>
                </div>
              </div>
              
              {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Buttons</p>
                  <div className="space-y-2">
                    {selectedTemplate.buttons.map((button, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <div className="font-medium text-sm">{button.text}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {button.type.replace('_', ' ')}
                          {button.value && ` • ${button.value}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              "{selectedTemplate?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;
