export type Vault = {
  version: "0.0.0";
  name: "vault";
  instructions: [
    {
      name: "close";
      accounts: [
        {
          name: "ezvault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "closeAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "quoteToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ezvaultAtaQuote";
          isMut: true;
          isSigner: false;
        },
        {
          name: "targetAtaQuote";
          isMut: true;
          isSigner: false;
        },
        {
          name: "baseToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ezvaultAtaBase";
          isMut: true;
          isSigner: false;
        },
        {
          name: "targetAtaBase";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "ezVault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "closeAuthority";
            type: "publicKey";
          },
          {
            name: "withdrawAuthority";
            docs: [
              "withdraw authority is allowed to withdraw <base> / <quote> amounts from the vault",
              "withdraw authority is also allowed to close the vault",
              "however when closing the vault all proceeds will be sent to close_authority"
            ];
            type: "publicKey";
          },
          {
            name: "baseToken";
            type: "publicKey";
          },
          {
            name: "quoteToken";
            type: "publicKey";
          },
          {
            name: "totalWithdrawalAmountBase";
            type: "u64";
          },
          {
            name: "totalDepositAmountBase";
            type: "u64";
          },
          {
            name: "totalWithdrawalAmountQuote";
            type: "u64";
          },
          {
            name: "totalDepositAmountQuote";
            type: "u64";
          },
          {
            name: "expectedBalanceBase";
            type: "u64";
          },
          {
            name: "expectedBalanceQuote";
            type: "u64";
          },
          {
            name: "totalWithdrawalCountBase";
            type: "u64";
          },
          {
            name: "totalWithdrawalCountQuote";
            type: "u64";
          },
          {
            name: "totalDepositCountBase";
            type: "u64";
          },
          {
            name: "totalDepositCountQuote";
            type: "u64";
          },
          {
            name: "version";
            type: "u64";
          },
          {
            name: "seed";
            type: "publicKey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "lookupTableAddress";
            type: "publicKey";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 68];
            };
          },
          {
            name: "totalDepositAmountBaseByCloseAuthority";
            type: "u64";
          },
          {
            name: "totalDepositAmountQuoteByCloseAuthority";
            type: "u64";
          },
          {
            name: "totalWithdrawalAmountBaseByCloseAuthority";
            type: "u64";
          },
          {
            name: "totalWithdrawalAmountQuoteByCloseAuthority";
            type: "u64";
          }
        ];
      };
    }
  ];
  types: [];
  events: [];
  errors: [];
};

export const IDL: Vault = {
  version: "0.0.0",
  name: "vault",
  instructions: [
    {
      name: "close",
      accounts: [
        {
          name: "ezvault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "closeAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "quoteToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ezvaultAtaQuote",
          isMut: true,
          isSigner: false,
        },
        {
          name: "targetAtaQuote",
          isMut: true,
          isSigner: false,
        },
        {
          name: "baseToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ezvaultAtaBase",
          isMut: true,
          isSigner: false,
        },
        {
          name: "targetAtaBase",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "ezVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "closeAuthority",
            type: "publicKey",
          },
          {
            name: "withdrawAuthority",
            docs: [
              "withdraw authority is allowed to withdraw <base> / <quote> amounts from the vault",
              "withdraw authority is also allowed to close the vault",
              "however when closing the vault all proceeds will be sent to close_authority",
            ],
            type: "publicKey",
          },
          {
            name: "baseToken",
            type: "publicKey",
          },
          {
            name: "quoteToken",
            type: "publicKey",
          },
          {
            name: "totalWithdrawalAmountBase",
            type: "u64",
          },
          {
            name: "totalDepositAmountBase",
            type: "u64",
          },
          {
            name: "totalWithdrawalAmountQuote",
            type: "u64",
          },
          {
            name: "totalDepositAmountQuote",
            type: "u64",
          },
          {
            name: "expectedBalanceBase",
            type: "u64",
          },
          {
            name: "expectedBalanceQuote",
            type: "u64",
          },
          {
            name: "totalWithdrawalCountBase",
            type: "u64",
          },
          {
            name: "totalWithdrawalCountQuote",
            type: "u64",
          },
          {
            name: "totalDepositCountBase",
            type: "u64",
          },
          {
            name: "totalDepositCountQuote",
            type: "u64",
          },
          {
            name: "version",
            type: "u64",
          },
          {
            name: "seed",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "lookupTableAddress",
            type: "publicKey",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 68],
            },
          },
          {
            name: "totalDepositAmountBaseByCloseAuthority",
            type: "u64",
          },
          {
            name: "totalDepositAmountQuoteByCloseAuthority",
            type: "u64",
          },
          {
            name: "totalWithdrawalAmountBaseByCloseAuthority",
            type: "u64",
          },
          {
            name: "totalWithdrawalAmountQuoteByCloseAuthority",
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [],
  events: [],
  errors: [],
};
