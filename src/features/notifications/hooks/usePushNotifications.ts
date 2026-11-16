import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pushService } from "@/services/push/push.service";
import { useToastStore } from "@/store/toast.store";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Hook gérant l'état et l'abonnement Web Push PWA sur l'appareil courant.
 */
export function usePushNotifications() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const isSecureContext =
    typeof window !== "undefined" ? window.isSecureContext : false;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "default",
  );

  const statusQuery = useQuery({
    queryKey: ["push", "status"],
    queryFn: () => pushService.getStatus(),
    staleTime: 60_000,
  });

  const localSubQuery = useQuery({
    queryKey: ["push", "local-subscription"],
    queryFn: async () => {
      if (!isSupported || !isSecureContext) return false;
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        return Boolean(sub);
      } catch {
        return false;
      }
    },
    staleTime: 30_000,
  });

  const isSubscribed = localSubQuery.data ?? false;

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!isSupported) {
        throw new Error("Ce navigateur ne supporte pas les notifications Push.");
      }
      if (!isSecureContext) {
        throw new Error(
          "HTTPS requis (ou localhost) pour activer les notifications Push.",
        );
      }
      const publicKey = statusQuery.data?.publicKey;
      if (!publicKey) {
        throw new Error("Clé VAPID serveur non configurée.");
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        throw new Error("Permission de notification refusée.");
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.update().catch(() => undefined);
      const existing = await registration.pushManager.getSubscription();
      const sub =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Abonnement Push incomplet.");
      }

      await pushService.subscribe({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
        userAgent: navigator.userAgent,
      });

      return true;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["push"] });
      pushToast({
        variant: "success",
        title: "Notifications Push activées sur cet appareil.",
      });
    },
    onError: (err: Error) => {
      pushToast({
        variant: "error",
        title: err.message || "Impossible d'activer les notifications Push.",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!isSupported) return;
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await pushService.unsubscribe(sub.endpoint).catch(() => undefined);
        await sub.unsubscribe();
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["push"] });
      pushToast({
        variant: "info",
        title: "Notifications Push désactivées sur cet appareil.",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: () => pushService.sendTest(),
    onSuccess: (res) => {
      if (res.sent > 0) {
        pushToast({
          variant: "success",
          title: `Notification test envoyée (${res.sent} appareil${res.sent > 1 ? "s" : ""}).`,
        });
      } else {
        pushToast({
          variant: "info",
          title: "Aucun appareil actif trouvé pour recevoir la notification.",
        });
      }
    },
    onError: () => {
      pushToast({
        variant: "error",
        title: "Erreur lors de l'envoi de la notification test.",
      });
    },
  });

  return {
    isSupported,
    isSecureContext,
    permission,
    isSubscribed,
    serverConfigured: statusQuery.data?.configured ?? false,
    subscriptionCount: statusQuery.data?.subscriptionCount ?? 0,
    isPending:
      subscribeMutation.isPending ||
      unsubscribeMutation.isPending ||
      testMutation.isPending,
    enable: () => subscribeMutation.mutate(),
    disable: () => unsubscribeMutation.mutate(),
    sendTest: () => testMutation.mutate(),
  };
}
