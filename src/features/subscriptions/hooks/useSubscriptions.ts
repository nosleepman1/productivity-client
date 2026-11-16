import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  subscriptionsApi,
  type InitiatePaymentPayload,
} from "../api/subscriptions.api";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  plans: ["subscriptions", "plans"] as const,
  me: ["subscriptions", "me"] as const,
  methods: ["subscriptions", "methods"] as const,
};

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: () => subscriptionsApi.getPlans(),
    staleTime: 60_000,
  });
}

export function useMySubscription(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.me,
    queryFn: () => subscriptionsApi.getMySubscription(),
    enabled,
    staleTime: 20_000,
  });
}

export function usePaymentMethods(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.methods,
    queryFn: () => subscriptionsApi.getPaymentMethods(),
    enabled,
    staleTime: 60_000,
  });
}

export function useInitiatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) =>
      subscriptionsApi.initiatePayment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.me });
    },
  });
}

export function useTodayQuote() {
  return useQuery({
    queryKey: ["quotes", "today"],
    queryFn: () => subscriptionsApi.getTodayQuote(),
    staleTime: 1000 * 60 * 30,
  });
}
