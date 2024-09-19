// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@zk-email/contracts/DKIMRegistry.sol";
import "@zk-email/contracts/utils/StringUtils.sol";
import "./utils/NFTSVG.sol";
import { Verifier } from "./Verifier.sol";


contract ProofOfTwitter is ERC721Enumerable {
    using StringUtils for *;
    using NFTSVG for *;

    uint16 public constant bytesInPackedBytes = 31;
    string constant domain = "info.coinbase.com";
    
    uint32 public constant pubKeyHashIndexInSignals = 0; // index of DKIM public key hash in signals array
    uint32 public constant usernameIndexInSignals = 1; // index of first packed twitter username in signals array
    uint32 public constant usernameLengthInSignals = 1; // length of packed twitter username in signals array
    uint32 public constant toAddressIndexInSignals = 2; // index of packed toAddress in signals array
    uint32 public constant toAddressLengthInSignals = 9 // length of packed toAddress in signals array
    uint32 public constant timestampIndexInSignals = 3;
    uint32 public constant timestampLengthInSignals = 1;
    uint32 public constant addressIndexInSignals = 4; // index of ethereum address in signals array

    uint256 private tokenCounter;
    DKIMRegistry dkimRegistry;
    Verifier public immutable verifier;

    mapping(uint256 => string) public tokenIDToName;
    mapping(bytes32 => bool) public hasMinted;

    constructor(Verifier v, DKIMRegistry d) ERC721("VerifiedEmail", "VerifiedEmail") {
        verifier = v;
        dkimRegistry = d;
    }

    function tokenDesc(uint256 tokenId) public view returns (string memory) {
        string memory twitter_username = tokenIDToName[tokenId];
        address address_owner = ownerOf(tokenId);
        string memory result = string(
            abi.encodePacked(StringUtils.toString(address_owner), "earned", twitter_username, "USDC")
        );
        return result;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory username = tokenIDToName[tokenId];
        address owner = ownerOf(tokenId);
        return NFTSVG.constructAndReturnSVG(username, tokenId, owner);
    }

    function _domainCheck(uint256[] memory headerSignals) public pure returns (bool) {
        string memory senderBytes = StringUtils.convertPackedBytesToString(headerSignals, 18, bytesInPackedBytes);
        string[1] memory domainStrings = ["no-reply@info.coinbase.com"];
        return StringUtils.stringEq(senderBytes, domainStrings[0]);
        // Usage: require(_domainCheck(senderBytes, domainStrings), "Invalid domain");
    }

    /// Mint a token proving twitter ownership by verifying proof of email
    /// @param proof ZK proof of the circuit - a[2], b[4] and c[2] encoded in series
    /// @param signals Public signals of the circuit. First item is pubkey_hash, next 3 are twitter username, the last one is etherum address
    function mint(uint256[8] memory proof, uint256[3] memory signals) public {
        // TODO no invalid signal check yet, which is fine since the zk proof does it
        // Checks: Verify proof and check signals
        // require(signals[0] == 1337, "invalid signals");

        // public signals are the masked packed message bytes, and hash of public key.

        // Check eth address committed to in proof matches msg.sender, to avoid replayability
        // require(address(uint160(signals[addressIndexInSignals])) == msg.sender, "Invalid address");

        // Check from/to email domains are correct [in this case, only from domain is checked]
        // Right now, we just check that any email was received from anyone at Twitter, which is good enough for now
        // We will upload the version with these domain checks soon!
        // require(_domainCheck(headerSignals), "Invalid domain");

        // Verify the DKIM public key hash stored on-chain matches the one used in circuit
        bytes32 dkimPublicKeyHashInCircuit = bytes32(signals[pubKeyHashIndexInSignals]);
        require(dkimRegistry.isDKIMPublicKeyHashValid(domain, dkimPublicKeyHashInCircuit), "invalid dkim signature"); 

        // Verify RSA and proof
        require(
            verifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                signals
            ),
            "Invalid Proof"
        );

        // Extract the timestamp chunks from the signals
        uint256[] memory timestampPack = new uint256[](timestampLengthInSignals);
        for (uint256 i = timestampIndexInSignals; i < (timestampIndexInSignals + timestampLengthInSignals); i++) {
            timestampPack[i - timestampIndexInSignals] = signals[i];
        }
        
        // Unpack the timestamp
        uint256 timestamp = StringUtils.unpackTimestamp(timestampPack);

        // Extract the toAddress chunks from the signals
        uint256[] memory toAddressPack = new uint256[](toAddressLengthInSignals);
        for (uint256 i = toAddressIndexInSignals; i < (toAddressIndexInSignals + toAddressLengthInSignals); i++) {
            toAddressPack[i - toAddressIndexInSignals] = signals[i];
        }

        // Convert the packed address signals into a single address
        bytes32 toAddressBytes = StringUtils.convertPackedBytesToBytes32(toAddressPack);
        address toAddress = address(uint160(uint256(toAddressBytes)));

        // Hash the timestamp and toAddress to keep them private
        bytes32 hashedToAddressAndTimestamp = keccak256(abi.encodePacked(toAddress, timestamp));
        
        // Check if this hashed combination has already minted an NFT
        require(!hasMinted[hashedToAddressAndTimestamp], "This address and timestamp combination has already minted an NFT.");


        // Extract the username chunks from the signals
        uint256[] memory usernamePack = new uint256[](usernameLengthInSignals);
        for (uint256 i = usernameIndexInSignals; i < (usernameIndexInSignals + usernameLengthInSignals); i++) {
            usernamePack[i - usernameIndexInSignals] = signals[i];
        }

        // Combine the usernamePack and timestampPack into one array
        uint256[] memory combinedPack = new uint256[](usernameLengthInSignals + timestampLengthInSignals);
        for (uint256 i = 0; i < usernameLengthInSignals; i++) {
            combinedPack[i] = usernamePack[i];
        }
        for (uint256 i = 0; i < timestampLengthInSignals; i++) {
            combinedPack[usernameLengthInSignals + i] = timestampPack[i];
        }

        // Effects: Mint token
        uint256 tokenId = tokenCounter + 1;

        // Convert the combined username and timestamp into a string using StringUtils
        string memory messageBytes = StringUtils.convertPackedBytesToString(
            combinedPack,
            bytesInPackedBytes * (usernameLengthInSignals + timestampLengthInSignals),
            bytesInPackedBytes
        );
        tokenIDToName[tokenId] = messageBytes;
        _mint(msg.sender, tokenId);
        tokenCounter = tokenCounter + 1;

        // Mark this hashed address as having minted an NFT
        hasMinted[hashedToAddressAndTimestamp] = true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(
            from == address(0),
            "Cannot transfer - VerifiedEmail is soulbound"
        );
    }
}
