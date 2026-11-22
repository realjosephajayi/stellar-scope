#!/usr/bin/env node
import { Horizon } from "@stellar/stellar-sdk";
import { makePaymentPlan, toBalanceLines } from "./core.js";

const TESTNET_HORIZON = "https://horizon-testnet.stellar.org";
const PUBLIC_HORIZON = "https://horizon.stellar.org";

type NetworkName = "testnet" | "public";

function usage(): never {
  console.log(`stellar-scope — inspect Stellar accounts safely

USAGE
  stellar-scope account <G...> [--network testnet|public]
  stellar-scope plan-payment <source> <destination> <amount> [--asset XLM] [--network testnet|public]
  stellar-scope help

Examples
  stellar-scope account GABC...
  stellar-scope account GABC... --network public
  stellar-scope plan-payment GAAA... GBBB... 10 --asset XLM

The CLI performs read-only account lookups. plan-payment validates inputs and prints a plan;
it never handles secret keys, signs transactions, or sends funds.`);
  process.exit(0);
}

function option(args: string[], name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

function networkFrom(args: string[]): NetworkName {
  const network = option(args, "--network", "testnet");
  if (network !== "testnet" && network !== "public") throw new Error("Network must be testnet or public.");
  return network;
}

function serverFor(network: NetworkName): Horizon.Server {
  return new Horizon.Server(network === "testnet" ? TESTNET_HORIZON : PUBLIC_HORIZON);
}

async function inspectAccount(address: string, network: NetworkName): Promise<void> {
  const account = await serverFor(network).loadAccount(address);
  const records = account.balances.map((balance) => ({
    asset_type: balance.asset_type,
    asset_code: "asset_code" in balance ? balance.asset_code : undefined,
    asset_issuer: "asset_issuer" in balance ? balance.asset_issuer : undefined,
    balance: balance.balance,
    limit: "limit" in balance ? balance.limit : undefined,
  }));
  console.log(JSON.stringify({
    network,
    account: account.accountId(),
    sequence: account.sequence,
    balances: toBalanceLines(records),
  }, null, 2));
}

function planPayment(args: string[]): void {
  const source = args[0];
  const destination = args[1];
  const amount = args[2];
  if (!source || !destination || !amount) throw new Error("plan-payment requires source, destination, and amount.");
  const network = networkFrom(args);
  const asset = option(args, "--asset", "XLM");
  const plan = makePaymentPlan({ source, destination, amount, asset, network, memo: null });
  console.log(JSON.stringify(plan, null, 2));
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help") usage();
  const network = networkFrom(args);
  if (command === "account") {
    const address = args[0];
    if (!address) throw new Error("account requires a Stellar public address.");
    await inspectAccount(address, network);
    return;
  }
  if (command === "plan-payment") {
    planPayment(args);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
