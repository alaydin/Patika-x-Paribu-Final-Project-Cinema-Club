//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title NFT contract for cinema club membership
/// @author Burak Alaydın
/// @notice This contract allows users to mint new NFTs with a collection name "ParibuNFT"
/// @dev 
/// @custom:disclaimer This contract is made for learning purposes
contract ParibuNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("ParibuNFT", "PAR") {}

    /// @notice Mints a new NFT to the given address
    /// @dev
    /// @param recipient Will be the owner of freshly minted NFT
    /// @param tokenURI IPFS hashed CID
    /// @return ID of the minted NFT
    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
