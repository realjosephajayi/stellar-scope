import { describe, expect, it } from "vitest";
import { assetLabel, makePaymentPlan, toBalanceLines, validateAmount } from "../src/core.js";

describe("Stellar asset formatting", () => {
  it("labels native XLM balances", () => expect(assetLabel("native")).toBe("XLM"));
  it("labels issued assets with issuer", () => expect(assetLabel("credit_alphanum4", "USDC", "GISSUER")).toBe("USDC:GISSUER"));
  it("maps Horizon balance records", () => {
    expect(toBalanceLines([{ asset_type: "native", balance: "12.5" }])).toEqual([{ asset: "XLM", balance: "12.5", limit: null, isNative: true }]);
  });
});

describe("Payment planning", () => {
  it("returns a safe, unsigned plan", () => {
    expect(makePaymentPlan({ network: "testnet", source: "GA", destination: "GB", asset: "XLM", amount: "1.25", memo: null })).toMatchObject({ amount: "1.25", warning: expect.stringContaining("no transaction") });
  });
  it("rejects invalid amounts", () => expect(() => validateAmount("0")).toThrow());
  it("rejects the same source and destination", () => expect(() => makePaymentPlan({ network: "testnet", source: "GA", destination: "GA", asset: "XLM", amount: "1", memo: null })).toThrow());
});
