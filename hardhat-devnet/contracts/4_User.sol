// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./1_ParibuNFT.sol";
import "./2_CVGToken.sol";
import "./3_Cinema.sol";

// address constant USDC_ADDRESS = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F; // Could be any 

/// @title User side implementation of fiat currency deposit and ticket purchase
/// @author Burak Alaydın
/** @notice This contract allows users to mint CVG token in exchange for fiat currency at 1:1 rate
*** Users can also buy tickets or refund their deposits
**/
/** @dev The contract does not hold CVG and mints it for the users instead of transfering
*** It's to prevent cases when the contract becomes insolvent
*** The contract makes calls to CVGToken and Cinema contracts
**/
/// @custom:disclaimer This contract is made for learning purposes
contract User is Ownable {
    ParibuNFT private nft;
    CVGToken private token;
    Cinema private cinema;
    ERC20 public fiat;

    uint private fiatBalance; 
    uint private CVGBalance;
    uint private ETHBalance;

    bool mutex = false;

    constructor(address _nft,address _token, address _fiat, address payable _cinema) {
        nft = ParibuNFT(_nft);
        token = CVGToken(_token);
        fiat = ERC20(_fiat);
        cinema = Cinema(_cinema);
    }

    /// @dev The following set methods can be used in case the dependent contract address changes
    function setToken(address _token) public onlyOwner {
        token = CVGToken(_token);
    }

    function setNft(address _nft) public onlyOwner {
        nft = ParibuNFT(_nft);
    }

    function setCinema(address payable _cinema) public onlyOwner {
        cinema = Cinema(_cinema);
    }

    function setFiat(address _fiat) public onlyOwner {
        fiat = ERC20(_fiat);
    }

    struct S_User {
        uint seenMovieCount;
        uint totalPurchase;
        uint totalSpent;
        uint inActiveAmount;
        uint lastPurchaseDate;
        bool hasSpentSinceLastPurchase;
        Rank userRank;
    }
    enum Rank {
        Novice,
        Casual,
        MovieExpert
    }
    mapping(address => S_User) public addressToUser;

    event deposited(address indexed caller, uint amount, uint indexed date);
    event refunded(address indexed caller, uint amount);
    event fiatWithdrawal(address indexed to, uint amount);
    event CVGWithdrawal(address indexed to, uint amount);

    function getUser(address user) external view returns (S_User memory) {
        return addressToUser[user];
    }

    function getFiatBalance() public view returns (uint) {
        return fiatBalance;
    }

    function getETHBalance() public view returns (uint) {
        return ETHBalance;
    }

    function getCVGBalance() public view returns (uint) {
        return CVGBalance;
    }

    function _fiatTransfer(uint256 amount) internal {
        bool sent = fiat.transferFrom(msg.sender, address(this), amount);
        require(sent, "There was a problem sending fiat currency");
        fiatBalance += amount;
    }

    function _tokenPurchase(uint amount) internal {
        S_User storage updatedUser = addressToUser[msg.sender];
        updatedUser.totalPurchase += amount;
        updatedUser.hasSpentSinceLastPurchase = false;
        updatedUser.inActiveAmount += amount;
        updatedUser.lastPurchaseDate = block.timestamp;
    }

    /// @notice Transfers 10 fiat currency from user to the contract in return of CVG at 1:1 rate.
    /// @dev The transfer amount is hardcoded instead of taken as parameter since the actual implementation of "CVG Para" works the same way.
    function mint10CVG() external {
        uint amount = 10 * (10**6);
        _fiatTransfer(amount);
        token.mintToken(msg.sender, amount);
        _tokenPurchase(amount);
        emit deposited(msg.sender, 10, block.timestamp);
    }

    /// @notice Transfers 20 fiat currency from user to the contract in return of CVG at 1:1 rate.
    function mint20CVG() external {
        uint amount = 20 * (10**6);
        _fiatTransfer(amount);
        token.mintToken(msg.sender, amount);
        _tokenPurchase(amount);
        emit deposited(msg.sender, 20, block.timestamp);
    }

    /// @notice Transfers 30 fiat currency from user to the contract in return of CVG at 1:1 rate.
    function mint30CVG() external {
        uint amount = 30 * (10**6);
        _fiatTransfer(amount);
        token.mintToken(msg.sender, amount);
        _tokenPurchase(amount);
        emit deposited(msg.sender, 30, block.timestamp);
    }

    // Ranks up according to User.seenMovieCount
    function _rankUp(uint movieCount) internal pure returns (Rank) {
        if(movieCount < 10) {
            return Rank.Novice;
        }
        else if (movieCount < 30) {
            return Rank.Casual;
        }
        else {
            return Rank.MovieExpert;
        }
    }

    /// @notice updates the user after ticket purchase
    function _ticketBought(uint totalPrice) internal returns (bool) {
        S_User storage updatedUser = addressToUser[msg.sender];
        updatedUser.seenMovieCount++;
        updatedUser.totalSpent += totalPrice;
        updatedUser.hasSpentSinceLastPurchase = true;
        updatedUser.inActiveAmount = 0;
        updatedUser.userRank = _rankUp(updatedUser.seenMovieCount);
        return updatedUser.hasSpentSinceLastPurchase;
    }

    /// @notice Buys the given amount of tickets for the user
    /** @dev Makes a call to cinema contract, causes storages changes on both User and Cinema contracts
    *** This contract acts as an escrow between Cinema contract and the user for security purposes
    *** Mutex added (might be unnecessary)
    *** First, get total price for tickets
    *** Then, transfer CVG from user to this contract
    *** Approve Cinema contract as spender
    *** Call Cinema.sellTicket()
    *** finally, unlock and make an internal call to change User(`msg.sender`)
    **/
    /// @return hasSpentSinceLastPurchase as an approval for storage changes for the user
    function ticketBuy(uint cinemaId, uint saloonId, uint ticketAmount) external returns (bool) {
        require(ticketAmount > 0, "Ticket amount must be more than 0");

        uint totalPrice = 0;
        if(nft._hasNFT(msg.sender)) {
            totalPrice = cinema.getDiscountedTotalPrice(cinemaId, ticketAmount);
        }
        else {
            totalPrice = cinema.getTotalPrice(cinemaId, ticketAmount);
        }

        // Check if the function is locked, if not, continue and lock
        require(!mutex, "Locked");
        mutex = true;

        // Transfer user CVGs to this contract
        bool sent = token.transferFrom(msg.sender, address(this), totalPrice);
        require(sent, "There was a problem during escrow deposit process");

        // Approve cinema contract as spender for CVG tokens
        bool approved = token.approve(address(cinema), totalPrice);
        require(approved, "Token approval failed");

        // Send tokens to cinema contract via its function sellTicket()
        sent = cinema.sellTicket(cinemaId, saloonId, ticketAmount, totalPrice);
        require(sent, "There was a problem during escrow transfer process");

        // Unlock
        mutex = false;

        return _ticketBought(totalPrice);
    }

    /// @notice Refunds the last purchase of user if it meets the conditions
    /** @dev I have seen the concerns about potential manipulation of block.timestamp by the miners.
    *** Users should not be able to request for refund if they spent tokens after their last purchase/mint.
    *** Before the transfer process, equalizes the last purchase date to 0 and decreases the user's inactive deposit amount.
    *** Transfers CVG tokens from user to this contract
    *** Increases CVG balance of the contract
    *** Sends fiat back to user
    **/
    function refund(uint amount) external returns (bool) {
        S_User storage user = addressToUser[msg.sender];
        uint lastPurchase = user.lastPurchaseDate;
        uint inActiveAmount = user.inActiveAmount;

        require(block.timestamp < lastPurchase + 30 days, "It's been more than 30 days since your last purchase");
        require(!user.hasSpentSinceLastPurchase, "You have spent some or all of your tokens after your last purchase");
        require(inActiveAmount >= amount, "You cannot request to refund more than you have right to do");

        user.inActiveAmount -= amount;
        user.totalPurchase -= amount;
        if(inActiveAmount <= 0) {
            user.lastPurchaseDate = 0;
        }

        bool sent = token.transferFrom(msg.sender, address(this), amount);
        require(sent, "CVG transfer for refund process had some issues");

        CVGBalance += amount;
        fiatBalance -= amount;

        sent = fiat.transfer(msg.sender, amount);
        require(sent, "fiat transfer for refund process had some issues");

        emit refunded(msg.sender, amount);
        return true;
    }

    /// @notice Withdraws the given amount from fiat balance of the contract to given address
    /// @dev Only the contract owner can withdraw. Could be improved by Access Control
    function withdrawFiat(address to, uint amount) public onlyOwner returns (bool) {
        require(amount <= fiatBalance, "Insufficient Balance");

        fiatBalance -= amount;

        bool sent = fiat.transfer(to, amount);
        require(sent, "Could not withdraw fiat");

        emit fiatWithdrawal(to, amount);
        return true;
    }

    /// @notice Withdraws the given amount from CVG balance of the contract to given address
    /// @dev Only the contract owner can withdraw. Could be improved by Access Control
    function withdrawCVG(address to, uint amount) public onlyOwner returns (bool) {
        require(amount <= CVGBalance, "Insufficient Balance");

        CVGBalance -= amount;

        bool sent = token.transfer(to, amount);
        require(sent, "Could not withdraw CVG");

        emit CVGWithdrawal(to, amount);
        return true;
    }

    function withdrawETH(address payable to, uint amount) public payable onlyOwner {
        require(amount < ETHBalance && amount > 0, "Insufficient balance");
        to.transfer(amount);
    }

    receive() external payable {
        ETHBalance += msg.value;
    }
}