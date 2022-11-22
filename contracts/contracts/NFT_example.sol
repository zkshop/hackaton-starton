/**
 * Example Contract with Paper.xyz integration
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@paperxyz/contracts/keyManager/IPaperKeyManager.sol";

contract NFT_example is ERC721, Ownable {
    using Counters for Counters.Counter;
    IPaperKeyManager paperKeyManager;

    bool public isAllowListActive = false;
    bool public isPublicSaleActive = false;

    uint256 public constant MAX_SUPPLY = 1000;
    mapping(address => bool) public hasMinted;

    string private _baseTokenURI;
    string private _contractURI;
    Counters.Counter private _tokenSupply;

    constructor(
        string memory baseTokenURI_,
        string memory contractURI_,
        address _paperKeyManagerAddress
    ) ERC721("NFT Paper Test", "NFTPT") {
        _baseTokenURI = baseTokenURI_;
        _contractURI = contractURI_;
        paperKeyManager = IPaperKeyManager(_paperKeyManagerAddress);
    }

    // onlyPaper modifier to easily restrict multiple different function
    modifier onlyPaper(
        bytes32 _hash,
        bytes32 _nonce,
        bytes calldata _signature
    ) {
        bool success = paperKeyManager.verify(_hash, _nonce, _signature);
        require(success, "Failed to verify signature");
        _;
    }

    function registerPaperKey(address _paperKey) external onlyOwner {
        require(paperKeyManager.register(_paperKey), "Error registering key");
    }

    function totalSupply() public view returns (uint256) {
        return _tokenSupply.current();
    }

    // reserved NFTs for the admin
    // NB: some checks are deactivated for gas optimization.
    function reserve(address to, uint256 quantity) external onlyOwner {
        uint256 ts = _tokenSupply.current();
        uint256 i;

        require(ts + quantity <= MAX_SUPPLY, "Reserve would exceed max tokens");
        for (i = 0; i < quantity; i++) {
            _tokenSupply.increment();
            _safeMint(to, _tokenSupply.current());
        }
    }

    function setAllowListActive(bool isAllowListActive_) external onlyOwner {
        isAllowListActive = isAllowListActive_;
    }

    // Paper.xyz only function
    function mintToAllowList(
        address to,
        bytes32 _nonce,
        bytes calldata _signature
    ) external onlyPaper(keccak256(abi.encode(to)), _nonce, _signature) {
        require(isAllowListActive, "Allow list sale is not active");
        require(
            hasMinted[to] == false,
            "Recipient address has already minted a token"
        );

        uint256 ts = _tokenSupply.current();
        require(ts + 1 <= MAX_SUPPLY, "Purchase would exceed max tokens");

        _tokenSupply.increment();
        hasMinted[to] = true;
        _safeMint(to, _tokenSupply.current());
    }

    // Paper.xyz eligibility function for MintToAllowList()
    function mintToAllowListEligibility(address to)
        external
        view
        returns (string memory)
    {
        if (isAllowListActive == false) {
            return "Allow list sale is not active";
        } else if (hasMinted[to] == true) {
            return "Recipient address has already minted a token";
        } else if (_tokenSupply.current() >= MAX_SUPPLY) {
            return "Purchase would exceed max tokens";
        } else {
            return "";
        }
    }

    function setPublicSaleActive(bool isPublicSaleActive_) external onlyOwner {
        isPublicSaleActive = isPublicSaleActive_;
    }

    function mintTo(address to) external {
        require(isPublicSaleActive, "Public sale is not active");
        require(
            hasMinted[to] == false,
            "Recipient address has already minted a token"
        );

        uint256 ts = _tokenSupply.current();
        require(ts + 1 <= MAX_SUPPLY, "Purchase would exceed max tokens");

        _tokenSupply.increment();
        hasMinted[to] = true;
        _safeMint(to, _tokenSupply.current());
    }

    // Paper.xyz eligibility function for MintTo()
    function mintToEligibility(address to)
        external
        view
        returns (string memory)
    {
        if (isPublicSaleActive == false) {
            return "Public list sale is not active";
        } else if (hasMinted[to] == true) {
            return "Recipient address has already minted a token";
        } else if (_tokenSupply.current() >= MAX_SUPPLY) {
            return "Purchase would exceed max tokens";
        } else {
            return "";
        }
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function setContractURI(string memory contractURI_) external onlyOwner {
        _contractURI = contractURI_;
    }

    /**
     * Override of the _baseURI (used in OpenZeppelin's ERC721 contract).
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * Optional override of OpenZeppelin's ERC721 contract for modifying the token URI before return.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        string memory uri = super.tokenURI(tokenId);
        return
            bytes(uri).length > 0 ? string(abi.encodePacked(uri, ".json")) : "";
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
}
