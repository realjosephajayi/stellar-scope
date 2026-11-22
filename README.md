# stellar-scope

A safe TypeScript CLI for inspecting Stellar accounts and planning payments.

## Why this project?

Stellar developers often need a small diagnostic tool before writing a wallet or payment service. `stellar-scope` demonstrates typed Node.js development, Horizon API integration, validation, testable domain logic, and CI while keeping a deliberately safe boundary: it never accepts secret keys, signs transactions, or sends funds.

## Features

- Inspect an account's sequence number and balances through the Stellar Horizon API.
- Support both Stellar Testnet and Public Network.
- Format native XLM and issued assets consistently.
- Validate payment amounts and generate an unsigned payment plan.
- Run without a database or environment secrets.
- Include Vitest tests and GitHub Actions CI.

## Quick start

```bash
npm install
npm run check
npm run dev -- account G... --network testnet
npm run dev -- plan-payment G_SOURCE G_DESTINATION 10 --asset XLM
```

For a real account lookup, replace `G...` with a valid public Stellar address. Testnet is the default. The account command makes a network request; `plan-payment` is entirely local.

## Next steps

A natural extension would be an opt-in `submit-payment` command that loads a signing key from an external wallet or secure secret manager, requires explicit confirmation, and submits only on Testnet by default.

## License

MIT. See [LICENSE](LICENSE).

## Implementation

Built with TypeScript, Node.js, and the Stellar JavaScript SDK.
