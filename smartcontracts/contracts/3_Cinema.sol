// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./2_CVGToken.sol";

/// @title An implementation of managing movie theatres on blockchain
/// @author Burak Alaydın
/// @notice 
/// @dev 
/// @custom:disclaimer This contract is made for learning purposes
contract Cinema is Ownable {
    CVGToken private token;

    uint private ETHBalance;

    constructor(address _token) Ownable() {
        token = CVGToken(_token);
    }

    struct Theatre {
        string name;
        string location;
        uint ticketPriceInCVG;
        uint theatreBalance;    // Each theatre keeps their own balance so profit analysis can be made
        MovieSaloon[] movieSaloons;
    }
    Theatre[] public Theatres;
    event NewTheatreAdded(uint id, string name, string indexed location);
    event TheatreRemoved(uint id, string name, string indexed location);
    event TicketPriceUpdated(uint id, string name, uint oldPrice, uint indexed updatedPrice);
    event TicketBought(address indexed buyer, uint id, string name, uint ticketAmount, uint price);
    event WithdrewCVG(uint indexed id, uint amount);

    struct MovieSaloon {
        uint id;
        uint numberOfSeats;
        uint numberOfAvailableSeats;
    }

    modifier checkTheatreExists(uint _theatreId) {
        require(Theatres.length > _theatreId && _theatreId >= 0, "No such theatre exists");
        _;
    }
    modifier checkSaloonExists(uint _theatreId, uint _saloonId) {
        require(Theatres[_theatreId].movieSaloons.length > _saloonId && _saloonId >= 0, "No such saloon exists");
        _;
    }

    function getTheatres() public view returns (Theatre[] memory) {
        return Theatres;
    }

    function getSaloons(uint theatreId) public view checkTheatreExists(theatreId) returns (MovieSaloon[] memory) {
        return Theatres[theatreId].movieSaloons;
    }

    /// @notice Adds a new theatre to the system
    function addTheatre(string memory name, string memory location, uint price) external {
        Theatre storage newTheatre = Theatres.push();
        newTheatre.name = name;
        newTheatre.location = location;
        newTheatre.ticketPriceInCVG = price * (10 ** token.decimals());
        emit NewTheatreAdded(Theatres.length - 1, name, location);
    }

    /// @notice removes the theatre with the given ID from the system
    /// @dev changes the content of Theatres[`theatreId`] with the last item. Then, pops the last item
    function removeTheatre(uint theatreId) external checkTheatreExists(theatreId) {
        Theatre memory remove = Theatres[theatreId];
        Theatres[theatreId] = Theatres[Theatres.length - 1];
        Theatres.pop();
        emit TheatreRemoved(theatreId, remove.name, remove.location);
    }

    /// @notice Updates ticket prices for a particular theatre. No need for decimals
    function updateTicketPrice(uint theatreId, uint price) external checkTheatreExists(theatreId) onlyOwner {
        require(price > 0, "Price cannot be negative");
        Theatre storage updatedTheatre = Theatres[theatreId];
        uint previousPrice = updatedTheatre.ticketPriceInCVG;
        updatedTheatre.ticketPriceInCVG = price * (10 ** token.decimals());
        emit TicketPriceUpdated(theatreId, updatedTheatre.name, previousPrice, price);
    }

    /// @notice Adds a movie saloon to the theatre with the given ID
    function addMovieSaloon(uint theatreId, uint numberOfSeats) external checkTheatreExists(theatreId) {
        Theatre storage updatedTheatre = Theatres[theatreId];
        uint newSaloonId = updatedTheatre.movieSaloons.length;

        updatedTheatre.movieSaloons.push(MovieSaloon(newSaloonId, numberOfSeats, numberOfSeats));
    }

    /// @notice removes the theatre with the given ID from the system
    /// @dev changes the content of Theatres[`_theatreId`].movieSaloons[`_saloonId`] with the last item. Then, pops the last item
    function removeSaloon(uint theatreId, uint saloonId) external checkTheatreExists(theatreId) checkSaloonExists(theatreId, saloonId) {
        Theatre storage updatedTheatre = Theatres[theatreId];
        uint currentNumberOfSaloons = updatedTheatre.movieSaloons.length;

        updatedTheatre.movieSaloons[saloonId] = updatedTheatre.movieSaloons[currentNumberOfSaloons - 1];
        updatedTheatre.movieSaloons[saloonId].id = saloonId;
        updatedTheatre.movieSaloons.pop();
    }

    /// @notice calculates total price for given amount of tickets
    /// @dev 3% discount is applied
    /// @return price with decimals
    function getTotalPrice(uint theatreId, uint amount) public view returns (uint) {
        require(amount > 0, "Ticket amount must be bigger than 0");
        return (Theatres[theatreId].ticketPriceInCVG / 100) * 97 * amount;
    }

    /// @notice Allows ticket selling in exchange of CVG tokens
    /// @dev Increases theatre balance if the CVG token transfer process is completed successfully
    /// @return true if transaction is not reverted until the end of the function
    function sellTicket(uint _theatreId, uint _saloonId, uint _ticketAmount) external 
        checkTheatreExists(_theatreId) 
        checkSaloonExists(_theatreId, _saloonId) returns (bool) {
        uint totalPrice = getTotalPrice(_theatreId, _ticketAmount);

        Theatre storage updatedTheatre = Theatres[_theatreId];

        bool sent = token.transferFrom(msg.sender, address(this), totalPrice);
        require(sent, "There was a problem during buying process");
        
        updatedTheatre.theatreBalance += totalPrice;

        emit TicketBought(tx.origin, _theatreId, updatedTheatre.name, _ticketAmount, totalPrice);
        return true;
    }

    /// @notice Withdraws all theatre balances to owner's address. Only the owner can call the function
    /// @dev emits all the sucessful withdrawals
    function withdrawBalances() public onlyOwner {
        for(uint i = 0; i < Theatres.length; i++) {
            uint amount = Theatres[i].theatreBalance;
            if(amount <= 0) {
                continue;
            }

            Theatres[i].theatreBalance = 0;

            bool sent = token.transfer(owner(),amount);
            require(sent, "Withdraw failed");

            emit WithdrewCVG(i, Theatres[i].theatreBalance);
        }
    }

    function withdrawETH(address payable to, uint amount) public payable onlyOwner {
        require(amount < ETHBalance && amount > 0, "Insufficient balance");
        to.transfer(amount);
    }

    receive() external payable {
        ETHBalance += msg.value;
    }
}