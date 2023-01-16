//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title NFT contract for cinema club membership
/// @author Burak Alaydın
/// @notice This contract allows users to mint new NFTs with a collection name "ParibuNFT"
/// @dev 
/// @custom:disclaimer This contract is made for learning purposes
contract ParibuNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => bool) hasNFT;

    constructor() ERC721("ParibuNFT", "PAR") {}

    /// @notice Mints a new NFT to the given address
    /// @dev A caller who has already minted an NFT should not be able to mint again
    /// @param recipient Will be the owner of freshly minted NFT
    /// @param _tokenURI IPFS hashed CID
    /// @return ID of the minted NFT
    function mintNFT(address recipient, string memory _tokenURI)
        public
        returns (uint256)
    {
        require(!_hasNFT(msg.sender), "You are already a member");

        hasNFT[msg.sender] = true;

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        return newItemId;
    }

    function _hasNFT(address checkedAddress) public view returns (bool) {
        return hasNFT[checkedAddress];
    }
}
