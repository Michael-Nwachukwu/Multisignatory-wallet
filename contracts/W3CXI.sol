// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Web3CXI is ERC20("WEB3CXI Token", "WCXI") {
    address public owner;

    constructor() {
        owner = msg.sender;
        _mint(msg.sender, 100000e18);
    }

    function mint(uint _amount) external {
        require(msg.sender == owner, "you are not owner");
        _mint(msg.sender, _amount * 1e18);
    }
}

/**
 * 
 * struct QuorumStruct {
        uint256 id;
        address sender;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApprovals;
        address[] signers;
    }


    function updateQuorum(uint8 _newQuorum) external {

        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (!isValidSigner[msg.sender]) revert UserNotSigner();
        require(_newQuorum > 1, "quorum too small");
        require(quorum <= noOfValidSigners, "Quorum should be less than valid signers");

        uint256 _txId = txCount + 1;

        hasSigned[msg.sender][_txId] = true;

        txCount++;

        // quorum = _quorum;
    }
 */