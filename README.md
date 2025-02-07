This repository contains the IDL corresponding to the deployed Solaya vaults program with ID

`EEZZatWNPPsihctMcbmSSSHc5VjMbiSNGBKhyCprzYVo`

The IDL contains a single endpoint, "close", that allows the a close vault instruction to be generating in an emergency if the solaya.io website is not functional.

The close vault instruction can be signed by the creator of the bot or the bot private key itself.

When closing the bot, both base and quote token balances are released in full to the creator wallet. Any Solana rent from the vault will also be refunded to the creator.

A command line client will be added in due course.
