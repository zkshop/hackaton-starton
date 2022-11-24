// Extended NFT Collection contract from Starton's ERC721Capped template.
// This contract allow one to mint from paper, wether with the classic public mint function
// or through a Paper-only mint function (for example for private sales, an allowlist mint...)
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@paperxyz/contracts/keyManager/IPaperKeyManager.sol";

import "./library/StartonERC721Capped.sol";

/// @title A Paper.xyz-compatible NFT collection
/// @notice Manage the mint & distribution of an NFT collection, through a private and a public sale.
/// @dev This contract inherit from the StartonERC721Capped contract from Starton's templates.
/// It has been slightly modified in order to allow inheritance, and the AccessControl roles has been ignored for the mint functions.
/// The additional features are the private sales, the Paper.xyz integration, and the payable mint.
/// See https://github.com/starton-io/smart-contract-templates
contract StartonERC721CappedPaper is StartonERC721Capped {
    using Counters for Counters.Counter;

    /// @dev This variable holds the address of the Paper.xyz Key manager.
    /// See https://docs.paper.xyz/docs/only-paper-restricted-smart-contract-functions#paperkeymanager-contract-addresses
    IPaperKeyManager _paperKeyManager;

    uint256 private _pricePerToken;

    /// @notice Contract setup function, called at deployment.
    /// @param name The name of the NFT collection
    /// @param symbol The symbol of the NFT collection
    /// @param baseUri The URI to the folder of the token's metadata. Must end with '/'
    /// @param tokenMaxSupply maximum supply (number of token) of the NFT collection
    /// @param ownerOrMultiSigContract The first owner of the contract. All role will be granted to this wallet
    /// @param pricePerToken The required amount of native token to mint one NFT
    /// @param paperKeyManagerAddress The address of the Paper.xyz Key Manager contract.
    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri,
        uint256 tokenMaxSupply,
        address ownerOrMultiSigContract,
        uint256 pricePerToken,
        address paperKeyManagerAddress
    )
        StartonERC721Capped(
            name,
            symbol,
            baseUri,
            tokenMaxSupply,
            ownerOrMultiSigContract
        )
    {
        _paperKeyManager = IPaperKeyManager(paperKeyManagerAddress);
        _pricePerToken = pricePerToken;
    }

    /// @dev Restrict a function to Paper.xyz's wallets
    /// see https://docs.paper.xyz/docs/only-paper-restricted-smart-contract-functions
    modifier onlyPaper(
        bytes32 _hash,
        bytes32 nonce,
        bytes calldata signature
    ) {
        bool success = _paperKeyManager.verify(_hash, nonce, signature);
        require(success, "Failed to verify signature");
        _;
    }

    /// @notice Register a wallet to the Paper.xyz Key Manager contract (admin only)
    /// see https://docs.paper.xyz/docs/only-paper-restricted-smart-contract-functions
    function registerPaperKey(address paperKey) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only Admin can register a PaperKeyManager Token."
        );
        require(_paperKeyManager.register(paperKey), "Error registering key");
    }

    /// @return the Price of one NFT mint
    function getPricePerToken() public view returns (uint256) {
        return _pricePerToken;
    }

    /// @notice Private sale mint function. Mint one NFT and send it to the wallet recipient.
    /// @dev This function is restricted to Paper.xyz.
    /// See https://docs.paper.xyz/docs/only-paper-restricted-smart-contract-functions
    /// @param to the wallet that will mint the token
    /// @param nonce reserved to Paper.xyz
    /// @param signature reserved to Paper.xyz
    function mintToPaper(
        address to,
        bytes32 nonce,
        bytes calldata signature
    ) external payable onlyPaper(keccak256(abi.encode(to)), nonce, signature) {
        uint256 ts = _tokenIdCounter.current();
        require(_isMintAllowed);
        require(ts < _maxSupply, "maxSupply: reached");
        require(msg.value == _pricePerToken, "Invalid value send");

        _tokenIdCounter.increment();
        _safeMint(to, ts);
    }

    /// @notice Paper.xyz eligibility function for both sales.
    /// @dev This function is restricted to Paper.xyz.
    /// @return an empty string if the mint is authorized, an error string otherwise.
    function mintWithPaperEligibility() external view returns (string memory) {
        if (_isMintAllowed == false) {
            return "Sale is not active";
        } else if (_tokenIdCounter.current() >= _maxSupply) {
            return "Purchase would exceed max tokens";
        } else {
            return "";
        }
    }

    /// @notice Public sale mint function. Mint one NFT and send it to the wallet recipient.
    /// @dev This function override the safeMint() function from StartonERC721Capped
    /// @param to the wallet that will mint the token
    function safeMint(address to) public payable override {
        uint256 ts = _tokenIdCounter.current();
        require(_isMintAllowed);
        require(ts < _maxSupply, "maxSupply: reached");
        require(msg.value == _pricePerToken, "Invalid value send");

        _tokenIdCounter.increment();
        _safeMint(to, ts);
    }

    /// @notice Retrieve all the funds from this contract.
    /// @param to the address that will receive the funds.
    function withdraw(address payable to) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender));

        uint256 balance = address(this).balance;
        Address.sendValue(to, balance);
    }
}
