
import React from "react";
import { TableBody, Table } from "@/components/ui/table";
import { ServiceRequestRow } from "./table/ServiceRequestRow";
import { ServiceRequestTableHeader } from "./table/ServiceRequestTableHeader";
import { ServiceRequestDetail } from "./ServiceRequestDetail";
import { ActivityDialog } from "./dialog/ActivityDialog";
import { EditDialog } from "./dialog/EditDialog";
import { DeleteDialog } from "./dialog/DeleteDialog";
import { LoadingState } from "./table/LoadingState";
import { ErrorState } from "./table/ErrorState";
import { EmptyState } from "./table/EmptyState";
import { useServiceRequestTable } from "./state/useServiceRequestTable";

export function ServiceRequestTable() {
  const {
    serviceRequests,
    isLoading,
    isError,
    selectedRequest,
    setSelectedRequest,
    isActivityFormOpen,
    setIsActivityFormOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedRequestData,
    setSelectedRequestData,
    isDetailOpen,
    setIsDetailOpen,
    selectedDetailRequest,
    handleActivitySuccess,
    handleEditRequest,
    handleDeleteRequest,
    confirmDelete,
    handleOpenDetail,
    handleViewActivities,
    handleAddActivity,
    handleStatusChange,
    handleDownloadAttachment,
    statusOptions
  } = useServiceRequestTable();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (!serviceRequests || serviceRequests.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <Table>
        <ServiceRequestTableHeader />
        <TableBody>
          {serviceRequests?.map((request) => (
            <ServiceRequestRow
              key={request.id}
              request={request}
              onOpenDetail={handleOpenDetail}
              onStatusChange={handleStatusChange}
              onViewActivities={handleViewActivities}
              onAddActivity={handleAddActivity}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onDownloadAttachment={handleDownloadAttachment}
              statusOptions={statusOptions}
            />
          ))}
        </TableBody>
      </Table>

      <ServiceRequestDetail 
        serviceRequest={selectedDetailRequest}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <ActivityDialog 
        isOpen={selectedRequest !== null && !isEditModalOpen}
        selectedRequest={selectedRequest}
        isActivityFormOpen={isActivityFormOpen}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        setActivityFormOpen={setIsActivityFormOpen}
        onActivitySuccess={handleActivitySuccess}
        serviceRequests={serviceRequests || []}
      />

      <EditDialog 
        isOpen={isEditModalOpen}
        selectedRequestData={selectedRequestData}
        onOpenChange={setIsEditModalOpen}
        onSetSelectedRequestData={setSelectedRequestData}
      />

      <DeleteDialog 
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onSetSelectedRequestData={setSelectedRequestData}
        onConfirmDelete={confirmDelete}
      />
    </>
  );
}
