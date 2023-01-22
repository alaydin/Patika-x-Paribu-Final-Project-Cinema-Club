// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../node_modules/@openzeppelin/contracts/access/AccessControl.sol";

/// @title Token contract for "CGV Para"
/// @author Burak Alaydın
/// @notice Creates a new ERC20 token which will be used for ticket purchases
/// @dev 
/// @custom:disclaimer This contract is made for learning purposes
contract CGVToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @dev grants admin and minter role to `msg.sender`
    constructor() ERC20("CGV Para", "CGV") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Decides the number of decimals for the token. Aligns with the USDC's decimal number.
    /// @dev Overrides original OpenZeppelin ERC20 contract's decimal() function
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    /// @notice Mints the given amount of new tokens to the address
    /// @dev Only `MINTER_ROLE` can mint new tokens
    function mintToken(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}