import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Config } from "../../payload-types";

// Basic Payload response types
export interface PayloadPagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface PayloadListResponse<T> {
  docs: T[];
  pagination: PayloadPagination;
}

export interface PayloadDocumentResponse<T> {
  doc: T;
}

export interface PayloadDeleteResponse {
  id: string;
  message: string;
}

// Query params type
export interface PayloadQueryParams {
  depth?: number;
  page?: number;
  limit?: number;
  sort?: string;
  where?: Record<string, any>;
}

// Generic hook for fetching a list of documents from a collection
export function usePayloadList<T extends keyof Config["collections"]>(
  collection: T,
  params?: PayloadQueryParams,
  options?: any
) {
  const queryKey = [collection, "list", params];

  return useQuery<PayloadListResponse<Config["collections"][T]>>({
    queryKey,
    queryFn: () =>
      apiClient.get<PayloadListResponse<Config["collections"][T]>>(
        `/${collection}`,
        params
      ),
    ...options,
  });
}

// Hook for fetching a single document by ID
export function usePayloadDoc<T extends keyof Config["collections"]>(
  collection: T,
  id: string | null | undefined,
  params?: PayloadQueryParams,
  options?: any
) {
  const queryKey = [collection, "document", id, params];

  return useQuery<PayloadDocumentResponse<Config["collections"][T]>>({
    queryKey,
    queryFn: () =>
      apiClient.get<PayloadDocumentResponse<Config["collections"][T]>>(
        `/${collection}/${id}`,
        params
      ),
    enabled: !!id,
    ...options,
  });
}

// Hook for creating a document
export function usePayloadCreate<T extends keyof Config["collections"]>(
  collection: T
) {
  const queryClient = useQueryClient();

  return useMutation<
    PayloadDocumentResponse<Config["collections"][T]>,
    Error,
    any
  >({
    mutationFn: (data) =>
      apiClient.post<PayloadDocumentResponse<Config["collections"][T]>>(
        `/${collection}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collection, "list"] });
    },
  });
}

// Hook for updating a document
export function usePayloadUpdate<T extends keyof Config["collections"]>(
  collection: T
) {
  const queryClient = useQueryClient();

  return useMutation<
    PayloadDocumentResponse<Config["collections"][T]>,
    Error,
    { id: string; data: any }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.put<PayloadDocumentResponse<Config["collections"][T]>>(
        `/${collection}/${id}`,
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [collection, "document", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: [collection, "list"] });
    },
  });
}

// Hook for deleting a document
export function usePayloadDelete(collection: string) {
  const queryClient = useQueryClient();

  return useMutation<PayloadDeleteResponse, Error, string>({
    mutationFn: (id) =>
      apiClient.delete<PayloadDeleteResponse>(`/${collection}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [collection, "document", id] });
      queryClient.invalidateQueries({ queryKey: [collection, "list"] });
    },
  });
}

// Hook for custom operations
export function usePayloadCustomQuery<T>(
  queryKey: QueryKey,
  endpoint: string,
  params?: Record<string, any>,
  options?: any
) {
  return useQuery<T>({
    queryKey,
    queryFn: () => apiClient.get<T>(endpoint, params),
    ...options,
  });
}

export function usePayloadCustomMutation<TData, TVariables = any>(
  endpoint: string,
  options?: any
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => apiClient.post<TData>(endpoint, variables),
    ...options,
  });
}
