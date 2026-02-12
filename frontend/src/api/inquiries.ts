import api from "./client";

export type InquiryStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | string;

export type InquiryServiceType =
  | "VISA_APPLICATION"
  | "TOURISM_PACKAGE"
  | "CONSULTATION"
  | "DOCUMENT_REVIEW"
  | "TRANSLATION_SERVICE"
  | string;

export interface InquiryUser {
  id: string;
  name: string;
  email: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceType: InquiryServiceType;
  status: InquiryStatus;
  adminNotes?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: InquiryUser;
}

export interface CreateInquiryInput {
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceType: InquiryServiceType;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type InquiryListResponse = {
  data: InquiryItem[];
  pagination: PaginationMeta;
};

export const createInquiry = async (
  payload: CreateInquiryInput,
): Promise<{ id: string; status: InquiryStatus; createdAt: string }> => {
  const res = await api.post("/api/inquiry", payload);
  return res.data?.data;
};

export const fetchMyInquiries = async (
  params?: Partial<{ page: number; limit: number; sortOrder: "asc" | "desc" }>,
): Promise<InquiryListResponse> => {
  const res = await api.get("/api/inquiries/user", { params });
  return {
    data: (res.data?.data || []) as InquiryItem[],
    pagination: res.data?.pagination as PaginationMeta,
  };
};

export const fetchAdminInquiries = async (
  params?: Partial<{
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    status: InquiryStatus;
    serviceType: InquiryServiceType;
  }>,
): Promise<InquiryListResponse> => {
  const res = await api.get("/api/admin/inquiries", { params });
  return {
    data: (res.data?.data || []) as InquiryItem[],
    pagination: res.data?.pagination as PaginationMeta,
  };
};

export const updateAdminInquiryStatus = async (
  id: string,
  payload: { status: InquiryStatus; adminNotes?: string },
): Promise<InquiryItem> => {
  const res = await api.put(`/api/admin/inquiries/${id}/status`, payload);
  return res.data?.data as InquiryItem;
};
