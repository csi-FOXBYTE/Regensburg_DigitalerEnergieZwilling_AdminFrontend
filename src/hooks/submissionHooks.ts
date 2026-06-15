import {
  deleteApiAdminSubmissionsSubmissionId,
  deleteApiAdminSubmissionsSubmissionIdAssignment,
  getApiAdminSubmissions,
  getApiAdminSubmissionsSubmissionId,
  patchApiAdminSubmissionsSubmissionIdAssignment,
  postApiAdminSubmissionsSubmissionIdAccept,
  postApiAdminSubmissionsSubmissionIdDecline,
  type GetApiAdminSubmissionsParams,
} from "@/api/api.gen";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSubmissions(params?: GetApiAdminSubmissionsParams) {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: () => getApiAdminSubmissions(params),
  });
}

export function useSubmission(submissionId: string) {
  return useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => getApiAdminSubmissionsSubmissionId(submissionId),
    enabled: !!submissionId,
  });
}

export function useDeleteSubmission() {
  return useMutation({
    mutationFn: ({ submissionId }: { submissionId: string }) =>
      deleteApiAdminSubmissionsSubmissionId(submissionId),
  });
}

export function useAssignSubmission() {
  return useMutation({
    mutationFn: ({
      submissionId,
      userId,
    }: {
      submissionId: string;
      userId: string;
    }) =>
      patchApiAdminSubmissionsSubmissionIdAssignment(submissionId, { userId }),
  });
}

export function useUnassignSubmission() {
  return useMutation({
    mutationFn: ({ submissionId }: { submissionId: string }) =>
      deleteApiAdminSubmissionsSubmissionIdAssignment(submissionId),
  });
}

export function useAcceptSubmission() {
  return useMutation({
    mutationFn: ({ submissionId }: { submissionId: string }) =>
      postApiAdminSubmissionsSubmissionIdAccept(submissionId),
  });
}

export function useDeclineSubmission() {
  return useMutation({
    mutationFn: ({ submissionId }: { submissionId: string }) =>
      postApiAdminSubmissionsSubmissionIdDecline(submissionId),
  });
}
