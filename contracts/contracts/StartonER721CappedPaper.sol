pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@paperxyz/contracts/keyManager/IPaperKeyManager.sol";

import "./library/StartonERC721Capped.sol";

contract StartonERC721CappedPaper is StartonERC721Capped {
    using Counters for Counters.Counter;

    IPaperKeyManager _paperKeyManager;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri,
        uint256 tokenMaxSupply,
        address ownerOrMultiSigContract,
        address paperKeyManagerAddress
    ) StartonERC721Capped(name, symbol, baseUri, tokenMaxSupply, ownerOrMultiSigContract) {
        _paperKeyManager = IPaperKeyManager(paperKeyManagerAddress);
    }
    
    // onlyPaper modifier to easily restrict multiple different function
    modifier onlyPaper(
        bytes32 _hash,
        bytes32 nonce,
        bytes calldata signature
    ) {
        bool success = _paperKeyManager.verify(_hash, nonce, signature);
        require(success, "Failed to verify signature");
        _;
    }

    // Setup function to register the PaperKeyManager Token
    function registerPaperKey(address paperKey) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only Admin can register a PaperKeyManager Token.");
        require(_paperKeyManager.register(paperKey), "Error registering key");
    }

    // Paper.xyz only mint function
    function mintToPaper(
        address to,
        bytes32 nonce,
        bytes calldata signature
    ) external onlyPaper(keccak256(abi.encode(to)), nonce, signature) {
        uint256 ts = _tokenIdCounter.current();
        require(_isMintAllowed);
        require(ts < _maxSupply, "maxSupply: reached");

        _tokenIdCounter.increment();
        _safeMint(to, ts);
    }

    
    // Paper.xyz eligibility function for MintToPaper()
    function mintToPaperEligibility()
        external
        view
        returns (string memory)
    {
        if (_isMintAllowed == false) {
            return "Sale is not active";
        } else if (_tokenIdCounter.current() >= _maxSupply) {
            return "Purchase would exceed max tokens";
        } else {
            return "";
        }
    }
}