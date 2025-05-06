// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public admin;
    address[] public participants;
    uint public ticketPrice;
    bool public isDrawDone;
    address public winner;

    constructor(uint _ticketPrice) {
        admin = msg.sender;
        ticketPrice = _ticketPrice;
        isDrawDone = false;
    }

    function buyTicket() public payable {
        require(!isDrawDone, "Draw already done");
        require(msg.value == ticketPrice, "Incorrect ticket price");
        participants.push(msg.sender);
    }

    function drawWinner() public {
        require(msg.sender == admin, "Only admin can draw");
        require(!isDrawDone, "Draw already done");
        require(participants.length > 0, "No participants");

        uint random = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, participants.length))) % participants.length;
        winner = participants[random];
        isDrawDone = true;
    }

    function distributePrize() public {
        require(msg.sender == admin, "Only admin can distribute");
        require(isDrawDone, "Draw not done yet");
        require(winner != address(0), "No winner selected");
        payable(winner).transfer(address(this).balance);
    }

    function resetLottery() public {
        require(msg.sender == admin, "Only admin can reset");
        require(isDrawDone, "Draw not done yet");
        participants = new address[](0);
        isDrawDone = false;
        winner = address(0);
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }

    function getPrizePool() public view returns (uint) {
        return address(this).balance;
    }
}