export interface BalanceLine {
  asset: string;
  balance: string;
  limit: string | null;
  isNative: boolean;
}

export interface PaymentPlan {
  network: "testnet" | "public";
  source: string;
  destination: string;
  asset: string;
  amount: string;
  memo: string | null;
  warning: string;
}

export function assetLabel(assetType: string, assetCode?: string, assetIssuer?: string): string {
  if (assetType === "native") return "XLM";
  return `${assetCode ?? "UNKNOWN"}:${assetIssuer ?? "UNKNOWN"}`;
}

export function toBalanceLines(records: Array<Record<string, string | undefined>>): BalanceLine[] {
  return records.map((record) => ({
    asset: assetLabel(record.asset_type ?? "", record.asset_code, record.asset_issuer),
    balance: record.balance ?? "0",
    limit: record.limit ?? null,
    isNative: record.asset_type === "native",
  }));
}

export function validateAmount(value: string): string {
  if (!/^\d+(\.\d{1,7})?$/.test(value) || Number(value) <= 0) {
    throw new Error("Amount must be a positive number with at most 7 decimal places.");
  }
  return value;
}

export function makePaymentPlan(input: Omit<PaymentPlan, "warning">): PaymentPlan {
  validateAmount(input.amount);
  if (input.source === input.destination) throw new Error("Source and destination must be different accounts.");
  return {
    ...input,
    warning: "Planning only: no transaction was signed or submitted.",
  };
}

// Read-only Stellar account inspection and payment planning utilities.
