
import React from 'react';
import AdminHeader from './AdminHeader';
import AdminTable from './AdminTable';
import AdminFormDialog from './AdminFormDialog';
import AdminDeleteDialog from './AdminDeleteDialog';
import AdminRolesDialog from './AdminRolesDialog';
import { useAdminManagement } from '@/hooks/useAdminManagement';

const AdminManagement = () => {
  const {
    filteredAdmins,
    searchQuery,
    setSearchQuery,
    selectedAdmin,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isRolesDialogOpen,
    setIsRolesDialogOpen,
    avatarPreview,
    formData,
    handleInputChange,
    handleRoleChange,
    handleTagSelect,
    handleJoinDateChange,
    handleRenewalDateChange,
    handleAvatarChange,
    handleAddAdmin,
    handleEditAdmin,
    handleDeleteAdmin,
    handleSuspendAdmin,
    resetForm,
    editAdmin,
    confirmDeleteAdmin,
    manageRoles
  } = useAdminManagement();

  return (
    <div className="space-y-4">
      <AdminHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddAdmin={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
      />
      
      <AdminTable 
        admins={filteredAdmins}
        onEdit={editAdmin}
        onDelete={confirmDeleteAdmin}
        onManageRoles={manageRoles}
        onSuspend={handleSuspendAdmin}
      />
      
      <AdminFormDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        avatarPreview={avatarPreview}
        isEdit={false}
        onInputChange={handleInputChange}
        onRoleChange={handleRoleChange}
        onTagSelect={handleTagSelect}
        onJoinDateChange={handleJoinDateChange}
        onRenewalDateChange={handleRenewalDateChange}
        onAvatarChange={handleAvatarChange}
        onSubmit={handleAddAdmin}
      />
      
      <AdminFormDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        avatarPreview={avatarPreview}
        isEdit={true}
        onInputChange={handleInputChange}
        onRoleChange={handleRoleChange}
        onTagSelect={handleTagSelect}
        onJoinDateChange={handleJoinDateChange}
        onRenewalDateChange={handleRenewalDateChange}
        onAvatarChange={handleAvatarChange}
        onSubmit={handleEditAdmin}
      />
      
      <AdminDeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        admin={selectedAdmin}
        onConfirm={handleDeleteAdmin}
      />
      
      <AdminRolesDialog 
        open={isRolesDialogOpen}
        onOpenChange={setIsRolesDialogOpen}
        admin={selectedAdmin}
        role={formData.role}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
};

export default AdminManagement;
