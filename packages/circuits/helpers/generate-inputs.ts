import { bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";

export const STRING_PRESELECTOR = "You received ";

export type ITwitterCircuitInputs = {
  twitterUsernameIndex: string;
  address: string;
  emailHeader: string[];
  emailHeaderLength: string;
  pubkey: string[];
  signature: string[];
  emailBody?: string[] | undefined;
  emailBodyLength?: string | undefined;
  precomputedSHA?: string[] | undefined;
  bodyHashIndex?: string | undefined;
};

export async function generateTwitterVerifierCircuitInputs(
  email: string | Buffer,
  ethereumAddress: string
): Promise<ITwitterCircuitInputs> {
  const emailVerifierInputs = await generateEmailVerifierInputs(email, {
    ignoreBodyHashCheck: true,
    shaPrecomputeSelector: STRING_PRESELECTOR,
  });

  const headerRemaining = emailVerifierInputs.emailHeader!.map((c) => Number(c)); // Char array to Uint8Array
  const selectorBuffer = Buffer.from(STRING_PRESELECTOR);
  const usernameIndex =
    Buffer.from(headerRemaining).indexOf(selectorBuffer) + selectorBuffer.length;

  const address = bytesToBigInt(fromHex(ethereumAddress)).toString();

  return {
    ...emailVerifierInputs,
    twitterUsernameIndex: usernameIndex.toString(),
    address,
  };
}
