pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "@zk-email/contracts/DKIMRegistry.sol";
import "../src/ProofOfUSDC.sol";
import "../src/Verifier.sol";

contract CoinbaseUtilsTest is Test {
    using StringUtils for *;

    address constant VM_ADDR = 0x7109709ECfa91a80626fF3989D68f67F5b1DD12D; // Hardcoded address of the VM from foundry

    Verifier proofVerifier;
    DKIMRegistry dkimRegistry;
    ProofOfUSDC testVerifier;

    uint16 public constant packSize = 7;

    function setUp() public {
         console.log("running set up");
        address owner = vm.addr(1);

        vm.startPrank(owner);

        proofVerifier = new Verifier();
        dkimRegistry = new DKIMRegistry(owner);

        // These are the Poseidon hash of DKIM public keys for x.com
        // This was calcualted using https://github.com/zkemail/zk-email-verify/tree/main/packages/scripts
        dkimRegistry.setDKIMPublicKeyHash(
            "info.coinbase.com",
            0x05289f31a838d16aa64b8bd0519d7de1add46548299208c6cf81914c2bf2ee8b
        );

        testVerifier = new ProofOfUSDC(proofVerifier, dkimRegistry);

        vm.stopPrank();
    }

    // These proof and public input values are generated using scripts in packages/circuits/scripts/generate-proof.ts
    // The sample email in `/emls` is used as the input, but you will have different values if you generated your own zkeys
    function testVerifyTestEmail() public {
        uint256[5] memory publicSignals;
        publicSignals[
            0
        ] = 2333336841929832288695187135562794652748341581135245042999961983084532002443;
        publicSignals[1] = 909258290;
        publicSignals[2] = 21583661305191324841426121921777127372562589899224514570760757141952266060127;
        publicSignals[3] = 237100123279274017961777;
        publicSignals[4] = 333204821482021981323833993247527139185603938597;

        uint256[2] memory proof_a = [
            3057140071645463068803395666774085651410249239124489757693501812525173604418,
            20602774833663681228257066370150224823854434032258143485846081123147022628836
        ];
        // Note: you need to swap the order of the two elements in each subarray
        uint256[2][2] memory proof_b = [
            [
                17586084433881932154680876678821176747176209394575658089024092721957651673949,
                20891119060854986265334316727663345716947374747894896245947335948863617835160
            ],
            [
                19033337379368813633371780117963183408079052436433694044245060001133342723319,
                21220793086276706092286283335903567806024901247076895273354144292145147509111
            ]
        ];
        uint256[2] memory proof_c = [
            1642048984209998549334211057492506131155653089895231446647964692927514212591,
            5783711735484874085130588165840345538370825620768009369676076142668816436541
        ];

        uint256[8] memory proof = [
            proof_a[0],
            proof_a[1],
            proof_b[0][0],
            proof_b[0][1],
            proof_b[1][0],
            proof_b[1][1],
            proof_c[0],
            proof_c[1]
        ];

        // Test proof verification
        bool verified = proofVerifier.verifyProof(
            proof_a,
            proof_b,
            proof_c,
            publicSignals
        );
        assertEq(verified, true);

        // Test mint after spoofing msg.sender
        Vm vm = Vm(VM_ADDR);
        vm.startPrank(0x0000000000000000000000000000000000000001);
        testVerifier.mint(proof, publicSignals);
        vm.stopPrank();
    }

    function testSVG() public {
        testVerifyTestEmail();
        string memory svgValue = testVerifier.tokenURI(1);
        console.log(svgValue);
        assert(bytes(svgValue).length > 0);
    }

    function testChainID() public view {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        console.log(chainId);
        // Local chain, xdai, goerli, mainnet
        assert(
            chainId == 31337 || chainId == 100 || chainId == 5 || chainId == 1
        );
    }
}
