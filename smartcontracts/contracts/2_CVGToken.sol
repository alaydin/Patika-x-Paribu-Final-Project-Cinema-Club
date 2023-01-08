// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @title Token contract for "CVG Para"
/// @author Burak Alaydın
/// @notice Creates a new ERC20 token which will be used for ticket purchases
/// @dev 
/// @custom:disclaimer This contract is made for learning purposes
contract CVGToken is ERC20, ERC20Burnable {
    constructor() ERC20("CVG Para", "CVG") {}

    /// @notice Decides the number of decimals for the token. Aligns with the USDC's decimal number.
    /// @dev Overrides original OpenZeppelin ERC20 contract's decimal() function
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    /// @notice Mints the given amount of new tokens to the address
    function mintToken(address to, uint256 amount) public {
        _mint(to, amount);
    }
}