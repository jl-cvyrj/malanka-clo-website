import type { Order } from "@/lib/api/types";

/** Session key used to hand the just-created order to the success screen. */
export const LAST_ORDER_KEY = "malanka.lastOrder";

export function saveLastOrder(order: Order): void {
  try {
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore storage failures
  }
}

export function readLastOrder(): Order | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}
