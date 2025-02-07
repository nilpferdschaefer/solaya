// closeBot.ts

import { getProgramInstanceEzVault } from "@/anchor/getProgramInstanceEzVault";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { toast } from "react-toastify";
import bs58 from "bs58";

/* ------------------------------------------------------------------
 * 1) Environment Variable Setup
 * ----------------------------------------------------------------*/
const HELIUS_URL = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
if (!HELIUS_URL) {
  console.warn(
    "Warning: Helius API key (NEXT_PUBLIC_RPC_ENDPOINT) not found. Priority fee estimates may fail."
  );
}

const RPC_URL = process.env.NEXT_PUBLIC_DEFAULT_RPC_UI;
if (!RPC_URL) {
  console.warn(
    "Warning: NEXT_PUBLIC_DEFAULT_RPC_UI is missing. Please set it in your environment or define a fallback."
  );
}

/**
 * Calls Helius's getPriorityFeeEstimate method, passing a Base58-serialized transaction.
 * @param transaction The (unsigned) Transaction object to analyze.
 * @returns The recommended priority fee (µ-lamports/compute unit).
 */
async function fetchHeliusFeeEstimateTx(
  transaction: Transaction
): Promise<number> {
  // // console.log('DEBUG: Helius URL:', HELIUS_URL);

  // 1) Serialize (unsigned) transaction to Base58
  const serializedUnsignedTx = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  const b58Tx = bs58.encode(serializedUnsignedTx);
  // // console.log('DEBUG: Base58 transaction length:', b58Tx.length);

  // 2) Build the request payload
  const payload = {
    jsonrpc: "2.0",
    id: "1",
    method: "getPriorityFeeEstimate",
    params: [
      {
        transaction: b58Tx,
        options: {
          priorityLevel: "High", // Could use 'Min', 'Low', 'Medium', etc.
          evaluateEmptySlotAsZero: true,
        },
      },
    ],
  };

  // // console.log('DEBUG: Helius request payload:', JSON.stringify(payload, null, 2));

  // 3) Make the request to Helius
  const response = await fetch(HELIUS_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Helius fee request failed with status ${response.status}`);
  }

  const data = await response.json();
  // // console.log('DEBUG: Helius response:', data);

  // 4) Extract the recommended fee
  let recommendedFee: number = data?.result?.priorityFeeEstimate ?? 0;
  // // console.log('DEBUG: Raw recommendedFee from Helius:', recommendedFee);

  // 5) Fallback if < 1
  if (recommendedFee < 1) {
    // // console.warn('DEBUG: Helius returned 0 or <1. Using fallback of 10,000 µ-lamports...');
    recommendedFee = 10_000;
  }

  // // console.log('DEBUG: Final recommendedFee (post-fallback):', recommendedFee);
  return recommendedFee;
}

/* ------------------------------------------------------------------
 * 2) closeBot Implementation
 * ----------------------------------------------------------------*/
export const closeBot = async (
  wallet: WalletContextState,
  ezvault: string,
  quoteToken: string,
  baseToken: string
): Promise<string> => {
  try {
    // A) Validate wallet
    const userPublicKey = wallet.publicKey;
    if (!userPublicKey) {
      throw new Error("Wallet not connected.");
    }
    if (!wallet.signTransaction) {
      throw new Error("Wallet does not support signing transactions.");
    }

    // B) Initialize connection & Anchor program
    const connection = new Connection(
      RPC_URL || "https://api.mainnet-beta.solana.com",
      "confirmed"
    );

    const program = getProgramInstanceEzVault(connection);

    // C) Convert string addresses to PublicKey
    const ezvaultPubKey = new PublicKey(ezvault);
    const quoteTokenPubKey = new PublicKey(quoteToken);
    const baseTokenPubKey = new PublicKey(baseToken);

    // D) Derive ATAs
    const ezvaultAtaQuote = await getAssociatedTokenAddress(
      quoteTokenPubKey,
      ezvaultPubKey,
      true
    );
    const targetAtaQuotePubKey = await getAssociatedTokenAddress(
      quoteTokenPubKey,
      userPublicKey
    );
    const ezvaultAtaBase = await getAssociatedTokenAddress(
      baseTokenPubKey,
      ezvaultPubKey,
      true
    );
    const targetAtaBasePubKey = await getAssociatedTokenAddress(
      baseTokenPubKey,
      userPublicKey
    );

    // ----------------------------------------------------------------------
    // F) Create ATAs If They Don’t Exist
    // ----------------------------------------------------------------------
    const createATAInstructions: any[] = [];
    const accountInfos = await connection.getMultipleAccountsInfo([
      ezvaultAtaBase,
      targetAtaQuotePubKey,
      targetAtaBasePubKey,
    ]);

    // If it doesn't exist, push a creation instruction
    if (!accountInfos[0]) {
      createATAInstructions.push(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          ezvaultAtaBase,
          ezvaultPubKey,
          baseTokenPubKey
        )
      );
    }
    if (!accountInfos[1]) {
      createATAInstructions.push(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          targetAtaQuotePubKey,
          userPublicKey,
          quoteTokenPubKey
        )
      );
    }
    if (!accountInfos[2]) {
      createATAInstructions.push(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          targetAtaBasePubKey,
          userPublicKey,
          baseTokenPubKey
        )
      );
    }

    // If any instructions are needed, create & send a single transaction
    if (createATAInstructions.length) {
      // // console.log('DEBUG: Need to create ATAs. Building and sending ATA Tx...');
      const ataTx = new Transaction().add(...createATAInstructions);
      ataTx.feePayer = userPublicKey;

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      ataTx.recentBlockhash = blockhash;

      // Sign & send
      const signedAtaTx = await wallet.signTransaction(ataTx);
      const ataTxid = await connection.sendRawTransaction(
        signedAtaTx.serialize(),
        { skipPreflight: false, preflightCommitment: "confirmed" }
      );
      // // console.log('DEBUG: Batch ATA creation TxID:', ataTxid);

      const ataConfirmation = await connection.confirmTransaction(
        ataTxid,
        "confirmed"
      );
      if (ataConfirmation.value.err) {
        // // console.error('DEBUG: ATA creation error:', ataConfirmation.value.err);
        throw new Error("Failed to create one or more ATAs.");
      }
      toast.success(`All necessary ATAs created. TxID: ${ataTxid}`);
    }

    // ----------------------------------------------------------------------
    // G) Build the EzVault `close` instruction
    // ----------------------------------------------------------------------
    const closeInstruction = await program.methods
      .close()
      .accounts({
        ezvault: ezvaultPubKey,
        payer: userPublicKey,
        closeAuthority: userPublicKey,
        quoteToken: quoteTokenPubKey,
        ezvaultAtaQuote: ezvaultAtaQuote,
        targetAtaQuote: targetAtaQuotePubKey,
        baseToken: baseTokenPubKey,
        ezvaultAtaBase: ezvaultAtaBase,
        targetAtaBase: targetAtaBasePubKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // ----------------------------------------------------------------------
    // H) Construct an (unsigned) transaction for Helius
    // ----------------------------------------------------------------------
    const transactionClose = new Transaction().add(closeInstruction);

    // Add a blockhash & feePayer to form a valid TX
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transactionClose.feePayer = userPublicKey;
    transactionClose.recentBlockhash = blockhash;

    // (Optional) Simulation code is already commented out in original:
    // const simResult = await connection.simulateTransaction(transactionClose);
    // if (simResult.value.err) throw new Error('Transaction simulation failed.');

    // ----------------------------------------------------------------------
    // I) Fetch recommended fee from Helius using the transaction
    // ----------------------------------------------------------------------
    const recommendedFee = await fetchHeliusFeeEstimateTx(transactionClose);
    // // console.log('DEBUG: recommendedFee from Helius:', recommendedFee);

    // ----------------------------------------------------------------------
    // J) Insert compute budget instructions AFTER we get the recommendedFee
    // ----------------------------------------------------------------------
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 4_000_000,
    });
    const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: recommendedFee,
    });

    transactionClose.add(computeBudgetIx).add(computeUnitPriceIx);

    // Sign with the user’s wallet
    const signedTransactionClose = await wallet.signTransaction(
      transactionClose
    );

    // Send and confirm
    // // console.log('DEBUG: Sending close transaction...');
    const txidClose = await connection.sendRawTransaction(
      signedTransactionClose.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );
    // // console.log('DEBUG: Close Bot Transaction ID:', txidClose);

    const confirmationClose = await connection.confirmTransaction(
      txidClose,
      "confirmed"
    );
    if (confirmationClose.value.err) {
      // // console.error('DEBUG: Transaction confirmation error:', confirmationClose.value.err);
      throw new Error("Close bot transaction failed.");
    }

    toast.success(`Bot closed successfully! TxID: ${txidClose}`);
    return txidClose;
  } catch (error: any) {
    console.error("Error in closeBot:", error);
    if (error?.logs) {
      console.error("Transaction Logs:", error.logs);
    }
    toast.error(`Failed to close bot: ${error.message}`);
    throw error;
  }
};
